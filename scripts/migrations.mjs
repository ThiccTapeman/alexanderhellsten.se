import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

export async function migrate(client) {
  await client.query("BEGIN");
  try {
    await client.query("SELECT pg_advisory_xact_lock(714293)");
    const existingTables = new Set((await client.query("SELECT tablename FROM pg_tables WHERE schemaname = current_schema()")).rows.map((row) => row.tablename));
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
    // Resolve from the app root in both the CLI and bundled Netlify functions.
    const directory = path.join(process.cwd(), "db", "migrations");
    const files = (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
    const execute = (sql) => client.exec ? client.exec(sql) : client.query(sql);
    const readSql = async (name) => (await readFile(path.join(directory, name), "utf8")).replace(/\r\n/g, "\n");
    // Keep the original migration/checksum intact for databases already deployed.
    // Also repair missing tables without resetting any table that still exists.
    const schema = await readSql("001-schema.sql");
    await execute(schema.replace(/^CREATE (TABLE|INDEX) /gm, "CREATE $1 IF NOT EXISTS "));
    for (const name of files) {
      const sql = await readSql(name);
      const checksum = createHash("sha256").update(sql).digest("hex");
      const { rows } = await client.query("SELECT checksum FROM schema_migrations WHERE name = $1", [name]);
      if (rows.length) {
        if (rows[0].checksum !== checksum) {
          const error = new Error(`Applied migration changed: ${name}`);
          error.code = "MIGRATION_CHECKSUM_MISMATCH";
          throw error;
        }
        if (name === "003-images.sql" && !existingTables.has("media_images")) await execute(sql);
        continue;
      }
      if (name === "002-original-content.sql") {
        // This one-time migration has one INSERT per line. Never add seed rows
        // to a pre-existing table, even if its migration history is absent.
        const seed = sql.split("\n").filter((line) => {
          const table = line.match(/^INSERT INTO "([a-z_]+)"/);
          return !table || !existingTables.has(table[1]);
        }).join("\n");
        await execute(seed);
      } else if (name !== "001-schema.sql") {
        await execute(sql);
      }
      await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
      console.log(`Applied ${name}`);
    }
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
}
