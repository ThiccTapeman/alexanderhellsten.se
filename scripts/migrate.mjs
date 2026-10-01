import nextEnv from "@next/env";
import { createPool } from "../src/lib/db-core.mjs";
import { migrate } from "./migrations.mjs";

nextEnv.loadEnvConfig(process.cwd());
const pool = createPool();
try {
  const client = await pool.connect();
  try { await migrate(client); } finally { client.release(); }
  console.log("Database migrations complete.");
} catch (error) {
  console.error("Migration failed. Check your database connection and migration files.", { type: error.name, code: error.code });
  process.exitCode = 1;
} finally { await pool.end(); }
