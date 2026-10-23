import { approvedPropertyHighlights } from './approved-property-highlights';
import { publicDataCache } from './public-data-cache';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { previewPortfolioEnabled } from './preview-portfolio';
export type RetailProperty={id:string;name:string;slug:string;address:{street:string;city:string;state:string;zip:string;neighborhood?:string};retail_status:'active'|'commercial_component'|'planned';retail_notes:string|null;latitude?:number|null;longitude?:number|null;map_verified?:boolean;geocode_status?:string|null};
export async function listPublicRetail():Promise<RetailProperty[]>{
 return publicDataCache('public-retail',async()=>{
 const db=(getCloudflareContext().env as {DB?:D1Database}).DB;if(!db)throw new Error('Teams D1 unavailable');
 const result=await db.prepare(`SELECT id,name,slug,address_json,retail_status,retail_notes,latitude,longitude,map_verified,geocode_status FROM buildings WHERE has_retail=1 AND retail_published=1 AND retail_status IN ('active','commercial_component','planned') AND publication_state ${previewPortfolioEnabled ? "!='archived'" : "='published'"} ORDER BY CASE retail_status WHEN 'planned' THEN 1 ELSE 0 END,name`).all<{id:string;name:string;slug:string;address_json:string;retail_status:RetailProperty['retail_status'];retail_notes:string|null;latitude:number|null;longitude:number|null;map_verified:number;geocode_status:string|null}>();
 const items=result.results.map(row=>({id:row.id,name:row.name,slug:row.slug,address:{...JSON.parse(row.address_json),zip:JSON.parse(row.address_json).zip||''},retail_status:row.retail_status,retail_notes:(previewPortfolioEnabled ? approvedPropertyHighlights[row.slug] : undefined) ?? row.retail_notes,latitude:row.latitude,longitude:row.longitude,map_verified:row.map_verified===1,geocode_status:row.geocode_status}));
 return items;
 });
}

export async function getPublicRetail(slug:string):Promise<RetailProperty|null>{
 const db=(getCloudflareContext().env as {DB?:D1Database}).DB;if(!db)throw new Error('Teams D1 unavailable');
 const row=await db.prepare(`SELECT id,name,slug,address_json,retail_status,retail_notes,latitude,longitude,map_verified,geocode_status FROM buildings WHERE slug=? AND has_retail=1 AND retail_published=1 AND retail_status IN ('active','commercial_component','planned') AND publication_state ${previewPortfolioEnabled ? "!='archived'" : "='published'"}`).bind(slug).first<{id:string;name:string;slug:string;address_json:string;retail_status:RetailProperty['retail_status'];retail_notes:string|null;latitude:number|null;longitude:number|null;map_verified:number;geocode_status:string|null}>();
 if(!row)return null;let address:RetailProperty['address'];try{const parsed=JSON.parse(row.address_json);address={street:parsed.street||'',city:parsed.city||'',state:parsed.state||'',zip:parsed.zip||'',neighborhood:parsed.neighborhood};}catch{return null;}return {id:row.id,name:row.name,slug:row.slug,address,retail_status:row.retail_status,retail_notes:(previewPortfolioEnabled ? approvedPropertyHighlights[row.slug] : undefined) ?? row.retail_notes,latitude:row.latitude,longitude:row.longitude,map_verified:row.map_verified===1,geocode_status:row.geocode_status};
}
