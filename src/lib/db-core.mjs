import pg from "pg";

export function createPool() {
  const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;
  if (!connectionString) throw new Error("Configure DATABASE_URL before starting the site.");
  const url = new URL(connectionString);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  // Never disable certificate verification for a hosted database.
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) url.searchParams.delete(key);
  const pool = new pg.Pool({
    connectionString: url.toString(),
    ssl: local ? false : { rejectUnauthorized: true, ...(process.env.DATABASE_CA ? { ca: process.env.DATABASE_CA } : {}) },
    max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000,
    statement_timeout: 15000,
  });
  pool.on("error", (error) => console.error("Idle database connection failed", { type: error.name }));
  return pool;
}
