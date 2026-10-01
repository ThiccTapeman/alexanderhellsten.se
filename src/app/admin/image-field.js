"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, isImageUrl } from "@/lib/image-config.mjs";

export function ImagePreview({ src, alt, thumbnail = false }) {
  const [failed, setFailed] = useState(false);
  const valid = src && (src.startsWith("blob:") || isImageUrl(src));
  return <div className={`${thumbnail ? "h-14 w-20 shrink-0" : "h-52 w-full"} overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center`}>
    {valid && !failed ? <Image src={src} alt={alt} width={960} height={540} unoptimized referrerPolicy="no-referrer" className="h-full w-full object-contain" onError={() => setFailed(true)} />
      : <span className={`text-slate-500 ${thumbnail ? "text-[10px]" : "text-sm"}`}>{failed ? "Preview unavailable" : "No image selected"}</span>}
  </div>;
}

export default function ImageField({ value, onChange, onUpload, disabled }) {
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return <div className="space-y-3">
    <p className="text-sm font-medium">Project image</p>
    <ImagePreview key={preview || value} src={preview || value} alt="Project image preview" />
    {preview && <p role="status" className="text-sm text-slate-600">Uploading selected image…</p>}
    <label className="block text-sm font-medium">Upload an image
      <input type="file" accept={IMAGE_TYPES.join(",")} disabled={disabled} className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white disabled:opacity-50"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          setError("");
          if (!file) return;
          if (!IMAGE_TYPES.includes(file.type)) { setError("Choose a JPEG, PNG, or WebP image."); return; }
          if (!file.size || file.size > MAX_IMAGE_BYTES) { setError("Choose an image smaller than 4 MB."); return; }
          setPreview(URL.createObjectURL(file));
          try { await onUpload(file); } finally { setPreview(""); }
        }} />
    </label>
    <p className="text-xs text-slate-500">JPEG, PNG, or WebP · Up to 4 MB and 20 megapixels. Save the project after uploading to publish the change.</p>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <label className="block text-sm font-medium">Image URL
      <input type="text" value={value} maxLength={2048} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </label>
    {value && <button type="button" disabled={disabled} onClick={() => onChange("")} className="text-sm text-red-700 underline">Remove image from this project</button>}
  </div>;
}
