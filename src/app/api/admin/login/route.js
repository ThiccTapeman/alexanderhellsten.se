import { cookies } from "next/headers";
import { z } from "zod";
import { database } from "@/lib/db";
import { authStore, sessionCookie, cookieOptions } from "@/lib/auth-core.mjs";
import { checkMutation, readJson, HttpError } from "@/lib/admin-http.mjs";
import { adminJson, adminError } from "@/lib/admin";

export const runtime = "nodejs";
export async function POST(request) {
  try {
    checkMutation(request);
    const { username, password } = z.object({ username: z.string().trim().min(1).max(100), password: z.string().min(1).max(128) }).strict().parse(await readJson(request, 2048));
    const jar = await cookies();
    const result = await authStore(database()).login(username, password, jar.get(sessionCookie)?.value);
    if (result.limited) throw new HttpError(429, `Too many sign-in attempts. Try again in ${result.retryAfter} seconds.`, result.retryAfter);
    if (result.invalid) throw new HttpError(401, "Invalid username or password.");
    const response = adminJson({ ok: true });
    response.cookies.set(sessionCookie, result.token, cookieOptions);
    return response;
  } catch (error) { return adminError(error); }
}
