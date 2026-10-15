/** Manual intake/planning adapter. All entity writes use the existing guarded runner. */
import {adminEnv} from '@/lib/admin-auth';
import {all,one,stmt,auditStatement,type Actor,type Row} from './database';
import {canonical,sha,validateBundle,type ReviewBundle} from './import-review';
import {commitTenantImport} from './tenant-import';
import {fail} from './validation';
import {UPLOAD_PARSER,type UploadRow} from './tenant-upload-parser';
export type Resolution={name:string;property:string;unit:string;tenantId:string;floor:number|null;contacts:{type:'phone'|'email';value:string;cell:string}[];distinct:boolean;reason:string};
const text=(v:unknown)=>String(v??'').trim();
const unitKey=(s:string)=>s.trim().toUpperCase();
const nameKey=(s:string)=>s.trim().toLowerCase();
const pk=(t:string)=>({operations_tenants:'tenant_id',operations_units:'unit_id',operations_assignment_profiles:'assignment_id'}[t]||'id');
export async function loadSeed(a:Actor):Promise<ReviewBundle|null>{
 const chunks=await all(a.db,"SELECT record_after_json FROM audit_log WHERE entity_type='tenant_import_review' AND action='bundle_chunk' ORDER BY entity_id");
 return chunks.length?validateBundle(JSON.parse(chunks.map(c=>JSON.parse(c.record_after_json).text).join(''))):null;
}
export async function catalog(a:Actor){return {properties:await all(a.db,"SELECT id,name FROM buildings WHERE publication_state!='archived' ORDER BY name"),units:await all(a.db,'SELECT id,building_id,unit_identifier,floor_number FROM units ORDER BY building_id,unit_identifier'),tenants:await all(a.db,'SELECT id,display_name FROM tenant_accounts ORDER BY display_name LIMIT 5000')};}
export async function buildUploadPlan(a:Actor,source:string,rows:UploadRow[],resolutions:Record<string,Resolution>={}){
 const tables=['buildings','units','operations_units','tenant_accounts','operations_tenants','tenant_contacts','tenant_assignments','operations_assignment_profiles','tenant_upload_identity_links'];
 const data:Record<string,Row[]>={};
 for(const table of tables){data[table]=await all(a.db,`SELECT * FROM ${table} LIMIT 10001`);if(data[table].length>10000)fail('Directory exceeds the safe single-upload planning limit.');}
 const changes:Row[]=[],preconditions:Row[]=[],items:Row[]=[],collision_guards:Row[]=[],assignment_guards:Row[]=[],preview:Row[]=[];
 const planned=new Map<string,Row>();
 const effective=rows.map(r=>({...r,...resolutions[r.id]}));
 const counts=new Map<string,number>();for(const r of effective)if(r.name)counts.set(nameKey(r.name),(counts.get(nameKey(r.name))||0)+1);
 for(const original of rows){
  const resolution=resolutions[original.id],r={...original,...resolution};
  const reasons:string[]=resolution?[]:[...r.reasons];
  const note=resolution?.reason||'Validated exact roster property/unit and distinguishable identity; authoritative current occupancy.';
  if(resolution&&(!text(resolution.reason)||resolution.reason.length>2000))reasons.push('Review needs a reason');
  if(!text(r.name)||r.name.length>200||/\b(unknown|unresolved|unnamed)\b/i.test(r.name))reasons.push('Confirm a distinguishable tenant name');
  if(!resolution&&/[&/]|\s(?:AND|ET AL)\s/i.test(r.name))reasons.push('Multiple names or roles require identity review');
  const propertyMatches=data.buildings.filter(b=>b.publication_state!=='archived'&&(b.id===r.property||b.name===r.property));
  const property=propertyMatches.length===1?propertyMatches[0]:null;
  if(!property)reasons.push('Choose one existing property');
  const units=data.units.filter(u=>u.building_id===property?.id&&unitKey(u.unit_identifier)===unitKey(r.unit));
  if(!text(r.unit)||r.unit.length>50||units.length>1)reasons.push('Confirm an exact text unit identifier');
  if(!units.length&&(!resolution||!Number.isInteger(r.floor)||r.floor!< -10||r.floor!>300))reasons.push('Missing apartment needs reviewed unit and confirmed floor');
  const unitId=units[0]?.id||'upload_unit_'+await sha([property?.id,r.unit&&unitKey(r.unit)]);
  const lineage=await sha([r.sheet,r.row,property?.id||'',unitId,text(r.name)]);
  const link=data.tenant_upload_identity_links.find(l=>l.id===lineage);
  let tenantId=text(r.tenantId)||link?.tenant_id||'';
  let tenant=tenantId?data.tenant_accounts.find(t=>t.id===tenantId):null;
  if(tenantId&&!tenant)reasons.push('Existing tenant ID not found');
  if(tenant&&tenant.display_name!==r.name)reasons.push('Existing tenant identity/name differs; review outside the import');
  const similar=data.tenant_accounts.filter(t=>nameKey(t.display_name)===nameKey(r.name)&&t.id!==tenantId);
  if((similar.length||(counts.get(nameKey(r.name))||0)>1)&&!resolution?.distinct)reasons.push('Duplicate/repeated name: choose existing tenant or document distinct identity');
  const shared=data.tenant_contacts.filter(c=>!c.archived&&r.contacts.some(v=>v.type===c.contact_type&&text(v.value).toLowerCase()===text(c.value_raw).toLowerCase())&&c.tenant_id!==tenantId);
  if(shared.length&&!resolution?.distinct)reasons.push('Shared contact: confirm separate identity, never merge by contact');
  const assignments=data.tenant_assignments.filter(v=>v.active&&v.tenant_id===tenantId);
  const occupants=data.tenant_assignments.filter(v=>v.active&&v.unit_id===unitId);
  if(tenant&&!assignments.some(v=>v.unit_id===unitId))reasons.push('Possible occupancy change requires separate assignment review');
  if(!tenant&&occupants.length&&!resolution)reasons.push('Existing apartment occupants: confirm additional occupant');
  if(!tenantId)tenantId='upload_tenant_'+await sha([r.sheet,r.row,property?.id||'',unitId,text(r.name)]);
  const contactRows=r.contacts.filter(c=>text(c.value));
  if(contactRows.length>15||contactRows.some(c=>!['email','phone'].includes(c.type)||c.value.length>500||!c.cell))reasons.push('Review contact values/roles');
  const proposedContacts=contactRows.map(c=>({type:c.type,value:c.value}));
  const oldContactValues=tenant?data.tenant_contacts.filter(c=>c.tenant_id===tenantId&&!c.archived).map(c=>({type:c.contact_type,value:c.value_raw})):[];
  let outcome=tenant?'unchanged':'new';
  if(tenant&&contactRows.some(c=>!oldContactValues.some(v=>v.type===c.type&&v.value===c.value)))outcome='contact_update';
  if(tenant?.email&&contactRows.some(c=>c.type==='email'&&text(c.value).toLowerCase()!==text(tenant!.email).toLowerCase())&&!resolution)reasons.push('Contact differs from login email: review contact-only update; login will not change');
  const entry:Row={...original,lineage,name:r.name,property:property?.id||r.property,property_name:property?.name||r.property,unit:r.unit,tenantId:tenant?.id||'',contacts:proposedContacts,reasons:[...new Set(reasons)],outcome:reasons.length?'hold':outcome,current:!reasons.length,review_reason:resolution?.reason||''};
  preview.push(entry);if(reasons.length)continue;
  const ownChanges:Row[]=[],ownReads:Row[]=[];
  function read(table:string,id:string){const row=data[table].find(v=>v[pk(table)]===id)||null;ownReads.push({table,id,row,record_ids:[r.id]});return row;}
  function add(table:string,id:string,values:Row){const before=read(table,id),after=before?{...before,...values}:values;const key=table+':'+id;if(planned.has(key)){if(canonical(planned.get(key)!.after)!==canonical(after))fail('Conflicting changes in upload. Resolve the shared record.');return;}if(canonical(before)===canonical(after))return;const c={table,id,record_id:r.id,before,after};planned.set(key,c);ownChanges.push(c);}
  read('buildings',property!.id);
  if(!units.length){add('units',unitId,{id:unitId,building_id:property!.id,unit_identifier:r.unit,floor_number:r.floor,status:'unverified'});add('operations_units',unitId,{unit_id:unitId});entry.apartment='create';}
  else{read('units',unitId);read('operations_units',unitId);entry.apartment='match';}
  if(!tenant){add('tenant_accounts',tenantId,{id:tenantId,email:null,display_name:r.name,active:0});add('operations_tenants',tenantId,{tenant_id:tenantId});if(!resolution?.distinct)collision_guards.push({record_id:r.id,name:nameKey(r.name)});}
  else{read('tenant_accounts',tenantId);read('operations_tenants',tenantId);}
  const existingAssignment=data.tenant_assignments.find(v=>v.tenant_id===tenantId&&v.unit_id===unitId);
  if(existingAssignment){read('tenant_assignments',existingAssignment.id);read('operations_assignment_profiles',existingAssignment.id);}
  else{const assignment='upload_assignment_'+await sha([tenantId,unitId]);add('tenant_assignments',assignment,{id:assignment,tenant_id:tenantId,building_id:property!.id,unit_id:unitId,active:1});add('operations_assignment_profiles',assignment,{assignment_id:assignment,assignment_status:'current',relationship_type:'occupant'});}
  if(!link)add('tenant_upload_identity_links',lineage,{id:lineage,tenant_id:tenantId,source_sheet:r.sheet,source_row:r.row,building_id:property!.id,unit_id:unitId,source_name:r.name});else read('tenant_upload_identity_links',lineage);
  const item=(cell:string,contactId:string|null=null)=>items.push({record_id:r.id,source_sha256:source,source_sheet:r.sheet,source_row:r.row,source_cell:cell,tenant_id:tenantId,unit_id:unitId,contact_id:contactId,outcome:cell==='@row'?(tenant?outcome==='contact_update'?'update':'link':'create'):'link',review_reason:note,reviewed_by:a.email});
  item('@row');
  const seen=new Set<string>();
  for(const c of contactRows){
   const value=text(c.value),key=c.type+':'+value;if(seen.has(key))continue;seen.add(key);
   const exact=data.tenant_contacts.find(v=>v.tenant_id===tenantId&&v.contact_type===c.type&&v.value_raw===value&&!v.archived);
   const contactId=exact?.id||'upload_contact_'+await sha([tenantId,c.type,value]);
   if(exact)read('tenant_contacts',contactId);
   else add('tenant_contacts',contactId,{id:contactId,tenant_id:tenantId,contact_type:c.type,value_raw:value,value_normalized:c.type==='email'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?value.toLowerCase():null,validation_state:c.type==='email'?(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'syntax_valid':'invalid'):'unreviewed',label:'roster',verified_at:null,is_primary:0});
   item(c.cell,contactId);
  }
  // Retire only contacts created by earlier uploads at the same stable source lineage.
  // Existing staff contacts and blanks never clear existing values.
  if(link&&tenant&&outcome==='contact_update')for(const c of data.tenant_contacts.filter(c=>c.tenant_id===tenantId&&!c.archived&&c.id.startsWith('upload_contact_'))){
   if(contactRows.some(v=>v.type===c.contact_type)&&!contactRows.some(v=>v.type===c.contact_type&&text(v.value)===c.value_raw))add('tenant_contacts',c.id,{archived:1,revision:c.revision+1,updated_at:new Date().toISOString()});
  }
  if(tenant&&outcome==='contact_update'){const profile=data.operations_tenants.find(p=>p.tenant_id===tenantId);if(profile)add('operations_tenants',tenantId,{revision:profile.revision+1});}
  assignment_guards.push({record_id:r.id,unit_id:unitId,expected:data.tenant_assignments.filter(v=>v.unit_id===unitId&&v.active).map(v=>v.id)});
  const statementCount=4*ownChanges.length+ownReads.length+items.filter(i=>i.record_id===r.id).length+5;
  if(statementCount>80){
   entry.outcome='hold';entry.current=false;entry.reasons.push('This record exceeds the safe atomic import limit; review and split contacts.');
   for(const c of ownChanges)planned.delete(c.table+':'+c.id);
   for(let i=items.length-1;i>=0;i--)if(items[i].record_id===r.id)items.splice(i,1);
   for(let i=collision_guards.length-1;i>=0;i--)if(collision_guards[i].record_id===r.id)collision_guards.splice(i,1);
   continue;
  }
  changes.push(...ownChanges);preconditions.push(...ownReads);
 }
 const liveIds=new Set(preview.filter(r=>r.outcome!=='hold').map(r=>r.tenantId).filter(Boolean));
 // Missing rows are informational only; never emit assignment/deactivation writes.
 const oldLinks=data.tenant_upload_identity_links;
 const lineages=new Set(preview.map(r=>r.lineage));
 const missing=oldLinks.filter(l=>!lineages.has(l.id)&&!liveIds.has(l.tenant_id)).map(l=>({tenantId:l.tenant_id,name:l.source_name,property:l.building_id,unitId:l.unit_id,action:'Review only — occupancy retained'}));
 const plan:Row={source_sha256:source,approved_package_sha256:await sha({rows,resolutions}),parser_version:UPLOAD_PARSER,changes,preconditions,items,collision_guards,assignment_guards,ready_for_approval:true};
 plan.manifest_sha256=await sha(plan);
 return {plan,preview:{rows:preview,missing,summary:{candidates:rows.length,validated:preview.filter(r=>r.outcome!=='hold').length,held:preview.filter(r=>r.outcome==='hold').length,new:preview.filter(r=>r.outcome==='new').length,updates:preview.filter(r=>r.outcome==='contact_update').length,unchanged:preview.filter(r=>r.outcome==='unchanged').length,missing:missing.length}}};
}
export async function saveUpload(a:Actor,id:string,fileName:string,rows:UploadRow[]){
 const old=await one(a.db,'SELECT id FROM tenant_uploads WHERE id=?',id);if(old)return getUpload(a,id);
 const built=await buildUploadPlan(a,id,rows);
 await a.db.batch([stmt(a.db,'INSERT OR IGNORE INTO tenant_uploads(id,file_name,parser_version,rows_json,preview_json,plan_json,created_by) VALUES(?,?,?,?,?,?,?)',id,fileName,UPLOAD_PARSER,JSON.stringify(rows),JSON.stringify(built.preview),JSON.stringify(built.plan),a.email),auditStatement(a,'tenant_manual_upload',id,null,{action:'validated',candidates:rows.length},'validated')]);return getUpload(a,id);
}
export async function getUpload(a:Actor,id:string){
 const saved=await one(a.db,'SELECT * FROM tenant_uploads WHERE id=?',id);if(!saved)fail('Upload not found.',404);
 const imported=await all(a.db,"SELECT record_id,tenant_id,unit_id,outcome FROM tenant_import_items WHERE batch_id=? AND source_cell='@row'",'manual:'+id);
 const batch=await one(a.db,'SELECT status FROM tenant_import_batches WHERE id=?','manual:'+id);
 const result=await one(a.db,"SELECT COUNT(DISTINCT i.record_id) AS records,COUNT(DISTINCT i.tenant_id) AS occupants,COUNT(DISTINCT u.building_id) AS properties,COUNT(DISTINCT i.unit_id) AS apartments,(SELECT count(*) FROM tenant_import_changes c WHERE c.batch_id=? AND c.entity_type='units' AND c.operation='create') AS apartmentsCreated FROM tenant_import_items i JOIN units u ON u.id=i.unit_id WHERE i.batch_id=? AND i.source_cell='@row'",'manual:'+id,'manual:'+id);
 return {results:result,id,revision:saved!.revision,fileName:saved!.file_name,createdAt:saved!.created_at,preview:JSON.parse(saved!.preview_json),resolutions:JSON.parse(saved!.resolutions_json),imported,batchStatus:batch?.status||'preview'};
}
export async function resolveUpload(a:Actor,id:string,revision:number,key:string,value:Resolution){
 const saved=await one(a.db,'SELECT * FROM tenant_uploads WHERE id=?',id);if(!saved)fail('Upload not found.',404);
 if(await one(a.db,'SELECT id FROM tenant_import_batches WHERE id=?','manual:'+id))fail('Import has started. Finish this batch; review remaining exceptions in a later upload.',409);
 if(saved!.revision!==revision)fail('This upload changed. Reload before saving.',409);
 const rows:UploadRow[]=JSON.parse(saved!.rows_json);if(!rows.some(r=>r.id===key))fail('Unknown source record.');
 if(!value||typeof value.name!=='string'||typeof value.property!=='string'||typeof value.unit!=='string'||typeof value.tenantId!=='string'||typeof value.distinct!=='boolean'||typeof value.reason!=='string'||!Array.isArray(value.contacts)||value.contacts.some(c=>!c||!['phone','email'].includes(c.type)||typeof c.value!=='string'||typeof c.cell!=='string')||!(value.floor===null||Number.isInteger(value.floor)))fail('Enter a complete review resolution.');
 const resolutions={...JSON.parse(saved!.resolutions_json),[key]:value};
 const built=await buildUploadPlan(a,id,rows,resolutions);
 const results=await a.db.batch([stmt(a.db,'INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN EXISTS(SELECT 1 FROM tenant_uploads WHERE id=? AND revision=?) AND NOT EXISTS(SELECT 1 FROM tenant_import_batches WHERE id=?) THEN 1 ELSE 0 END','resolve:'+crypto.randomUUID(),id,revision,'manual:'+id),stmt(a.db,"UPDATE tenant_uploads SET resolutions_json=?,preview_json=?,plan_json=?,revision=revision+1,updated_at=datetime('now') WHERE id=? AND revision=?",JSON.stringify(resolutions),JSON.stringify(built.preview),JSON.stringify(built.plan),id,revision),auditStatement(a,'tenant_manual_upload',id,{record:key,resolution:JSON.parse(saved!.resolutions_json)[key]||null},{record:key,resolution:value},'reviewed'),stmt(a.db,"DELETE FROM tenant_import_guards WHERE id LIKE 'resolve:%'")]);
 if(!results[1].meta.changes)fail('Another reviewer saved first. Reload.',409);return getUpload(a,id);
}
export async function importUpload(a:Actor,id:string,revision:number){
 const saved=await one(a.db,'SELECT * FROM tenant_uploads WHERE id=?',id);if(!saved)fail('Upload not found.',404);if(saved!.revision!==revision)fail('This upload changed. Reload before importing.',409);
 const config=await one(a.db,"SELECT * FROM tenant_upload_configuration WHERE id='teams-preview' AND enabled=1");if(!config)fail('Import is unavailable until preview backup and migration verification are complete.',503);
 const env=adminEnv() as unknown as Record<string,string>;if(env.TENANT_MANUAL_IMPORT_DATABASE_ID!==config!.database_id)fail('Import target is not enabled.',503);
 const plan=JSON.parse(saved!.plan_json);if(!plan.items.length)fail('No validated records are ready. Review exceptions first.');
 // The existing runner attributes the approval to the importing Admin, not the uploader.
 const execution={...plan,upload_revision:revision,items:plan.items.map((i:Row)=>({...i,reviewed_by:a.email}))};delete execution.manifest_sha256;execution.manifest_sha256=await sha(execution);
 const batch=await one(a.db,'SELECT approved_by FROM tenant_import_batches WHERE id=?','manual:'+id);
 if(batch&&batch.approved_by!==a.email)fail('The Admin who started this batch must resume it.',409);
 await commitTenantImport(a,execution,{backup_sha256:config!.backup_sha256,approved_by:a.email,manifest_sha256:execution.manifest_sha256,approved_package_sha256:execution.approved_package_sha256},{environment:'teams-preview-manual',binding:'DB',batchId:'manual:'+id,maxRecords:8});
 return getUpload(a,id);
}
