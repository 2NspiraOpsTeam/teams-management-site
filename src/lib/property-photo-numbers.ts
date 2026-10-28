import type { D1Database } from '@cloudflare/workers-types';

// Number the complete property pool before approval/search filtering or gallery ordering.
export async function propertyPhotoNumbers(db: D1Database, buildingId: string) {
 const rows = await db.prepare(`SELECT asset_id FROM media_assignments WHERE building_id=? GROUP BY asset_id ORDER BY MIN(created_at),asset_id`).bind(buildingId).all<{asset_id:string}>();
 return new Map(rows.results.map((row,index)=>[row.asset_id,index+1]));
}
