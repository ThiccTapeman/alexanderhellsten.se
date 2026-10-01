import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { MAX_IMAGE_BYTES, UPLOAD_PATH } from "./image-config.mjs";
import { HttpError } from "./admin-http.mjs";

export async function normalizeImage(bytes) {
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new HttpError(413, "Choose an image smaller than 4 MB.");
  // Reject non-raster formats before they reach an image decoder. Names and MIME
  // headers are never used to choose the decoder or a filesystem path.
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!jpeg && !png && !webp) throw new HttpError(415, "Only JPEG, PNG, and WebP images are supported.");
  try {
    const source = sharp(bytes, { limitInputPixels: 20_000_000, failOn: "warning" });
    const metadata = await source.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages || 1) > 1) {
      throw new HttpError(415, "Choose a still JPEG, PNG, or WebP image.");
    }
    // Re-encoding removes EXIF/location data and any appended non-image payload.
    const { data, info } = await source.rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 }).timeout({ seconds: 10 }).toBuffer({ resolveWithObject: true });
    if (data.length > MAX_IMAGE_BYTES) throw new HttpError(413, "The processed image is too large. Choose a smaller image.");
    return { data, width: info.width, height: info.height };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "This image could not be processed. Use a valid image under 20 megapixels.");
  }
}

export function imageStore(db) {
  return {
    async upload(bytes, userId) {
      const { data, width, height } = await normalizeImage(bytes);
      const id = randomUUID();
      await db.query("INSERT INTO media_images (id, data, width, height, created_by) VALUES ($1, $2, $3, $4, $5)", [id, data, width, height, userId]);
      return { url: `/uploads/${id}.webp`, width, height, size: data.length };
    },
    async get(filename) {
      if (!UPLOAD_PATH.test(`/uploads/${filename}`)) return null;
      const { rows } = await db.query("SELECT data FROM media_images WHERE id = $1", [filename.slice(0, -5)]);
      return rows[0] ? Buffer.from(rows[0].data) : null;
    },
  };
}
