"use client";
import { useEffect, useState } from "react";
import { prepareMediaUpload } from "@/lib/prepare-media-upload";
import type { PhotoInput } from "@/lib/work-orders/shared";
export function WorkOrderPhotos({
  files,
  setFiles,
  disabled = false,
  onPreparing,
}: {
  files: File[];
  setFiles: (files: File[]) => void;
  disabled?: boolean;
  onPreparing?: (value: boolean) => void;
}) {
  const [preparing, setPreparing] = useState(false);
  const [urls, setUrls] = useState<string[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  return (
    <div>
      <label className="block font-medium">
        Photos (optional)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled || preparing}
          className="mt-2 block w-full rounded border p-3"
          onChange={async (e) => {
            const selected = Array.from(e.target.files || []);
            e.target.value = "";
            if (
              files.length + selected.length > 4 ||
              selected.some(
                (f) =>
                  !["image/jpeg", "image/png", "image/webp"].includes(f.type) ||
                  f.size > 15_000_000,
              )
            ) {
              setError(
                "Choose up to four JPEG, PNG or WebP photos, each no larger than 15 MB before resizing.",
              );
              return;
            }
            setPreparing(true);
            onPreparing?.(true);
            setError("");
            try {
              const prepared = await Promise.all(
                selected.map((f) => prepareMediaUpload(f, 650000)),
              );
              setFiles([...files, ...prepared]);
            } catch {
              setError(
                "Could not prepare this photo. Try a smaller JPEG, PNG or WebP image.",
              );
            } finally {
              setPreparing(false);
              onPreparing?.(false);
            }
          }}
        />
      </label>
      <p className="mt-1 text-sm text-slate-600">
        Up to 4 photos per submission. Large photos are automatically resized to
        650 KB. Maximum 12 per request.
      </p>
      {preparing && <p role="status">Preparing photos…</p>}
      {error && (
        <p role="alert" className="text-red-800">
          {error}
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        {files.map((f, i) => (
          <div key={i} className="min-w-0 rounded border p-2">
            <img
              src={urls[i]}
              alt={`Selected issue photo ${i + 1}`}
              className="h-28 w-full object-cover"
            />
            <p className="truncate text-sm">{f.name}</p>
            <button
              type="button"
              disabled={disabled || preparing}
              className="min-h-11 underline"
              onClick={() => setFiles(files.filter((_, j) => i !== j))}
            >
              Remove photo {i + 1}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export async function encodePhotos(files: File[]): Promise<PhotoInput[]> {
  return Promise.all(
    files.map(async (f) => {
      const bytes = new Uint8Array(await f.arrayBuffer());
      let binary = "";
      for (const b of bytes) binary += String.fromCharCode(b);
      return { mime: f.type, data: btoa(binary) };
    }),
  );
}
