import { propertyPhotoNumbers } from './property-photo-numbers';
import type { D1Database } from '@cloudflare/workers-types';
import { isDeliverablePublicMedia, type MediaRow } from './media-management';
import { type MediaContext,type PresentationInput,type PresentationSettings,type GallerySelection } from './media-presentation-input';
export * from './media-presentation-input';
export async function presentationCandidates(db:D1Database,buildingId:string):Promise<MediaRow[]> {
 const rows=await db.prepare(`SELECT a.*,m.id AS assignment_id,m.is_cover,m.order_index,COALESCE(NULLIF(m.alt_text,''),a.alt_text) AS alt_text,COALESCE(NULLIF(m.caption,''),a.caption) AS caption FROM media_assignments m JOIN media_assets a ON a.id=m.asset_id JOIN media_publications p ON p.assignment_id=m.id AND p.published=1 WHERE m.building_id=? AND m.unit_id IS NULL AND a.visibility='public' AND a.file_type LIKE 'image/%' ORDER BY m.order_index,m.created_at`).bind(buildingId).all<MediaRow>();
 const numbers=await propertyPhotoNumbers(db,buildingId);
 return [...new Map(rows.results.filter(isDeliverablePublicMedia).map(r=>[r.id,{...r,photo_number:numbers.get(r.id)}])).values()];
}
export async function presentationState(db:D1Database,id:string){
 const [candidates,settings,gallery]=await Promise.all([presentationCandidates(db,id),db.prepare('SELECT context,cover_asset_id,fallback_to_property_cover,revision FROM media_presentation_settings WHERE building_id=?').bind(id).all<PresentationSettings&{context:MediaContext}>(),db.prepare('SELECT context,asset_id,kind FROM media_presentation_gallery WHERE building_id=? ORDER BY order_index,asset_id').bind(id).all<GallerySelection&{context:MediaContext}>()]);
 return {candidates,contexts:Object.fromEntries((['residential','retail'] as const).map(context=>[context,{...(settings.results.find(s=>s.context===context)||{context,cover_asset_id:null,fallback_to_property_cover:context==='retail'?1:0,revision:0}),gallery:gallery.results.filter(g=>g.context===context).map(({asset_id,kind})=>({asset_id,kind}))}]))};
}
export async function savePresentation(db:D1Database,id:string,input:PresentationInput){
 const token=crypto.randomUUID();
 const statements=[db.prepare('INSERT OR IGNORE INTO media_presentation_settings(building_id,context) VALUES (?,?)').bind(id,input.context),db.prepare('UPDATE media_presentation_settings SET cover_asset_id=?,fallback_to_property_cover=?,revision=revision+1,mutation_token=? WHERE building_id=? AND context=? AND revision=?').bind(input.cover_asset_id,input.fallback_to_property_cover?1:0,token,id,input.context,input.revision),db.prepare('DELETE FROM media_presentation_gallery WHERE building_id=? AND context=? AND EXISTS(SELECT 1 FROM media_presentation_settings WHERE building_id=? AND context=? AND mutation_token=?)').bind(id,input.context,id,input.context,token),...input.gallery.map((g,index)=>db.prepare('INSERT INTO media_presentation_gallery(building_id,context,asset_id,order_index,kind) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM media_presentation_settings WHERE building_id=? AND context=? AND mutation_token=?)').bind(id,input.context,g.asset_id,index,g.kind,id,input.context,token))];
 const result=await db.batch(statements);
 return result[1].meta.changes===1;
}
