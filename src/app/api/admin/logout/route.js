import { cookies } from "next/headers";
import { database } from "@/lib/db";
import { authStore, sessionCookie, cookieOptions } from "@/lib/auth-core.mjs";
import { checkMutation } from "@/lib/admin-http.mjs";
import { adminJson, adminError } from "@/lib/admin";

export const runtime = "nodejs";
export async function POST(request) {
  try {
    checkMutation(request);
    const token = (await cookies()).get(sessionCookie)?.value;
    if (token) await authStore(database()).logout(token);
    const response = adminJson({ ok: true });
    response.cookies.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
    return response;
  } catch (error) { return adminError(error); }
}
