import type { D1Database } from '@cloudflare/workers-types';
import { goldStreetGallery } from './preview-portfolio';

export type MediaRow = { id:string; storage_key:string; file_type:string; width:number|null; height:number|null; size_bytes:number|null; checksum:string|null; visibility:string; created_at:string; alt_text?:string|null; caption?:string|null; published?:number; is_cover?:number; order_index?:number; assignment_id?:string; slot?:string; property_name?:string|null; property_slug?:string|null };
const deliverableStaticMedia = new Set([
  '/preview-properties/42-70-156th-street.jpg',
  '/preview-properties/3425-east-tremont-ave.jpg',
  '/preview-properties/166-e-118th-street.jpg',
  ...goldStreetGallery,
]);
export const isDeliverablePublicMedia = (item:MediaRow) => !item.storage_key.startsWith('/preview-properties/') || deliverableStaticMedia.has(item.storage_key);
export const mediaUrl = (id:string) => `/api/media/${encodeURIComponent(id)}`;
export const publicMediaSrc = (item:MediaRow) => item.storage_key.startsWith('/preview-properties/') ? item.storage_key : mediaUrl(item.id);
export const mediaPreviewUrl = (id:string) => `/api/admin/media/${encodeURIComponent(id)}/file`;
export async function propertyMedia(db:D1Database,slug:string,includeDraft=false) {
 const query = `SELECT a.id,a.storage_key,a.file_type,a.width,a.height,a.size_bytes,a.checksum,a.visibility,a.created_at,m.id AS assignment_id,m.is_cover,m.order_index,COALESCE(NULLIF(m.alt_text,''),a.alt_text) AS alt_text,COALESCE(NULLIF(m.caption,''),a.caption) AS caption,COALESCE(p.published,0) AS published FROM media_assignments m JOIN media_assets a ON a.id=m.asset_id JOIN buildings b ON b.id=m.building_id LEFT JOIN media_publications p ON p.assignment_id=m.id WHERE b.slug=? ${includeDraft?'':"AND a.visibility='public' AND COALESCE(p.published,0)=1"} ORDER BY m.order_index,m.created_at`;
 return (await db.prepare(query).bind(slug).all<MediaRow>()).results.filter(isDeliverablePublicMedia);
}
export async function homeMedia(db:D1Database,includeDraft=false) {
 return (await db.prepare(`SELECT a.id,a.storage_key,a.file_type,a.width,a.height,a.size_bytes,a.checksum,a.visibility,a.created_at,h.id AS assignment_id,h.slot,h.order_index,COALESCE(NULLIF(h.alt_text,''),a.alt_text) AS alt_text,COALESCE(NULLIF(h.caption,''),a.caption) AS caption,h.published,(SELECT b.name FROM media_assignments m JOIN media_publications p ON p.assignment_id=m.id AND p.published=1 JOIN buildings b ON b.id=m.building_id WHERE m.asset_id=a.id ORDER BY m.created_at LIMIT 1) AS property_name,(SELECT b.slug FROM media_assignments m JOIN media_publications p ON p.assignment_id=m.id AND p.published=1 JOIN buildings b ON b.id=m.building_id WHERE m.asset_id=a.id ORDER BY m.created_at LIMIT 1) AS property_slug FROM media_home_assignments h JOIN media_assets a ON a.id=h.asset_id ${includeDraft?'':"WHERE h.published=1 AND a.visibility='public'"} ORDER BY CASE h.slot WHEN 'hero' THEN 0 WHEN 'featured' THEN 1 ELSE 2 END,h.order_index`).all<MediaRow>()).results.filter(isDeliverablePublicMedia);
}
export function imageDimensions(bytes:Uint8Array,mime:string):{width:number;height:number}|null {
 const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(mime==='image/png' && bytes.length>24 && bytes.subarray(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i])) return {width:d.getUint32(16),height:d.getUint32(20)};
 if(mime==='image/webp' && bytes.length>30 && String.fromCharCode(...bytes.subarray(0,4))==='RIFF' && String.fromCharCode(...bytes.subarray(8,12))==='WEBP') {
  const kind=String.fromCharCode(...bytes.subarray(12,16));
  if(kind==='VP8X') return {width:1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16),height:1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16)};
  if(kind==='VP8 ' && bytes[23]===0x9d && bytes[24]===0x01 && bytes[25]===0x2a) return {width:d.getUint16(26,true)&0x3fff,height:d.getUint16(28,true)&0x3fff};
  if(kind==='VP8L' && bytes[20]===0x2f) return {width:1+(((bytes[22]&0x3f)<<8)|bytes[21]),height:1+(((bytes[24]&0x0f)<<10)|(bytes[23]<<2)|((bytes[22]&0xc0)>>6))};
 }
 if(mime==='image/jpeg' && bytes[0]===0xff && bytes[1]===0xd8) {
  for(let i=2;i<bytes.length-9;){if(bytes[i]!==0xff)return null;const marker=bytes[i+1],size=d.getUint16(i+2);if(size<2)return null;if([0xc0,0xc1,0xc2,0xc3].includes(marker))return {height:d.getUint16(i+5),width:d.getUint16(i+7)};i+=2+size;}
 }
 return null;
}
