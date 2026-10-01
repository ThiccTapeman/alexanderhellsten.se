export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const UPLOAD_PATH = /^\/uploads\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.webp$/;

export function isImageUrl(value) {
  if (!value) return true;
  if (/^\/projectImages\/[a-zA-Z0-9_.-]+$/.test(value) || UPLOAD_PATH.test(value)) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}
