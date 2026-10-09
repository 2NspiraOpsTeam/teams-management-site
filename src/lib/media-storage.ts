import type { D1Database } from '@cloudflare/workers-types';
/** Object boundary for preview D1 storage; replace with R2 when enabled. */
export interface MediaStorage {
  put(key:string,bytes:Uint8Array):Promise<void>;
  get(key:string):Promise<Uint8Array|null>;
  delete(key:string):Promise<void>;
}
export function previewD1MediaStorage(db:D1Database):MediaStorage {
  return {
    async put(key,bytes){let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));await db.prepare('INSERT INTO media_objects(storage_key,body_base64) VALUES (?,?)').bind(key,btoa(binary)).run();},
    async get(key){const row=await db.prepare('SELECT body_base64 FROM media_objects WHERE storage_key=?').bind(key).first<{body_base64:string}>();return row?Uint8Array.from(atob(row.body_base64),c=>c.charCodeAt(0)):null;},
    async delete(key){await db.prepare('DELETE FROM media_objects WHERE storage_key=?').bind(key).run();}
  };
}
export function unavailableMediaStorage():MediaStorage {
  const unavailable=async ():Promise<never>=>{throw new Error('Media storage unavailable');};
  return {put:unavailable,get:unavailable,delete:unavailable};
}
