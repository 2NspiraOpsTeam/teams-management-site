import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
export type RetailProperty={id:string;name:string;slug:string;address:{street:string;city:string;state:string;zip:string;neighborhood?:string};retail_status:'active'|'commercial_component'|'planned';retail_notes:string|null};
export async function listPublicRetail():Promise<RetailProperty[]>{
 const db=(getRequestContext().env as {DB?:D1Database}).DB;if(!db)throw new Error('Teams D1 unavailable');
 const result=await db.prepare("SELECT id,name,slug,address_json,retail_status,retail_notes FROM buildings WHERE has_retail=1 AND retail_published=1 AND retail_status IN ('active','commercial_component','planned') AND publication_state!='archived' ORDER BY CASE retail_status WHEN 'planned' THEN 1 ELSE 0 END,name").all<{id:string;name:string;slug:string;address_json:string;retail_status:RetailProperty['retail_status'];retail_notes:string|null}>();
 return result.results.map(row=>({id:row.id,name:row.name,slug:row.slug,address:{...JSON.parse(row.address_json),zip:JSON.parse(row.address_json).zip||''},retail_status:row.retail_status,retail_notes:row.retail_notes}));
}
