import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { database } from "./db";
import { contentStore } from "./content-store.mjs";

// Request-local deduplication only: saved edits are visible on the next request.
export const getContent = cache(async (name) => {
  await connection();
  return contentStore(database()).list(name);
});
