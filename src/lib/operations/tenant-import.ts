/** Existing bounded, audited importer. Manual writes are enabled only on the
 * explicitly configured Teams preview after backup/migration verification.
 * Generic preview/production and hosted undo remain disabled. No access grants.
 */
import type { D1Database,D1PreparedStatement } from '@cloudflare/workers-types';
import type { Actor,Row } from './database';
import { adminEnv } from '@/lib/admin-auth';
const writable=new Set(['tenant_accounts','operations_tenants','units','operations_units','tenant_contacts','tenant_assignments','operations_assignment_profiles','tenant_upload_identity_links']);
const keys:Row={operations_tenants:'tenant_id',operations_units:'unit_id',operations_assignment_profiles:'assignment_id'};
const key=(table:string)=>keys[table]||'id';
const check=(ok:unknown,message:string)=>{if(!ok)throw Error(message);};
const canonical=(v:any):any=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const encode=(v:any)=>JSON.stringify(canonical(v));
async function digest(v:any){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(encode(v)))),b=>b.toString(16).padStart(2,'0')).join('');}
const statement=(db:D1Database,sql:string,...values:any[])=>db.prepare(sql).bind(...values);
async function all(db:D1Database,sql:string,...values:any[]){return (await statement(db,sql,...values).all<Row>()).results;}
async function gate(a:Actor,environment:string,binding:string,manual=false){
 if(manual&&environment==='teams-preview-manual'&&binding==='DB'){
  const env=adminEnv() as unknown as Record<string,string>;
  check(env.TENANT_MANUAL_IMPORT_DATABASE_ID==='2d04fbea-8af6-4d6d-b5bf-cf758666d55e','Manual import is not enabled on this database');
  check(await statement(a.db,"SELECT id FROM tenant_upload_configuration WHERE id='teams-preview' AND enabled=1 AND database_id=? AND length(backup_sha256)=64",env.TENANT_MANUAL_IMPORT_DATABASE_ID).first(),'Verified backup and migration release required');
  check(a.email&&await statement(a.db,'SELECT email FROM admin_identities WHERE email=? AND active=1',a.email).first(),'Active authenticated staff actor required');return;
 }
check(environment==='local-synthetic'&&binding==='DB','Preview/production import writes are disabled');check(a.email&&await statement(a.db,'SELECT email FROM admin_identities WHERE email=? AND active=1',a.email).first(),'Active authenticated staff actor required');check(await statement(a.db,"SELECT name FROM sqlite_master WHERE name='tenant_import_synthetic_only'").first(),'Synthetic-only DB marker missing');}
function tableCheck(table:string,read=false){check(writable.has(table)||(read&&table==='buildings'),'Unsupported import entity');}
function identifiers(data:Row){for(const name of Object.keys(data))check(/^[a-z_]+$/.test(name),'Invalid field');}
function guard(db:D1Database,token:string,table:string,entity:string,expected:Row|null){tableCheck(table,true);if(expected)identifiers(expected);const columns=expected?Object.keys(expected):[];const where=columns.map(c=>`${c} IS ?`).join(' AND ');return statement(db,`INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN ${expected?'EXISTS':'NOT EXISTS'}(SELECT 1 FROM ${table} WHERE ${key(table)}=?${where?' AND '+where:''}) THEN 1 ELSE 0 END`,token,entity,...columns.map(c=>expected![c]));}
function write(db:D1Database,c:Row){tableCheck(c.table);identifiers(c.after);const columns=Object.keys(c.after);if(c.before===null)return statement(db,`INSERT INTO ${c.table}(${columns.join(',')}) VALUES(${columns.map(()=>'?').join(',')})`,...columns.map(k=>c.after[k]));const fields=columns.filter(k=>k!==key(c.table));return statement(db,`UPDATE ${c.table} SET ${fields.map(k=>k+'=?').join(',')} WHERE ${key(c.table)}=?`,...fields.map(k=>c.after[k]),c.id);}
async function assertManifest(plan:Row){const {manifest_sha256,...body}=plan;check(await digest(body)===manifest_sha256,'Manifest changed after validation');check(plan.ready_for_approval,'Unresolved manifest');}
export async function commitTenantImport(a:Actor,plan:Row,approval:Row,options:{environment:string;binding:string;batchId:string;interruptAfterRecord?:number;maxRecords?:number}){
 await gate(a,options.environment,options.binding,true);await assertManifest(plan);
 check(typeof approval.backup_sha256==='string'&&/^[0-9a-f]{64}$/.test(approval.backup_sha256),'Approved backup hash required');
 if(options.environment==='teams-preview-manual')check(await statement(a.db,"SELECT id FROM tenant_upload_configuration WHERE id='teams-preview' AND enabled=1 AND backup_sha256=?",approval.backup_sha256).first(),'Approved backup changed');
 check(approval.approved_by===a.email&&approval.manifest_sha256===plan.manifest_sha256&&approval.approved_package_sha256===plan.approved_package_sha256,'Authenticated matching approval required');
 const db=a.db,batch=options.batchId;check(/^[a-zA-Z0-9:_-]{1,100}$/.test(batch),'Explicit valid batch ID required');
 check(!await statement(db,'SELECT record_id FROM tenant_import_undo_records WHERE batch_id=? LIMIT 1',batch).first(),'Batch undo has started; commit cannot resume');
 let old=await statement(db,'SELECT * FROM tenant_import_batches WHERE id=?',batch).first<Row>();
 if(old){check(old.source_sha256===plan.source_sha256&&old.approved_package_sha256===plan.approved_package_sha256&&old.parser_version===plan.parser_version,'Batch/package mismatch');check(!JSON.parse(old.counts_json).manifest_sha256||JSON.parse(old.counts_json).manifest_sha256===plan.manifest_sha256,'Resumed manifest changed');if(old.status==='committed')return {duplicate:true,created:0};check(['validated','committing','failed'].includes(old.status),'Batch cannot resume');}
 else{await statement(db,'INSERT INTO tenant_import_batches(id,source_sha256,approved_package_sha256,parser_version,status,requested_by,approved_by,counts_json) VALUES(?,?,?,?,?,?,?,?)',batch,plan.source_sha256,plan.approved_package_sha256,plan.parser_version,'validated',a.email,a.email,JSON.stringify({changes:plan.changes.length,items:plan.items.length,manifest_sha256:plan.manifest_sha256})).run();}
 await statement(db,"UPDATE tenant_import_batches SET status='committing' WHERE id=?",batch).run();let finished=0;
 try{
 for(const record of new Set<string>(plan.items.map((i:Row)=>i.record_id))){
  const items:Row[]=plan.items.filter((i:Row)=>i.record_id===record),existing=await all(db,'SELECT * FROM tenant_import_items WHERE batch_id=? AND record_id=?',batch,record);
  if(existing.length){check(existing.length===items.length&&items.every(i=>existing.some(old=>Object.entries(i).every(([k,v])=>old[k]===v))),'Persisted source mappings need reconciliation');continue;}
  if(options.maxRecords&&finished>=options.maxRecords)return {pending:true,finished};
  const prior=await all(db,'SELECT entity_type,entity_id,after_json FROM tenant_import_changes WHERE batch_id=?',batch);
  const applied=new Map(prior.map(c=>[c.entity_type+':'+c.entity_id,JSON.parse(c.after_json)]));
  const assignmentSnapshots=prior.filter(c=>c.entity_type==='tenant_assignments').map(c=>JSON.parse(c.after_json));
  const statements:D1PreparedStatement[]=[];let n=0;const token=batch+':'+record;
  statements.push(statement(db,'INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN EXISTS(SELECT 1 FROM admin_identities WHERE email=? AND active=1) THEN 1 ELSE 0 END',token+':actor',a.email));
  if(plan.upload_revision)statements.push(statement(db,"INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN EXISTS(SELECT 1 FROM tenant_uploads WHERE id=? AND revision=?) THEN 1 ELSE 0 END",token+':upload',plan.source_sha256,plan.upload_revision));
  for(const c of plan.collision_guards||[])if(c.record_id===record)statements.push(statement(db,"INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN NOT EXISTS(SELECT 1 FROM tenant_accounts WHERE lower(trim(display_name))=?) THEN 1 ELSE 0 END",token+':collision:'+n++,c.name));
  for(const g of plan.assignment_guards||[])if(g.record_id===record){
   const ids=[...new Set<string>([...g.expected,...assignmentSnapshots.filter(v=>v.unit_id===g.unit_id&&v.active).map(v=>v.id)])];
   statements.push(statement(db,`INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN (SELECT count(*) FROM tenant_assignments WHERE unit_id=? AND active=1)=? AND NOT EXISTS(SELECT 1 FROM tenant_assignments WHERE unit_id=? AND active=1${ids.length?' AND id NOT IN('+ids.map(()=>'?').join(',')+')':''}) THEN 1 ELSE 0 END`,token+':occupancy:'+n++,g.unit_id,ids.length,g.unit_id,...ids));
  }
  for(const p of plan.preconditions.filter((p:Row)=>p.record_ids.includes(record)))statements.push(guard(db,token+':'+n++,p.table,p.id,applied.get(p.table+':'+p.id)??p.row));
  for(const [index,c] of plan.changes.entries())if(c.record_id===record){
   statements.push(guard(db,token+':'+n++,c.table,c.id,c.before),write(db,c));
   statements.push(statement(db,'INSERT INTO tenant_import_change_records(batch_id,entity_type,entity_id,record_id) VALUES(?,?,?,?)',batch,c.table,c.id,record));
   const columns=(await all(db,`PRAGMA table_info(${c.table})`)).map(r=>r.name);check(columns.length,'Missing import table');
   const json=columns.map(col=>`'${col}',${col}`).join(',');
   statements.push(statement(db,`INSERT INTO tenant_import_changes(id,batch_id,entity_type,entity_id,operation,before_json,after_json,expected_version,actor_id) SELECT ?,?,?,?,?,?,json_object(${json}),${columns.includes('revision')?'revision':'NULL'},? FROM ${c.table} WHERE ${key(c.table)}=?`,batch+':'+index,batch,c.table,c.id,c.before===null?'create':'update',c.before===null?null:JSON.stringify(c.before),a.email,c.id));
  }
  for(const [index,i] of plan.items.entries())if(i.record_id===record)statements.push(statement(db,"INSERT INTO tenant_import_items(id,batch_id,record_id,source_sha256,source_sheet,source_row,source_cell,tenant_id,unit_id,contact_id,outcome,review_reason,reviewed_by,reviewed_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))",batch+':'+index,batch,i.record_id,i.source_sha256,i.source_sheet,i.source_row,i.source_cell,i.tenant_id,i.unit_id,i.contact_id,i.outcome,i.review_reason,i.reviewed_by));
  statements.push(statement(db,'DELETE FROM tenant_import_guards WHERE substr(id,1,?)=?',(token+':').length,token+':'));check(statements.length<=80,'Record exceeds bounded D1 batch; revalidate splitting');
  await db.batch(statements);finished++;if(options.interruptAfterRecord===finished)throw Error('Synthetic interruption after persisted record');
 }
 const count=await statement(db,'SELECT (SELECT count(*) FROM tenant_import_items WHERE batch_id=?) AS items,(SELECT count(*) FROM tenant_import_changes WHERE batch_id=?) AS changes',batch,batch).first<Row>();check(count?.items===plan.items.length&&count?.changes===plan.changes.length,'Manifest totals mismatch');
 check(!(await all(db,'PRAGMA foreign_key_check')).length,'Foreign-key reconciliation failed');
 await statement(db,"UPDATE tenant_import_batches SET status='committed',committed_at=datetime('now') WHERE id=?",batch).run();return {duplicate:false,items:count!.items,changes:count!.changes};
 }catch(error){await statement(db,"UPDATE tenant_import_batches SET status='failed' WHERE id=?",batch).run();throw error;}
}
export async function undoTenantImport(a:Actor,batch:string,options:{environment:string;binding:string;interruptAfterRecord?:number}){
 await gate(a,options.environment,options.binding);const db=a.db,b=await statement(db,'SELECT * FROM tenant_import_batches WHERE id=?',batch).first<Row>();
 check(b&&['committed','failed','undone'].includes(b.status),'Batch cannot be undone');if(b!.status==='undone')return {undone:true,duplicate:true};
 const changes=await all(db,'SELECT * FROM tenant_import_changes WHERE batch_id=? ORDER BY rowid DESC',batch),items=await all(db,'SELECT * FROM tenant_import_items WHERE batch_id=? ORDER BY rowid DESC',batch);
 const owners=await all(db,'SELECT entity_type,entity_id,record_id FROM tenant_import_change_records WHERE batch_id=?',batch);check(owners.length===changes.length&&changes.every(c=>owners.some(o=>o.entity_type===c.entity_type&&o.entity_id===c.entity_id)),'Missing change ownership; stop undo for reconciliation');
 const done=new Set((await all(db,'SELECT record_id FROM tenant_import_undo_records WHERE batch_id=?',batch)).map(r=>r.record_id));
 // Preflight all remaining snapshots before undoing any record. Actual batch
 // guards repeat these checks atomically to stop concurrent edits.
 const laterUseCondition=`EXISTS(SELECT 1 FROM tenant_sessions WHERE tenant_id=? AND created_at>=?) OR EXISTS(SELECT 1 FROM tenant_maintenance_requests WHERE tenant_id=? AND submitted_at>=?) OR EXISTS(SELECT 1 FROM operations_leaseholders h JOIN operations_leases l ON l.id=h.lease_id WHERE h.tenant_id=? AND l.created_at>=?) OR EXISTS(SELECT 1 FROM tenant_assignments WHERE tenant_id=? AND created_at>=? AND id NOT IN(SELECT entity_id FROM tenant_import_changes WHERE batch_id=? AND entity_type='tenant_assignments' AND operation='create')) OR EXISTS(SELECT 1 FROM tenant_contacts WHERE tenant_id=? AND created_at>=? AND id NOT IN(SELECT entity_id FROM tenant_import_changes WHERE batch_id=? AND entity_type='tenant_contacts' AND operation='create'))`;const useArgs=(tenant:string)=>[tenant,b!.created_at,tenant,b!.created_at,tenant,b!.created_at,tenant,b!.created_at,batch,tenant,b!.created_at,batch];
 const receipts=await all(db,"SELECT changes_json FROM tenant_import_undo_records WHERE batch_id=? AND record_id!='@intent'",batch);
 for(const c of changes){tableCheck(c.entity_type);
  // Already undone rows are identified by exact persisted entity IDs.
  if(receipts.some(r=>JSON.parse(r.changes_json).some((v:Row)=>v.table===c.entity_type&&v.id===c.entity_id)))continue;
  const current=await statement(db,`SELECT * FROM ${c.entity_type} WHERE ${key(c.entity_type)}=?`,c.entity_id).first<Row>();check(encode(current)===encode(JSON.parse(c.after_json)),'Later edit detected; stop undo for review');
 }
 for(const c of changes.filter(c=>c.entity_type==='tenant_accounts')){
  const used=await statement(db,'SELECT 1 WHERE '+laterUseCondition,...useArgs(c.entity_id)).first();
  check(!used,'Later operational use detected; stop undo for review');
 }
 if(!done.has('@intent'))await db.batch([statement(db,"INSERT INTO tenant_import_undo_records(batch_id,record_id,actor_id,changes_json) VALUES(?,'@intent',?,'[]')",batch,a.email),statement(db,"UPDATE tenant_import_batches SET status='failed' WHERE id=?",batch)]);
 // Changes retain source ownership in the private after snapshot through a
 // dedicated record mapping, avoiding inference from names or contact values.
 let finished=0;
 for(const record of new Set<string>(items.map(i=>i.record_id))){if(done.has(record))continue;
  const own=changes.filter(c=>owners.some(o=>o.record_id===record&&o.entity_type===c.entity_type&&o.entity_id===c.entity_id));const statements:D1PreparedStatement[]=[];let n=0;
  statements.push(statement(db,'INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN EXISTS(SELECT 1 FROM admin_identities WHERE email=? AND active=1) THEN 1 ELSE 0 END',batch+':undo:'+record+':actor',a.email));
  for(const c of own.filter(c=>c.entity_type==='tenant_accounts'))statements.push(statement(db,`INSERT INTO tenant_import_guards(id,ok) SELECT ?,CASE WHEN NOT (${laterUseCondition}) THEN 1 ELSE 0 END`,batch+':undo:'+record+':use:'+n++,...useArgs(c.entity_id)));
  for(const c of own)statements.push(guard(db,batch+':undo:'+record+':'+n++,c.entity_type,c.entity_id,JSON.parse(c.after_json)));
  statements.push(statement(db,'UPDATE tenant_import_items SET tenant_id=NULL,unit_id=NULL,contact_id=NULL WHERE batch_id=? AND record_id=?',batch,record));
  const undoEvidence:Row[]=[];
  for(const c of own){tableCheck(c.entity_type);const after=JSON.parse(c.after_json);if(c.before_json===null){statements.push(statement(db,`DELETE FROM ${c.entity_type} WHERE ${key(c.entity_type)}=?`,c.entity_id));undoEvidence.push({table:c.entity_type,id:c.entity_id,after:null});}
   else{const before=JSON.parse(c.before_json);if(typeof after.revision==='number')before.revision=after.revision+1;statements.push(write(db,{table:c.entity_type,id:c.entity_id,before:after,after:before}));undoEvidence.push({table:c.entity_type,id:c.entity_id,after:before});}}
  statements.push(statement(db,'INSERT INTO tenant_import_undo_records(batch_id,record_id,actor_id,changes_json) VALUES(?,?,?,?)',batch,record,a.email,JSON.stringify(undoEvidence)),statement(db,'DELETE FROM tenant_import_guards WHERE substr(id,1,?)=?',(batch+':undo:'+record+':').length,batch+':undo:'+record+':'));
  check(statements.length<=80,'Rollback record exceeds bounded D1 batch; review required');await db.batch(statements);finished++;
  if(options.interruptAfterRecord===finished)throw Error('Synthetic undo interruption after persisted record');
 }
 check((await all(db,"SELECT record_id FROM tenant_import_undo_records WHERE batch_id=? AND record_id!='@intent'",batch)).length===new Set(items.map(i=>i.record_id)).size,'Undo receipt totals mismatch');
 await statement(db,"UPDATE tenant_import_batches SET status='undone' WHERE id=?",batch).run();return {undone:true,records:new Set(items.map(i=>i.record_id)).size};
}
