import nextEnv from "@next/env";
import readline from "node:readline";
import { Writable } from "node:stream";
import { createPool } from "../src/lib/db-core.mjs";
import { hashPassword, loginAccountKey } from "../src/lib/auth-core.mjs";
import { migrate } from "./migrations.mjs";

nextEnv.loadEnvConfig(process.cwd());
const username = process.argv[2]?.trim();
if (!username || !/^[a-zA-Z0-9_.-]{1,100}$/.test(username)) {
  console.error("Usage: npm run admin:password -- <username>");
  process.exit(1);
}
if (!process.stdin.isTTY) {
  console.error("Run in an interactive terminal. Passwords must not be supplied as command-line arguments.");
  process.exit(1);
}
const muted = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
const terminal = readline.createInterface({ input: process.stdin, output: muted, terminal: true });
const ask = (prompt) => new Promise((resolve) => { process.stdout.write(prompt); terminal.question("", (answer) => { process.stdout.write("\n"); resolve(answer); }); });
let pool;
try {
  let password;
  while (true) {
    password = await ask("New password (9–128 characters; hidden): ");
    if (password.length < 9 || password.length > 128) {
      console.error(`Password has ${password.length} characters; it must have 9–128. Nothing was saved. Try again, or press Ctrl+C to cancel.`);
      continue;
    }
    const confirmation = await ask("Confirm password: ");
    if (password === confirmation) break;
    console.error("Passwords do not match. Nothing was saved. Please try again.");
  }
  const hash = await hashPassword(password);
  terminal.close();
  pool = createPool();
  const client = await pool.connect();
  try {
    await migrate(client);
    await client.query("BEGIN");
    const { rows } = await client.query("INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id", [username, hash]);
    await client.query("DELETE FROM admin_sessions WHERE user_id = $1", [rows[0].id]);
    await client.query("DELETE FROM admin_rate_limits WHERE key IN ('admin-login', 'admin-login-burst', $1)", [loginAccountKey(username)]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
  console.log(`Admin account "${username}" saved successfully. You can now sign in at /admin. Existing sessions for this account were revoked.`);
} catch (error) {
  console.error(pool ? "Could not update the account. Check the database connection and schema permissions." : error.message);
  process.exitCode = 1;
} finally { terminal.close(); if (pool) await pool.end(); }
