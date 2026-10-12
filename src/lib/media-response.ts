import type { D1Database } from '@cloudflare/workers-types';
import { previewD1MediaStorage } from './media-storage';
import { previewPortfolio } from './preview-portfolio';
export async function mediaResponse(db:D1Database,id:string,admin:boolean,preview=false){
 const previewClause=preview?`OR b.slug IN (${previewPortfolio.map(item=>`'${item.slug}'`).join(',')})`:'';
 const publicClause=`AND visibility='public' AND (EXISTS(SELECT 1 FROM media_assignments m JOIN media_publications p ON p.assignment_id=m.id JOIN buildings b ON b.id=m.building_id LEFT JOIN units u ON u.id=m.unit_id AND u.building_id=b.id WHERE m.asset_id=media_assets.id AND p.published=1 AND (m.unit_id IS NULL OR u.id IS NOT NULL) AND (b.publication_state='published' ${previewClause})) OR EXISTS(SELECT 1 FROM media_home_assignments h WHERE h.asset_id=media_assets.id AND h.published=1) OR EXISTS(SELECT 1 FROM dining_venues d WHERE d.hero_media_asset_id=media_assets.id AND d.publication_state='published'))`;
 const asset=await db.prepare(`SELECT storage_key,file_type,visibility FROM media_assets WHERE id=? ${admin?'':publicClause}`).bind(id).first<{storage_key:string;file_type:string;visibility:string}>();
 if(!asset)return new Response('Not found',{status:404});
 if(asset.storage_key.startsWith('/preview-properties/'))return Response.redirect(new URL(asset.storage_key,'https://teams-management-preview.pages.dev'),302);
 const bytes=await previewD1MediaStorage(db).get(asset.storage_key);if(!bytes)return new Response('Not found',{status:404});return new Response(new Uint8Array(bytes).buffer,{headers:{'Content-Type':asset.file_type,'Cache-Control':admin?'private, no-store':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
}
