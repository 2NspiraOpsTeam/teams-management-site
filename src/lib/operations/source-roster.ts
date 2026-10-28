import {all,page,type Actor} from './database';
import {fail} from './validation';
/** Immutable provided Phone List evidence, projected independently of verification. */
export async function sourceRoster(a:Actor,url:URL){
 const chunks=await all(a.db,"SELECT record_after_json FROM audit_log WHERE entity_type='tenant_source_roster' AND action='source_chunk' ORDER BY entity_id");
 if(!chunks.length)return {items:[],nextPage:null,total:0,sourceRows:0,sourceContacts:0};
 const encoded=chunks.map(r=>JSON.parse(r.record_after_json).text).join('');
 const summaries=await all(a.db,"SELECT record_after_json FROM audit_log WHERE id='phone-source-roster:summary'");
 if(summaries.length!==1)fail('Source roster integrity metadata is unavailable.',503);
 const summary=JSON.parse(summaries[0].record_after_json);
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(encoded))),v=>v.toString(16).padStart(2,'0')).join('');
 if(digest!==summary.bundle_sha256)fail('Source roster integrity check failed.',503);
 const bundle=JSON.parse(encoded),property=url.searchParams.get('buildingId')||'',query=(url.searchParams.get('q')||'').trim().toLocaleLowerCase(),p=page(url);
 const records=bundle.records.filter((r:any)=>(!property||r.property===property)&&(!query||[r.address,r.unit,r.name,r.source_tenant_text,...r.contacts.map((c:any)=>c.contact_value_raw)].some(v=>String(v||'').toLocaleLowerCase().includes(query))));
 const visible=records.slice(p.offset,p.offset+50),buildings=[...new Set<string>(visible.map((r:any)=>String(r.property)))];
 const units=buildings.length?await all(a.db,`SELECT id,building_id,unit_identifier FROM units WHERE building_id IN (${buildings.map(()=>'?').join(',')})`,...buildings):[];
 return {items:visible.map((r:any)=>({...r,unit_id:units.find(u=>u.building_id===r.property&&u.unit_identifier.trim().toUpperCase()===r.unit.trim().toUpperCase())?.id||null})),nextPage:records.length>p.offset+50?p.page+1:null,total:records.length,sourceRows:summary.rows,sourceContacts:summary.contacts,source_sha256:bundle.source_sha256};
}
