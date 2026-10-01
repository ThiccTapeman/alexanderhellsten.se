export class HttpError extends Error {
  constructor(status, message, retryAfter) { super(message); this.status = status; this.retryAfter = retryAfter; }
}

export function checkMutation(request, configuredOrigin = process.env.APP_ORIGIN, contentTypes = ["application/json"]) {
  if (!configuredOrigin) throw new HttpError(503, "Admin is not configured.");
  let origin;
  try { origin = new URL(configuredOrigin); } catch { throw new HttpError(503, "Admin is not configured."); }
  if (process.env.NODE_ENV === "production" && origin.protocol !== "https:") throw new HttpError(503, "Admin requires HTTPS.");
  if (request.headers.get("origin") !== origin.origin || request.headers.get("x-admin-request") !== "1") {
    throw new HttpError(403, "Request origin rejected.");
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") throw new HttpError(403, "Cross-site request rejected.");
  if (!contentTypes.includes(request.headers.get("content-type")?.split(";")[0].trim())) {
    throw new HttpError(415, "Unsupported content type.");
  }
}

export async function readBytes(request, limit) {
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError(413, "Request too large.");
  if (!request.body) throw new HttpError(400, "Request body required.");
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, "Request too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function readJson(request, limit = 65536) {
  const bytes = await readBytes(request, limit);
  try { return JSON.parse(bytes.toString("utf8")); }
  catch { throw new HttpError(400, "Invalid JSON."); }
}

export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Netlify-CDN-Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};
