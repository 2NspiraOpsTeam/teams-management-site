import { publicDataCache } from './public-data-cache';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import { previewPortfolioEnabled } from './preview-portfolio';
export type RetailProperty={id:string;name:string;slug:string;address:{street:string;city:string;state:string;zip:string;neighborhood?:string};retail_status:'active'|'commercial_component'|'planned';retail_notes:string|null;latitude?:number|null;longitude?:number|null;map_verified?:boolean;geocode_status?:string|null};
// NYC Planning Labs GeoSearch / NYC PAD address points, checked 2026-10-13.
// These preview-only split listings do not have corresponding verified D1 map rows.
const splitWest46thPoints = {
  349: { latitude: 40.76077, longitude: -73.989656 },
  351: { latitude: 40.76076, longitude: -73.98966 },
} as const;
const splitWest46th: RetailProperty[] = ([349,351] as const).map(number=>({
 id:`real-${number}-w-46th-st`,name:`${number} W 46th St`,slug:`${number}-w-46th-st`,
 address:{street:`${number} W 46th St`,city:'New York',state:'NY',zip:'10036'},
 retail_status:'commercial_component',retail_notes:null,
 ...splitWest46thPoints[number],map_verified:true,geocode_status:'verified',
}));
export async function listPublicRetail():Promise<RetailProperty[]>{
 return publicDataCache('public-retail',async()=>{
 const db=(getCloudflareContext().env as {DB?:D1Database}).DB;if(!db)throw new Error('Teams D1 unavailable');
 const result=await db.prepare(`SELECT id,name,slug,address_json,retail_status,retail_notes,latitude,longitude,map_verified,geocode_status FROM buildings WHERE has_retail=1 AND retail_published=1 AND retail_status IN ('active','commercial_component','planned') AND publication_state ${previewPortfolioEnabled ? "!='archived'" : "='published'"} ORDER BY CASE retail_status WHEN 'planned' THEN 1 ELSE 0 END,name`).all<{id:string;name:string;slug:string;address_json:string;retail_status:RetailProperty['retail_status'];retail_notes:string|null;latitude:number|null;longitude:number|null;map_verified:number;geocode_status:string|null}>();
 const items=result.results.map(row=>({id:row.id,name:row.name,slug:row.slug,address:{...JSON.parse(row.address_json),zip:JSON.parse(row.address_json).zip||''},retail_status:row.retail_status,retail_notes:row.retail_notes,latitude:row.latitude,longitude:row.longitude,map_verified:row.map_verified===1,geocode_status:row.geocode_status}));
 return previewPortfolioEnabled?[...items.filter(item=>item.slug!=='349-351-w-46th-st'),...splitWest46th].sort((a,b)=>a.name.localeCompare(b.name)):items;
 });
}

export async function getPublicRetail(slug:string):Promise<RetailProperty|null>{
 if(previewPortfolioEnabled){const split=splitWest46th.find(item=>item.slug===slug);if(split)return split;if(slug==='349-351-w-46th-st')return null;}
 const db=(getCloudflareContext().env as {DB?:D1Database}).DB;if(!db)throw new Error('Teams D1 unavailable');
 const row=await db.prepare(`SELECT id,name,slug,address_json,retail_status,retail_notes,latitude,longitude,map_verified,geocode_status FROM buildings WHERE slug=? AND has_retail=1 AND retail_published=1 AND retail_status IN ('active','commercial_component','planned') AND publication_state ${previewPortfolioEnabled ? "!='archived'" : "='published'"}`).bind(slug).first<{id:string;name:string;slug:string;address_json:string;retail_status:RetailProperty['retail_status'];retail_notes:string|null;latitude:number|null;longitude:number|null;map_verified:number;geocode_status:string|null}>();
 if(!row)return null;let address:RetailProperty['address'];try{const parsed=JSON.parse(row.address_json);address={street:parsed.street||'',city:parsed.city||'',state:parsed.state||'',zip:parsed.zip||'',neighborhood:parsed.neighborhood};}catch{return null;}return {id:row.id,name:row.name,slug:row.slug,address,retail_status:row.retail_status,retail_notes:row.retail_notes,latitude:row.latitude,longitude:row.longitude,map_verified:row.map_verified===1,geocode_status:row.geocode_status};
}
