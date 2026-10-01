import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { readFile, readdir, access } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import pg from "pg";
import { hashPassword } from "../src/lib/auth-core.mjs";
import { collections } from "../src/lib/content-schema.mjs";
import sharp from "sharp";

// Catch the external-package packaging regression before starting a server that
// could otherwise resolve missing deployment files from local node_modules.
const tracePath = ".next/server/app/page.js.nft.json";
const trace = JSON.parse(await readFile(tracePath, "utf8"));
assert.ok(trace.files.some((file) => file.endsWith("node_modules/pg/package.json")), "Postgres is missing from the deployment trace");
for (const file of trace.files.filter((file) => /node_modules\/pg\/|db\/migrations\//.test(file))) {
  await access(path.resolve(path.dirname(tracePath), file));
}
async function checkServerImports(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await checkServerImports(filename);
    else if (entry.name.endsWith(".js")) {
      assert.ok(!/\bpg-[a-f0-9]{16}\b/.test(await readFile(filename, "utf8")), "Production build contains a hashed pg external import");
    }
  }
}
await checkServerImports(".next/server");

// This fixture never uses DATABASE_URL from your environment or existing data.
const db = await PGlite.create();
const socket = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 15439, maxConnections: 8 });
const origin = "https://admin-test.example";
const base = "http://127.0.0.1:3107";
const password = randomBytes(24).toString("base64url");
let app;
let output = "";
let cookie = "";
let fixturePool;

