import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { migrate } from "../scripts/migrations.mjs";
import { contentStore } from "../src/lib/content-store.mjs";
import { collections } from "../src/lib/content-schema.mjs";
import { authStore, hashPassword, verifyPassword, hashToken, loginAccountKey } from "../src/lib/auth-core.mjs";
import { checkMutation, readJson } from "../src/lib/admin-http.mjs";

let db, content, auth;
const password = "test-only-long-passphrase-92!";
before(async () => {
  db = new PGlite();
  await migrate(db);
  content = contentStore(db);
  auth = authStore(db);
});
after(async () => { await db?.close(); });

test("migrations preserve all original content and do not reset later edits", async () => {
  for (const [name, count] of Object.entries({ projects: 6, education: 2, experiences: 2, nonprofit: 2, technologies: 23 })) {
    const records = await content.list(name);
    assert.equal(records.length, count);
    for (const { id, version, ...record } of records) {
      assert.ok(id > 0);
      assert.equal(version, 1);
      collections[name].schema.parse(record);
    }
  }
  const [entry] = await content.list("education");
  const { id, version, ...record } = entry;
  await content.save("education", { ...record, title: "Edited school" }, id, version);
  await migrate(db);
  assert.equal((await content.list("education"))[0].title, "Edited school");
  assert.equal((await content.list("projects")).length, 6);
});

test("all collections support create, update, ordering, optimistic conflict checks and delete", async () => {
  for (const name of Object.keys(collections)) {
    const [original] = await content.list(name);
    const { id: ignoredId, version: ignoredVersion, ...record } = original;
    const titleField = collections[name].titleField;
    const input = { ...record, [titleField]: "Test entry", position: 999 };
    assert.equal(await content.save(name, input), true);
    let created = (await content.list(name)).at(-1);
    assert.equal(created[titleField], "Test entry");
    assert.equal(await content.save(name, { ...input, [titleField]: "Updated" }, created.id, created.version), true);
    assert.equal(await content.save(name, input, created.id, created.version), false);
    assert.equal(await content.remove(name, created.id, created.version), false);
    created = (await content.list(name)).at(-1);
    assert.equal(created[titleField], "Updated");
    assert.equal(await content.remove(name, created.id, created.version), true);
    assert.ok(!(await content.list(name)).some((row) => row.id === created.id));
  }
});

test("table names and stored URLs are validated; content values stay parameterized", async () => {
  await assert.rejects(content.list("projects; DROP TABLE projects"));
  await assert.rejects(content.list("__proto__"));
  const { id, version, ...record } = (await content.list("projects"))[0];
  for (const url of ["javascript:alert(1)", "data:text/html,test", "//evil.example"]) {
    await assert.rejects(content.save("projects", { ...record, projectHomepage: url }));
  }
  await assert.rejects(content.save("projects", { ...record, unexpected: "field" }));
  await assert.rejects(content.save("projects", { ...record, projectImage: "/admin/private" }));
  const name = "Robert'); DROP TABLE projects;--";
  await content.save("projects", { ...record, projectName: name, position: 999 });
  const created = (await content.list("projects")).at(-1);
  assert.equal(created.projectName, name);
  await content.remove("projects", created.id, created.version);
});

test("password hashing, login, hashed sessions, revocation, idle and absolute expiry", async () => {
  await assert.rejects(hashPassword("a".repeat(8)));
  await assert.rejects(hashPassword("a".repeat(129)));
  const minimumPassword = "a".repeat(9);
  assert.equal(await verifyPassword(minimumPassword, await hashPassword(minimumPassword)), true);
  const hash = await hashPassword(password);
  assert.ok(!hash.includes(password));
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("wrong", hash), false);
  await db.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)", ["owner", hash]);
  assert.equal((await auth.login("owner", "wrong")).invalid, true);
  assert.equal((await auth.login("missing", password)).invalid, true);
  const first = await auth.login("owner", password);
  assert.equal(first.token.length, 43);
  const stored = (await db.query("SELECT token_hash FROM admin_sessions")).rows[0];
  assert.equal(stored.token_hash, hashToken(first.token));
  assert.notEqual(stored.token_hash, first.token);
  assert.ok(await auth.session(first.token));
  assert.equal(await auth.session("forged-token"), null);
  assert.equal(await auth.session("a".repeat(43)), null);
  // Advance the burst window while independently testing the session lifecycle.
  await db.query("DELETE FROM admin_rate_limits WHERE key = 'admin-login-burst'");
  const second = await auth.login("owner", password, first.token);
  assert.notEqual(second.token, first.token);
  assert.equal(await auth.session(first.token), null);
  await db.query("UPDATE admin_sessions SET last_seen_at = now() - interval '31 minutes'");
  assert.equal(await auth.session(second.token), null);
  const third = await auth.login("owner", password);
  await db.query("UPDATE admin_sessions SET expires_at = now() - interval '1 second'");
  assert.equal(await auth.session(third.token), null);
  const fourth = await auth.login("owner", password);
  await auth.logout(fourth.token);
  assert.equal(await auth.session(fourth.token), null);
  await db.query("DELETE FROM admin_rate_limits WHERE key = 'admin-login-burst'");
  const fifth = await auth.login("owner", password);
  await db.query("DELETE FROM admin_users WHERE username = 'owner'");
  assert.equal(await auth.session(fifth.token), null);
});

