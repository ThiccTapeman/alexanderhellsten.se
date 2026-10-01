import { NextResponse } from "next/server";
import { privateHeaders } from "./lib/admin-http.mjs";

export function proxy(request) {
  const nonce = btoa(crypto.randomUUID());
  const development = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'", `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' https: data: blob:", "font-src 'self'",
    `connect-src 'self'${development ? " ws: wss:" : ""}`, "object-src 'none'", "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [key, value] of Object.entries(privateHeaders)) response.headers.set(key, value);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
