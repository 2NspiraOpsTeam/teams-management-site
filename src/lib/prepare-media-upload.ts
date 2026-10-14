export const MAX_MEDIA_BYTES = 850_000;

/** Upload a bounded preview copy, leaving the original untouched. */
export async function prepareMediaUpload(
  file: File,
  maxBytes = MAX_MEDIA_BYTES,
): Promise<File> {
  if (file.size <= maxBytes) return file;
  const bitmap = await createImageBitmap(file);
  try {
    for (const maxEdge of [2400, 2000, 1600, 1200, 960]) {
      const scale = Math.min(
        1,
        maxEdge / Math.max(bitmap.width, bitmap.height),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      if (canvas.width < 320 || canvas.height < 240) break;
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error("Image preparation is unavailable in this browser.");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.84, 0.72, 0.6, 0.48]) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", quality),
        );
        if (blob && blob.size >= 100 && blob.size <= maxBytes) {
          return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
            type: "image/jpeg",
          });
        }
      }
    }
    throw new Error(
      `${file.name}: could not prepare this image under ${Math.round(maxBytes / 1000)} KB.`,
    );
  } finally {
    bitmap.close();
  }
}
