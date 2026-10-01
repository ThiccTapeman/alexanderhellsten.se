import { z } from "zod";
import { database } from "@/lib/db";
import { contentStore } from "@/lib/content-store.mjs";
import { collections } from "@/lib/content-schema.mjs";
import { authStore } from "@/lib/auth-core.mjs";
import { requireAdmin, adminJson, adminError } from "@/lib/admin";
import { checkMutation, readJson, HttpError } from "@/lib/admin-http.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const identity = z.object({ id: z.number().int().positive(), version: z.number().int().positive() }).strict();

async function collectionName(context) {
  const { collection } = await context.params;
  if (!Object.hasOwn(collections, collection)) throw new HttpError(404, "Unknown collection.");
  return collection;
}

export async function GET(request, context) {
  try {
    await requireAdmin();
    return adminJson({ records: await contentStore(database()).list(await collectionName(context)) });
  } catch (error) { return adminError(error); }
}

async function mutate(request, context, method) {
  try {
    checkMutation(request);
    const session = await requireAdmin();
    if (!await authStore(database()).consumeLimit(`write:${session.user_id}`, 120, 60)) throw new HttpError(429, "Too many changes. Try again shortly.");
    const name = await collectionName(context);
    const body = await readJson(request);
    const store = contentStore(database());
    let changed;
    if (method === "POST") {
      const { record } = z.object({ record: collections[name].schema }).strict().parse(body);
      changed = await store.save(name, record);
    } else if (method === "PUT") {
      const { id, version, record } = identity.extend({ record: collections[name].schema }).parse(body);
      changed = await store.save(name, record, id, version);
    } else {
      const { id, version } = identity.parse(body);
      changed = await store.remove(name, id, version);
    }
    if (!changed) throw new HttpError(409, "This entry changed in another session. Reload the list before editing again.");
    return adminJson({ records: await store.list(name) });
  } catch (error) { return adminError(error); }
}

export const POST = (request, context) => mutate(request, context, "POST");
export const PUT = (request, context) => mutate(request, context, "PUT");
export const DELETE = (request, context) => mutate(request, context, "DELETE");
