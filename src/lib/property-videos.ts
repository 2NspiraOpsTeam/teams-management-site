import type { D1Database } from '@cloudflare/workers-types';
import { driveVideoId } from './property-video-input';
import { isDeliverablePublicMedia } from './media-management';
export type PropertyVideoRow = {id:string;building_id:string;unit_id:string|null;source_url:string;title:string;description:string;transcript:string;poster_asset_id:string|null;published:number;public_access_verified:number;order_index:number;unit_identifier:string|null;poster_storage_key:string|null;poster_visibility:string|null;poster_published:number};
export type PublicPropertyVideo={id:string;title:string;description:string;transcript:string;unit:string|null;embedUrl:string;sourceUrl:string;poster:string|null};
export async function propertyVideos(db:D1Database,buildingId:string){
 return (await db.prepare('SELECT v.*,u.unit_identifier,a.storage_key AS poster_storage_key,a.visibility AS poster_visibility,CASE WHEN EXISTS (SELECT 1 FROM media_assignments pm JOIN media_publications pp ON pp.assignment_id=pm.id AND pp.published=1 WHERE pm.asset_id=v.poster_asset_id AND pm.building_id=v.building_id AND (pm.unit_id IS NULL OR pm.unit_id=v.unit_id)) THEN 1 ELSE 0 END AS poster_published FROM property_videos v LEFT JOIN units u ON u.id=v.unit_id AND u.building_id=v.building_id LEFT JOIN media_assets a ON a.id=v.poster_asset_id WHERE v.building_id=? ORDER BY v.order_index,v.created_at,v.id').bind(buildingId).all<PropertyVideoRow>()).results;
}
export function publicVideoProjection(rows:PropertyVideoRow[]):PublicPropertyVideo[]{
 return rows.filter(v=>v.published===1&&v.public_access_verified===1&&driveVideoId(v.source_url)&&(!v.unit_id||v.unit_identifier)).map(v=>({id:v.id,title:v.title,description:v.description,transcript:v.transcript,unit:v.unit_identifier,embedUrl:`https://drive.google.com/file/d/${driveVideoId(v.source_url)}/preview`,sourceUrl:v.source_url,poster:v.poster_asset_id&&v.poster_visibility==='public'&&v.poster_published===1&&v.poster_storage_key&&isDeliverablePublicMedia({storage_key:v.poster_storage_key})?`/api/media/${encodeURIComponent(v.poster_asset_id)}`:null}));
}
