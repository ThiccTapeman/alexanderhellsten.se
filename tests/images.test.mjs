import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { PGlite } from "@electric-sql/pglite";
import { migrate } from "../scripts/migrations.mjs";
import { normalizeImage, imageStore } from "../src/lib/image-store.mjs";
import { MAX_IMAGE_BYTES, UPLOAD_PATH } from "../src/lib/image-config.mjs";

test("uploads decode, resize and strip metadata before persistent storage", async () => {
  const db = new PGlite();
  try {
    await migrate(db);
    const source = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: "#2288aa" } }).withMetadata().jpeg().toBuffer();
    const uploaded = await imageStore(db).upload(source, null);
    assert.match(uploaded.url, UPLOAD_PATH);
    assert.equal(uploaded.width, 2560);
    assert.ok(uploaded.height <= 2560);
    const bytes = await imageStore(db).get(uploaded.url.split("/").at(-1));
    assert.equal(bytes.length, uploaded.size);
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.exif, undefined);
    assert.equal(metadata.icc, undefined);
    await migrate(db);
    assert.deepEqual(await imageStore(db).get(uploaded.url.split("/").at(-1)), bytes);
    assert.equal(await imageStore(db).get("../../private.env"), null);
  } finally { await db.close(); }
});

test("uploads reject executable formats, damaged images and excess bytes or pixels", async () => {
  await assert.rejects(normalizeImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')), { status: 415 });
  await assert.rejects(normalizeImage(Buffer.from("<html>not an image</html>")), { status: 415 });
  await assert.rejects(normalizeImage(Buffer.from([0xff, 0xd8, 0xff, 0x00])), { status: 400 });
  await assert.rejects(normalizeImage(Buffer.alloc(MAX_IMAGE_BYTES + 1)), { status: 413 });
  const huge = await sharp({ create: { width: 5000, height: 4001, channels: 3, background: "white" } }).png().toBuffer();
  await assert.rejects(normalizeImage(huge), { status: 400 });
});
