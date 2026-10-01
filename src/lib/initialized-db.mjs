import { migrate } from "../../scripts/migrations.mjs";

export function initializedDatabase(pool) {
  let initialization;
  async function initialize() {
    const client = await pool.connect();
    try { await migrate(client); }
    finally { client.release(); }
  }

  return {
    async query(...args) {
      // All first requests in this process share one initialization. PostgreSQL's
      // transaction lock serializes initialization across Netlify instances.
      if (!initialization) {
        initialization = initialize().catch((error) => {
          initialization = undefined;
          throw error;
        });
      }
      await initialization;
      return pool.query(...args);
    },
  };
}
