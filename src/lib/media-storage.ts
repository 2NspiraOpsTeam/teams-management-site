/** Isolated media object adapter. No public filesystem fallback is allowed. */
export interface MediaStorage {
  put(key:string, data:ReadableStream, contentType:string):Promise<void>;
  get(key:string):Promise<ReadableStream|null>;
  delete(key:string):Promise<void>;
}
export function unavailableMediaStorage():MediaStorage {
  const unavailable=async ():Promise<never>=>{throw new Error('Media storage unavailable');};
  return {put:unavailable,get:unavailable,delete:unavailable};
}
