import "server-only";
import { createPool } from "./db-core.mjs";
import { initializedDatabase } from "./initialized-db.mjs";

export function database() {
  if (!globalThis.portfolioPool) globalThis.portfolioPool = createPool();
  if (!globalThis.portfolioDatabase) globalThis.portfolioDatabase = initializedDatabase(globalThis.portfolioPool);
  return globalThis.portfolioDatabase;
}
