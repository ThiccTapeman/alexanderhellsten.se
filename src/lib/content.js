import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { database } from "./db";
import { contentStore } from "./content-store.mjs";
import { collections } from "./content-schema.mjs";

// Cache only public content. Admin reads and authentication remain uncached.
const readers = Object.fromEntries(Object.keys(collections).map((name) => [name,
  unstable_cache(() => contentStore(database()).list(name), ["portfolio-content-v1", name], {
    revalidate: 43200, tags: [`content:${name}`],
  }),
]));

export const getContent = cache(async (name) => {
  if (!Object.hasOwn(readers, name)) throw new Error("Unknown collection");
  return readers[name]();
});

const readProject = unstable_cache((id) => contentStore(database()).project(id), ["portfolio-project-v1"], {
  revalidate: 43200, tags: ["content:projects"],
});

export const getProject = cache(async (id) => {
  if (!/^[1-9]\d*$/.test(String(id))) return null;
  if (!Number.isSafeInteger(Number(id)) || Number(id) > 2147483647) return null;
  return readProject(Number(id));
});
