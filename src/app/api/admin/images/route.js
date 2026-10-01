import { database } from "@/lib/db";
import { requireAdmin, adminJson, adminError } from "@/lib/admin";
import { checkMutation, readBytes, HttpError } from "@/lib/admin-http.mjs";
import { authStore } from "@/lib/auth-core.mjs";
import { imageStore } from "@/lib/image-store.mjs";
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/image-config.mjs";

export const runtime = "nodejs";
export async function POST(request) {
  try {
    checkMutation(request, undefined, IMAGE_TYPES);
    const session = await requireAdmin();
    const rate = await authStore(database()).consumeRate(`upload:${session.user_id}`, 10, 60);
    if (!rate.allowed) throw new HttpError(429, "Too many uploads. Please wait before trying again.", rate.retryAfter);
    const bytes = await readBytes(request, MAX_IMAGE_BYTES);
    return adminJson(await imageStore(database()).upload(bytes, session.user_id), 201);
  } catch (error) { return adminError(error); }
}
