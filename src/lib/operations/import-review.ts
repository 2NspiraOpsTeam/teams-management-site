// Preparation only. No tenant writes, approval manifests, or import endpoints.
export type ReviewRow=Record<string,any>;
export type ReviewBundle={format:string;bundle_sha256:string;baseline_sha256:string;inventory_sha256:string;summary:ReviewRow;properties:ReviewRow[];aliases:ReviewRow[];records:ReviewRow[];repeat_groups:ReviewRow[];source_archive:ReviewRow[];candidate_approval_enabled:false;import_enabled:false};
export type ReviewValue={outcome:string;property_id:string;note:string;reviewer:string};
export type ReviewEvent={sequence:number;at:string;key:string;before:ReviewValue|null;after:ReviewValue};
export type ReviewDraft={format:'teams-review-draft-1';bundle_sha256:string;events:ReviewEvent[]};
export const outcomes=['review','hold','mapping_approved','separate_by_record','distinct_with_evidence','confirmation_requested'] as const;
export function canonical(v:any):string {if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';}
export async function sha(v:unknown){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(v)));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
function check(ok:unknown,message:string):asserts ok {if(!ok)throw Error(message);}
export async function validateBundle(v:any):Promise<ReviewBundle>{
 check(v?.format==='teams-import-review-1'&&v.candidate_approval_enabled===false&&v.import_enabled===false,'Not a preparation-only review bundle.');
 const {bundle_sha256,...payload}=v;check(await sha(payload)===bundle_sha256,'Review bundle changed. Regenerate it from the immutable baseline.');
 check(Array.isArray(v.records)&&Array.isArray(v.aliases)&&Array.isArray(v.properties)&&Array.isArray(v.repeat_groups)&&Array.isArray(v.source_archive),'Incomplete review bundle.');
 check(v.records.every((r:ReviewRow)=>r.decision==='review'),'All candidates must remain unapproved.');
 check(new Set(v.records.map((r:ReviewRow)=>r.record_id)).size===v.records.length,'Duplicate candidate IDs.');
 check(new Set(v.aliases.map((r:ReviewRow)=>r.property_map_key)).size===v.aliases.length,'Duplicate alias IDs.');
 return v;
}
export function current(draft:ReviewDraft,key:string):ReviewValue|null {return [...draft.events].reverse().find(e=>e.key===key)?.after||null;}
export function validateValue(bundle:ReviewBundle,key:string,value:ReviewValue){
 const alias=bundle.aliases.find(a=>'alias:'+a.property_map_key===key),record=bundle.records.find(r=>'record:'+r.record_id===key);
 check(alias||record,'Unknown review item.');check(outcomes.includes(value.outcome as any),'Unknown review outcome.');
 check(value.reviewer.trim().length>0&&value.reviewer.length<=200,'Enter the staff reviewer.');
 check(value.note.trim().length>0&&value.note.length<=4000,'Record the reason or evidence.');
 check(!value.property_id||bundle.properties.some(p=>p.id===value.property_id&&p.publication_state!=='archived'&&!p.name.startsWith('[QA]')),'Choose an existing non-archived operational property.');
 check(value.outcome!=='mapping_approved'||!!value.property_id,'A mapping approval needs an exact property.');
 check(value.outcome!=='mapping_approved'||!!alias,'Candidate approval is disabled. Use a review resolution instead.');
 check(value.outcome!=='separate_by_record'||!!alias,'Use the alias to request record-level separation.');
}
export function appendEvent(bundle:ReviewBundle,draft:ReviewDraft,key:string,value:ReviewValue,at=new Date().toISOString()):ReviewDraft{
 check(draft.bundle_sha256===bundle.bundle_sha256,'Draft belongs to a different bundle.');validateValue(bundle,key,value);
 const before=current(draft,key);if(canonical(before)===canonical(value))return draft;
 return {...draft,events:[...draft.events,{sequence:draft.events.length+1,at,key,before,after:{...value}}]};
}
export function validateDraft(bundle:ReviewBundle,v:any):ReviewDraft{
 check(v?.format==='teams-review-draft-1'&&v.bundle_sha256===bundle.bundle_sha256&&Array.isArray(v.events),'Draft belongs to a different review bundle.');
 let replay:ReviewDraft={format:'teams-review-draft-1',bundle_sha256:bundle.bundle_sha256,events:[]};
 for(const e of v.events){check(e.sequence===replay.events.length+1&&Number.isFinite(Date.parse(e.at)),'Invalid audit sequence.');check(canonical(e.before)===canonical(current(replay,e.key)),'Review history was changed.');replay=appendEvent(bundle,replay,e.key,e.after,e.at);}
 check(replay.events.length===v.events.length,'Duplicate audit event.');return replay;
}

// Conservative triage, never an import eligibility or authorization decision.
export function readiness(bundle:ReviewBundle,draft:ReviewDraft,r:ReviewRow){
 const mapping=current(draft,'alias:'+r.property_map_key);
 const property=mapping?.outcome==='mapping_approved' ? bundle.properties.find(p=>p.id===mapping.property_id&&p.publication_state!=='archived'&&!p.name.startsWith('[QA]')) : null;
 const units=(r.unit_proposals||[]).filter((u:ReviewRow)=>u.building_id===property?.id);
 const repeated=bundle.repeat_groups.some(g=>g.record_ids.includes(r.record_id));
 const labelConflict=(bundle as ReviewBundle & {label_conflicts?:string[][]}).label_conflicts?.some(g=>g.includes(r.record_id));
 const resolution=current(draft,'record:'+r.record_id);
 const blockers:string[]=[];
 if(!property)blockers.push('Property mapping not verified');
 if(units.length!==1)blockers.push('Exact unit not verified');
 if(!String(r.tenant_name_proposed||'').trim()||/unknown|unresolved|unnamed/i.test(r.tenant_name_proposed))blockers.push('Tenant name needs confirmation');
 if(repeated||labelConflict||(r.flags||[]).some((f:string)=>/identity|different_contacts|name_|household|business|repeat|duplicate/.test(f)))blockers.push('Identity / repeat review required');
 if((r.existing_assignments||[]).length)blockers.push('Existing assignment requires review');
 if((r.flags||[]).some((f:string)=>/separation|unconfirmed|unresolved/.test(f)))blockers.push('Source ambiguity requires review');
 if(resolution&&resolution.outcome!=='review')blockers.push('Staff resolution requires reconciliation');
 return {ready:blockers.length===0,label:blockers.length?'On Hold':'Ready for Review',blockers};
}
export function mappingPriority(a:ReviewRow){return /NOVITA|349.*351|TREMONT|BRUCKNER/i.test(a.source_property_alias)?0:1;}
