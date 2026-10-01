import { migrate } from "../../scripts/migrations.mjs";
import { schemaIsCurrent } from "./database-schema.mjs";

export function initializedDatabase(pool) {
  let initialization;
  async function initialize() {
    const client = await pool.connect();
    try {
      // Existing installations need only SELECT permission here. Do not open SQL
      // files, acquire migration locks, or execute DDL on ordinary cold starts.
      if (!await schemaIsCurrent(client)) await migrate(client);
    }
    finally { client.release(); }
  }

  return {
    async query(...args) {
      // All first requests in this process share one initialization. PostgreSQL's
      // transaction lock serializes initialization across Netlify instances.
      if (!initialization) {
        initialization = initialize().catch((error) => {
          initialization = undefined;
          console.error("Database initialization failed", { type: error.name, code: error.code || "UNKNOWN" });
          throw error;
        });
      }
      await initialization;
      return pool.query(...args);
    },
  };
}