test("login rate limit persists across instances and rejects concurrent excess attempts", async () => {
  await db.query("DELETE FROM admin_rate_limits");
  const results = await Promise.all(Array.from({ length: 15 }, () => authStore(db).consumeLimit("admin-login", 10, 900)));
  assert.equal(results.filter(Boolean).length, 10);
  const limited = await auth.login("owner", password);
  assert.equal(limited.limited, true);
  assert.ok(limited.retryAfter > 0 && limited.retryAfter <= 900);
  await db.query("UPDATE admin_rate_limits SET reset_at = now() - interval '1 second'");
  assert.equal(await auth.consumeLimit("admin-login", 10, 900), true);
});

test("burst and account budgets block before credential queries and do not extend the lockout", async () => {
  await db.query("DELETE FROM admin_rate_limits");
  await Promise.all(Array.from({ length: 3 }, () => auth.consumeRate("admin-login-burst", 3, 60)));
  let credentialQueries = 0;
  const watchedAuth = authStore({ async query(sql, args) {
    if (sql.includes("SELECT id, password_hash")) credentialQueries++;
    return db.query(sql, args);
  } });
  const blocked = await watchedAuth.login("unknown", "wrong");
  assert.equal(blocked.limited, true);
  assert.ok(blocked.retryAfter > 0 && blocked.retryAfter <= 60);
  assert.equal(credentialQueries, 0);
  await db.query("DELETE FROM admin_rate_limits");
  for (let attempt = 0; attempt < 5; attempt++) await auth.consumeRate(loginAccountKey("Owner"), 5, 900);
  const initial = (await db.query("SELECT reset_at FROM admin_rate_limits WHERE key = $1", [loginAccountKey("owner")])).rows[0].reset_at;
  const accountBlocked = await watchedAuth.login("OWNER", "wrong");
  assert.equal(accountBlocked.limited, true);
  assert.equal(credentialQueries, 0);
  const final = (await db.query("SELECT reset_at FROM admin_rate_limits WHERE key = $1", [loginAccountKey("owner")])).rows[0].reset_at;
  assert.deepEqual(final, initial);
  await db.query("UPDATE admin_rate_limits SET reset_at = now() - interval '1 second'");
  assert.equal((await watchedAuth.login("owner", "wrong")).invalid, true);
  assert.equal(credentialQueries, 1);
});

test("database failure cannot bypass login throttling", async () => {
  const unavailable = authStore({ async query() { throw new Error("Database unavailable"); } });
  await assert.rejects(unavailable.login("owner", password), /Database unavailable/);
});

test("mutations reject missing, null and foreign origins and simple cross-site forms", () => {
  const headers = { origin: "https://alexanderhellsten.se", "content-type": "application/json", "x-admin-request": "1", "sec-fetch-site": "same-origin" };
  const make = (changes = {}) => new Request("https://alexanderhellsten.se/api/admin/login", { method: "POST", headers: { ...headers, ...changes }, body: "{}" });
  assert.doesNotThrow(() => checkMutation(make(), "https://alexanderhellsten.se"));
  for (const origin of ["null", "", "https://evil.example", "https://alexanderhellsten.se.evil.example"]) {
    assert.throws(() => checkMutation(make({ origin }), "https://alexanderhellsten.se"), { status: 403 });
  }
  assert.throws(() => checkMutation(make({ "x-admin-request": "" }), "https://alexanderhellsten.se"), { status: 403 });
  assert.throws(() => checkMutation(make({ "sec-fetch-site": "cross-site" }), "https://alexanderhellsten.se"), { status: 403 });
  assert.throws(() => checkMutation(make({ "content-type": "application/x-www-form-urlencoded" }), "https://alexanderhellsten.se"), { status: 415 });
});

test("request parser rejects invalid JSON and oversized bodies even without Content-Length", async () => {
  const request = (body) => new Request("https://example.com", { method: "POST", body });
  assert.deepEqual(await readJson(request('{"ok":true}')), { ok: true });
  await assert.rejects(readJson(request("{")), { status: 400 });
  await assert.rejects(readJson(request("x".repeat(5000)), 2048), { status: 413 });
});
