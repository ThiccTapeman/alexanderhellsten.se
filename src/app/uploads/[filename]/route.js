import { database } from "@/lib/db";
import { imageStore } from "@/lib/image-store.mjs";
import { UPLOAD_PATH } from "@/lib/image-config.mjs";

export const runtime = "nodejs";
export async function GET(_request, { params }) {
  const { filename } = await params;
  if (!UPLOAD_PATH.test(`/uploads/${filename}`)) return new Response(null, { status: 404 });
  try {
    const data = await imageStore(database()).get(filename);
    if (!data) return new Response(null, { status: 404 });
    return new Response(new Uint8Array(data), { headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(data.length),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    } });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
