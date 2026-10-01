import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { initializedDatabase } from "../src/lib/initialized-db.mjs";
import { migrate } from "../scripts/migrations.mjs";

test("first concurrent queries initialize an empty database once and preserve subsequent edits", async () => {
  const db = new PGlite();
  let connections = 0;
  let releases = 0;
  const pool = {
    query: (...args) => db.query(...args),
    async connect() {
      connections++;
      return { query: (...args) => db.query(...args), exec: (sql) => db.exec(sql), release: () => { releases++; } };
    },
  };
  try {
    const initialized = initializedDatabase(pool);
    const results = await Promise.all(Array.from({ length: 8 }, () => initialized.query("SELECT count(*)::integer AS count FROM projects")));
    assert.ok(results.every((result) => result.rows[0].count === 6));
    assert.equal(connections, 1);
    assert.equal(releases, 1);
    await initialized.query('UPDATE projects SET "projectName" = $1 WHERE id = $2', ["Changed after setup", 1]);
    const restarted = initializedDatabase(pool);
    assert.equal((await restarted.query('SELECT "projectName" FROM projects WHERE id = 1')).rows[0].projectName, "Changed after setup");
    assert.equal((await restarted.query("SELECT count(*)::integer AS count FROM projects")).rows[0].count, 6);
    assert.equal(connections, 2);
    // Missing tables are repaired even when migration history already exists.
    await db.query("DROP TABLE admin_rate_limits");
    await initializedDatabase(pool).query("SELECT * FROM admin_rate_limits");
  } finally { await db.close(); }
});

test("initialization retries after a connection failure", async () => {
  const db = new PGlite();
  let attempts = 0;
  const initialized = initializedDatabase({
    query: (...args) => db.query(...args),
    async connect() {
      if (++attempts === 1) throw new Error("Temporary connection failure");
      return { query: (...args) => db.query(...args), exec: (sql) => db.exec(sql), release() {} };
    },
  });
  try {
    await assert.rejects(initialized.query("SELECT * FROM education"), /Temporary connection failure/);
    assert.equal((await initialized.query("SELECT * FROM education")).rows.length, 2);
    assert.equal(attempts, 2);
  } finally { await db.close(); }
});

test("partial schemas without migration history keep their existing content", async () => {
  const db = new PGlite();
  try {
    const schema = await readFile(new URL("../db/migrations/001-schema.sql", import.meta.url), "utf8");
    await db.exec(schema.slice(0, schema.indexOf("CREATE TABLE education")));
    await db.query('INSERT INTO projects ("projectName", "projectDescription", "projectDate", "projectType") VALUES ($1, $2, $3, $4)', ["Existing project", "Keep this", "2026", "Web"]);
    await migrate(db);
    assert.equal((await db.query("SELECT * FROM projects")).rows.length, 1);
    assert.equal((await db.query('SELECT "projectName" FROM projects')).rows[0].projectName, "Existing project");
    assert.equal((await db.query("SELECT * FROM technologies")).rows.length, 23);
    await db.query("DELETE FROM technologies");
    await migrate(db);
    assert.equal((await db.query("SELECT * FROM technologies")).rows.length, 0);
  } finally { await db.close(); }
});
