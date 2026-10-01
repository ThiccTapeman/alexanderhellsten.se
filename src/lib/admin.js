import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { database } from "./db";
import { authStore, sessionCookie } from "./auth-core.mjs";
import { HttpError, privateHeaders } from "./admin-http.mjs";

export async function getAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  return authStore(database()).session(token);
}

export async function requireAdmin() {
  const session = await getAdmin();
  if (!session) throw new HttpError(401, "Your session has expired. Sign in again.");
  return session;
}

export function adminJson(data, status = 200, extraHeaders = {}) {
  return NextResponse.json(data, { status, headers: { ...privateHeaders, ...extraHeaders } });
}

export function adminError(error) {
  if (error instanceof HttpError) return adminJson({ error: error.message }, error.status, error.status === 429 ? { "Retry-After": String(error.retryAfter || 60) } : {});
  if (error instanceof ZodError) return adminJson({ error: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, 400);
  // Do not expose SQL, credentials, request bodies, or connection strings.
  console.error("Admin operation failed", { type: error?.name });
  return adminJson({ error: "The operation could not be completed. Check the database configuration and try again." }, 503);
}
