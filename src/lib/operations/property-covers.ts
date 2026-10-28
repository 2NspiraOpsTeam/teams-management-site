import type {D1Database} from '@cloudflare/workers-types';
import {all,type Row} from './database';

// Enrich only the visible page. No full-library fetch or per-property requests.
export async function attachPropertyCovers(db:D1Database,properties:Row[]){
 if(!properties.length)return;
 const covers=await all(db,`SELECT b.id AS building_id,
 (SELECT a.id FROM media_assignments m JOIN media_assets a ON a.id=m.asset_id
 LEFT JOIN media_presentation_settings s ON s.building_id=m.building_id AND s.context='residential'
 WHERE m.building_id=b.id AND m.unit_id IS NULL AND a.visibility!='archived' AND a.file_type LIKE 'image/%'
 AND ((s.building_id IS NOT NULL AND s.cover_asset_id=a.id) OR (s.building_id IS NULL AND m.is_cover=1))
 ORDER BY m.order_index,m.created_at,m.id LIMIT 1) AS cover_asset_id
 FROM buildings b WHERE b.id IN (${properties.map(()=>'?').join(',')})`,...properties.map(p=>p.id));
 const byId=new Map(covers.map(c=>[c.building_id,c.cover_asset_id]));
 for(const property of properties)property.cover_asset_id=byId.get(property.id)||null;
}
