/** Bound bytes before parsing so JSON and multipart inputs cannot allocate unbounded bodies. */
export class BodyTooLarge extends Error {}
export async function boundedBody(request: Request, limit: number): Promise<Uint8Array> {
  const length = Number(request.headers.get('content-length'));
  if (Number.isFinite(length) && length > limit) throw new BodyTooLarge();
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new BodyTooLarge(); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}
