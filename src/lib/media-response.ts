import type { D1Database } from '@cloudflare/workers-types';
export async function mediaResponse(db:D1Database,id:string,admin:boolean,preview=false){
 const previewClause=preview?"OR b.slug IN ('61-gold-st','42-70-156th-st-flushing','3425-east-tremont-bronx','166-e-118th-st')":'';
 const publicClause=`AND visibility='public' AND (EXISTS(SELECT 1 FROM media_assignments m JOIN media_publications p ON p.assignment_id=m.id JOIN buildings b ON b.id=m.building_id WHERE m.asset_id=media_assets.id AND p.published=1 AND (b.publication_state='published' ${previewClause})) OR EXISTS(SELECT 1 FROM media_home_assignments h WHERE h.asset_id=media_assets.id AND h.published=1))`;
 const asset=await db.prepare(`SELECT storage_key,file_type,visibility FROM media_assets WHERE id=? ${admin?'':publicClause}`).bind(id).first<{storage_key:string;file_type:string;visibility:string}>();
 if(!asset)return new Response('Not found',{status:404});
 if(asset.storage_key.startsWith('/preview-properties/'))return Response.redirect(new URL(asset.storage_key,'https://teams-management-preview.pages.dev'),302);
 const row=await db.prepare('SELECT body_base64 FROM media_objects WHERE storage_key=?').bind(asset.storage_key).first<{body_base64:string}>();if(!row)return new Response('Not found',{status:404});
 const binary=atob(row.body_base64);const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new Response(bytes,{headers:{'Content-Type':asset.file_type,'Cache-Control':admin?'private, no-store':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
}