async function request(path, { method = "GET", body, rawBody, authenticated = false, headers = {} } = {}) {
  return fetch(base + path, {
    method, redirect: "manual", signal: AbortSignal.timeout(20000),
    headers: { origin, "Content-Type": "application/json", "X-Admin-Request": "1", "Sec-Fetch-Site": "same-origin", ...(authenticated ? { cookie } : {}), ...headers },
    ...(rawBody !== undefined ? { body: rawBody } : body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

try {
  await socket.start();
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3107"], {
    windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production", APP_ORIGIN: origin, DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:15439/postgres" },
  });
  app.stdout.on("data", (chunk) => { output += chunk.toString(); });
  app.stderr.on("data", (chunk) => { output += chunk.toString(); });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (app.exitCode !== null) throw new Error("Next.js exited before readiness.");
    if (output.includes("Ready in")) { ready = true; break; }
    await delay(250);
  }
  assert.ok(ready, "Next.js did not become ready");

  // The real production application must bootstrap the entirely empty database.
  const firstPage = await request("/projects");
  assert.equal(firstPage.status, 200);
  assert.ok((await firstPage.text()).includes("Backpack Keybinds"));
  fixturePool = new pg.Pool({ connectionString: "postgresql://postgres:postgres@127.0.0.1:15439/postgres", max: 1 });
  await fixturePool.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)", ["test-admin", await hashPassword(password)]);

  const loginPage = await request("/admin", { headers: { "User-Agent": "DisobedientCrawler/1.0" } });
  assert.equal(loginPage.status, 200);
  assert.match(loginPage.headers.get("x-robots-tag"), /noindex/);
  assert.match(loginPage.headers.get("cache-control"), /no-store/);
  assert.match(loginPage.headers.get("content-security-policy"), /frame-ancestors 'none'/);
  const loginHtml = await loginPage.text();
  const nonce = loginPage.headers.get("content-security-policy").match(/'nonce-([^']+)'/)[1];
  assert.ok(loginHtml.includes(`nonce="${nonce}"`), "CSP nonce missing from rendered scripts");
  assert.match(loginHtml, /Admin sign in/);
  assert.ok(!loginHtml.includes("Portfolio admin"), "Anonymous response contains editor UI");
  assert.ok(!loginHtml.includes("password_hash"));
  for (const name of Object.keys(collections)) {
    for (const method of ["GET", "POST", "PUT", "DELETE"]) {
      const denied = await request(`/api/admin/content/${name}`, { method, ...(method === "GET" ? {} : { body: {} }), headers: { "User-Agent": "DisobedientCrawler/1.0" } });
      assert.equal(denied.status, 401, `${method} ${name} allowed an anonymous request`);
    }
  }
  assert.equal((await request("/api/admin/content/projects", { headers: { cookie: "__Host-portfolio-admin=" + "a".repeat(43) } })).status, 401);
  assert.equal((await request("/api/admin/login", { method: "POST", body: { username: "test-admin", password }, headers: { origin: "https://evil.example" } })).status, 403);
  assert.equal((await request("/api/admin/login", { method: "POST", body: { username: "test-admin", password: "wrong" } })).status, 401);
  const login = await request("/api/admin/login", { method: "POST", body: { username: "test-admin", password } });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get("set-cookie");
  assert.match(setCookie, /__Host-portfolio-admin=/);
  for (const flag of [/HttpOnly/i, /Secure/i, /SameSite=strict/i, /Path=\//i, /Max-Age=28800/i]) assert.match(setCookie, flag);
  cookie = setCookie.split(";")[0];
  const editor = await request("/admin", { authenticated: true });
  assert.match(await editor.text(), /Portfolio admin/);

  const imageBytes = await sharp({ create: { width: 48, height: 32, channels: 3, background: "#3388cc" } }).png().toBuffer();
  const imageRequest = { method: "POST", rawBody: imageBytes, headers: { "Content-Type": "image/png" } };
  assert.equal((await request("/api/admin/images", imageRequest)).status, 401);
  assert.equal((await request("/api/admin/images", { ...imageRequest, authenticated: true, headers: { ...imageRequest.headers, origin: "https://evil.example" } })).status, 403);
  assert.equal((await request("/api/admin/images", { ...imageRequest, authenticated: true, rawBody: Buffer.from("<svg>not allowed</svg>") })).status, 415);
  const upload = await request("/api/admin/images", { ...imageRequest, authenticated: true });
  assert.equal(upload.status, 201);
  const uploaded = await upload.json();
  const imageResponse = await request(uploaded.url);
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get("content-type"), "image/webp");
  assert.equal(imageResponse.headers.get("x-content-type-options"), "nosniff");
  assert.equal((await sharp(Buffer.from(await imageResponse.arrayBuffer())).metadata()).width, 48);
  assert.equal((await request("/uploads/not-a-valid-image.webp")).status, 404);
  await fixturePool.query("UPDATE admin_rate_limits SET attempts = 10 WHERE key LIKE 'upload:%'");
  const uploadLimited = await request("/api/admin/images", { ...imageRequest, authenticated: true });
  assert.equal(uploadLimited.status, 429);
  assert.ok(Number(uploadLimited.headers.get("retry-after")) > 0);
  assert.equal((await fixturePool.query("SELECT count(*)::integer AS count FROM media_images")).rows[0].count, 1);

  for (const name of Object.keys(collections)) {
    const list = await request(`/api/admin/content/${name}`, { authenticated: true });
    assert.equal(list.status, 200);
    const { id: ignoredId, version: ignoredVersion, ...record } = (await list.json()).records[0];
    const titleField = collections[name].titleField;
    if (name === "projects") record.projectImage = uploaded.url;
    record[titleField] = `HTTP verification ${name}`;
    record.position = 999;
    const created = await request(`/api/admin/content/${name}`, { authenticated: true, method: "POST", body: { record } });
    assert.equal(created.status, 200, `Create failed for ${name}`);
    let row = (await created.json()).records.at(-1);
    record[titleField] += " edited";
    const updated = await request(`/api/admin/content/${name}`, { authenticated: true, method: "PUT", body: { id: row.id, version: row.version, record } });
    assert.equal(updated.status, 200, `Update failed for ${name}`);
    const stale = await request(`/api/admin/content/${name}`, { authenticated: true, method: "DELETE", body: { id: row.id, version: row.version } });
    assert.equal(stale.status, 409);
    row = (await updated.json()).records.at(-1);
    const page = name === "projects" ? "/projects" : "/resume";
    const publicPage = await request(page);
    assert.equal(publicPage.status, 200);
    const publicHtml = await publicPage.text();
    assert.ok(publicHtml.includes(record[titleField]), `${name} update missing from public page`);
    if (name === "projects") assert.ok(publicHtml.includes(uploaded.url), "Uploaded image missing from public project");
    const removed = await request(`/api/admin/content/${name}`, { authenticated: true, method: "DELETE", body: { id: row.id, version: row.version } });
    assert.equal(removed.status, 200);
  }
  for (const path of ["/", "/projects", "/resume", "/resume/view/pdf", "/resume/view/printout", "/contact"]) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} failed`);
    assert.match(await response.text(), /<title>/);
  }
  const robots = await (await request("/robots.txt")).text();
  assert.match(robots, /Disallow: \/admin/);
  assert.ok(!(await (await request("/sitemap.xml")).text()).includes("/admin"));
  assert.equal((await request("/api/admin/logout", { authenticated: true, method: "POST", body: {} })).status, 200);
  assert.equal((await request("/api/admin/content/projects", { authenticated: true })).status, 401);
  await fixturePool.query("DELETE FROM admin_rate_limits");
  const failures = await Promise.all(Array.from({ length: 3 }, (_, index) => request("/api/admin/login", {
    method: "POST", body: { username: index === 0 ? "unknown-user" : "test-admin", password: "wrong" },
  })));
  assert.ok(failures.every((response) => response.status === 401));
  const failureBodies = await Promise.all(failures.map((response) => response.json()));
  assert.deepEqual(failureBodies[0], failureBodies[1], "Login responses reveal whether an account exists");
  const throttled = await request("/api/admin/login", {
    method: "POST", body: { username: "test-admin", password },
    headers: { "X-Forwarded-For": "203.0.113.99", "X-Real-IP": "203.0.113.98", "User-Agent": "DifferentCrawler/2.0" },
  });
  assert.equal(throttled.status, 429);
  assert.ok(Number(throttled.headers.get("retry-after")) > 0 && Number(throttled.headers.get("retry-after")) <= 60);
  assert.equal(throttled.headers.get("set-cookie"), null);
  assert.match(throttled.headers.get("cache-control"), /no-store/);
  console.log("HTTP checks passed: crawler denial, CSRF, login, secure cookies, all five editors, image uploads and serving, public updates, logout, SEO routes, and login throttling with spoofed headers.");
} catch (error) {
  console.error(output);
  throw error;
} finally {
  if (app && app.exitCode === null) { const exited = once(app, "exit"); app.kill(); await exited; }
  if (fixturePool) await fixturePool.end();
  await socket.stop();
  await db.close();
}
