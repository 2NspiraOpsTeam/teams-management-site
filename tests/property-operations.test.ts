import {renewalData,filterRenewals} from '../src/lib/operations/renewals';
import { beforeEach,afterEach,expect,it,vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
const state=vi.hoisted(()=>({actor:null as any,env:{} as any,tenant:null as any,db:null as any}));
vi.mock('../src/lib/admin-auth',()=>({adminEnv:()=>state.env,requireAdmin:async()=>state.actor,hash:async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('')}));
vi.mock('../src/lib/tenant-auth',()=>({currentTenant:async()=>state.tenant,tenantDb:()=>state.db}));
import { operationsRequest } from '../src/lib/operations/handler';
import { tenantLeaseList,tenantDocument,approvedPropertyContacts,availableTenantLease } from '../src/lib/operations/tenant-leases';
import { date } from '../src/lib/operations/validation';
let sql:DatabaseSync;
function adapter(){return {prepare(query:string){let args:any[]=[];const p={bind(...values:any[]){args=values;return p;},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}};}};return p;},async batch(statements:any[]){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};}
const origin='https://operations.example';
const request=async(path:string,method='GET',data?:any,extraHeaders={})=>operationsRequest(new Request(origin+'/api/admin/operations/'+path,{method,headers:{origin,'content-type':'application/json',...extraHeaders},...(method!=='GET'?{body:JSON.stringify(data||{})}:{})}),path.split('?')[0].split('/'));
const createUnit=(identifier='2A',building='b1',key=crypto.randomUUID())=>request('units','POST',{idempotencyKey:key,building_id:building,unit_identifier:identifier,floor_number:2,status:'unverified',bedrooms:2,bathrooms:1,square_feet:800});
const holder=(tenant='t1')=>({tenant_id:tenant,holder_role:'leaseholder',can_view_document:true,show_rent:false});
const leaseInput=(extra={})=>({idempotencyKey:crypto.randomUUID(),unit_id:'u1',lease_start:'2026-01-01',lease_end:'2027-12-31',monthly_rent:'2100.25',security_deposit:'2100.25',status:'active',renewal_status:'not_started',portal_published:false,holders:[holder()],...extra});
const createLease=async(extra={})=>{const data=leaseInput(extra),response=await request('leases','POST',data);expect(response.status).toBe(201);return {data,...await response.json()};};
beforeEach(()=>{sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const file of ['schema.sql','admin-phase1.sql','admin-otp.sql','tenant-portal.sql','work-orders-mvp.sql'])sql.exec(readFileSync('src/lib/migrations/'+file,'utf8'));sql.exec(`INSERT INTO buildings(id,name,slug,address_json) VALUES('b1','QA One','qa-one','{"street":"100 QA St","city":"New York","state":"NY","zip":"10021"}'),('b2','QA Two','qa-two','{}'); INSERT INTO units(id,building_id,unit_identifier,floor_number,status) VALUES('u1','b1','1A',1,'unverified'),('u2','b2','1B',1,'unverified'); INSERT INTO tenant_accounts(id,email,display_name,active) VALUES('t1','one@example.test','QA One',1),('t2','two@example.test','QA Two',1); INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES('a1','t1','b1','u1'),('a2','t2','b2','u2'); INSERT INTO admin_identities(email) VALUES('admin@example.test'); INSERT INTO tenant_sessions(token_hash,tenant_id,expires_at) VALUES('fixture-token','t1',datetime('now','+1 day')); INSERT INTO tenant_maintenance_requests(id,tenant_id,assignment_id,category,description,urgency,preferred_contact) VALUES('r1','t1','a1','plumbing','QA existing request','routine','email');`);sql.exec(readFileSync('src/lib/migrations/property-operations.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/rent-roll-source.sql','utf8'));sql.exec('BEGIN');sql.exec(readFileSync('src/lib/migrations/tenant-directory-identity-nullable.sql','utf8'));sql.exec('COMMIT');sql.exec(readFileSync('src/lib/migrations/tenant-directory-import.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/tenant-directory-names.sql','utf8'));state.db=adapter();state.actor={db:state.db,email:'admin@example.test'};state.env={PROPERTY_OPERATIONS_ENABLED:'1',TENANT_LEASES_ENABLED:'1'};state.tenant={id:'t1',email:'one@example.test'};});
afterEach(()=>sql.close());
it('applies additively and idempotently without replacing existing identities, units, assignments or maintenance',()=>{sql.exec(readFileSync('src/lib/migrations/property-operations.sql','utf8'));expect(sql.prepare('SELECT unit_id FROM tenant_assignments WHERE id=?').get('a1')?.unit_id).toBe('u1');expect(sql.prepare('SELECT assignment_id FROM tenant_maintenance_requests WHERE id=?').get('r1')?.assignment_id).toBe('a1');expect(sql.prepare('SELECT COUNT(*) AS n FROM tenant_accounts').get()?.n).toBe(2);});
it('denies anonymous, tenant-only and foreign-origin writes before touching records',async()=>{state.actor=null;expect((await request('units')).status).toBe(401);state.actor={db:state.db,email:'admin@example.test'};expect((await request('units','POST',{}, {origin:'https://foreign.example'})).status).toBe(401);state.env.PROPERTY_OPERATIONS_ENABLED='0';expect((await request('tenants')).status).toBe(404);expect(sql.prepare('SELECT COUNT(*) AS n FROM units').get()?.n).toBe(2);});
it('suppresses identical create retries and refuses duplicate units including case/whitespace variants',async()=>{const key=crypto.randomUUID();const a=await createUnit('2A','b1',key);expect(a.status).toBe(201);const b=await createUnit('2A','b1',key);expect(b.status).toBe(200);expect((await b.json()).duplicate).toBe(true);expect((await createUnit(' 2a ')).status).toBe(409);expect(sql.prepare('SELECT COUNT(*) AS n FROM units').get()?.n).toBe(3);});
it('rejects stale edits and rolls back the core unit update when its audit fails',async()=>{let r=await request('units/u1','PATCH',{revision:1,building_id:'b1',unit_identifier:'1A',floor_number:1,status:'maintenance',internal_notes:'private'});expect(r.status).toBe(200);r=await request('units/u1','PATCH',{revision:1,unit_identifier:'1A',floor_number:3,status:'occupied'});expect(r.status).toBe(409);sql.exec("CREATE TRIGGER qa_audit_failure BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'QA forced audit failure'); END;");r=await request('units/u1','PATCH',{revision:2,unit_identifier:'CHANGED',floor_number:3,status:'occupied'});expect(r.status).toBe(409);expect(sql.prepare('SELECT unit_identifier,status FROM units WHERE id=?').get('u1')).toMatchObject({unit_identifier:'1A',status:'maintenance'});});
it('never infers vacancy, and refuses confirmed vacant for an assigned unit',async()=>{const r=await request('units/u1','PATCH',{revision:1,unit_identifier:'1A',floor_number:1,status:'unverified',vacancy_confirmed:true});expect(r.status).toBe(409);const d=await(await request('overview')).json();expect(d.total_units).toBe(2);expect(d.occupied_units).toBe(2);expect(d.confirmed_vacant_units).toBe(0);});
it('preserves original assignment/history during reassignment, revokes sessions and supports several tenants in a unit',async()=>{const moved=await request('assignments','POST',{idempotencyKey:crypto.randomUUID(),tenant_id:'t1',unit_id:'u2',occupant_role:'primary_leaseholder',replace_current:true,active:true,revision:1,move_in_date:'2026-10-15'});expect(moved.status).toBe(201);expect(sql.prepare('SELECT unit_id,building_id,active FROM tenant_assignments WHERE id=?').get('a1')).toMatchObject({unit_id:'u1',building_id:'b1',active:0});expect(sql.prepare('SELECT revoked_at FROM tenant_sessions WHERE tenant_id=?').get('t1')?.revoked_at).toBeTruthy();expect(sql.prepare("SELECT COUNT(*) AS n FROM tenant_assignments WHERE unit_id='u2' AND active=1").get()?.n).toBe(2);const old=await(await request('maintenance?unitId=u1')).json(),newUnit=await(await request('maintenance?unitId=u2')).json();expect(old.items.map((x:any)=>x.id)).toContain('r1');expect(newUnit.items).toHaveLength(0);});
it('guards assignment concurrency and retry receipts without silently moving identities',async()=>{const data={idempotencyKey:crypto.randomUUID(),tenant_id:'t1',unit_id:'u2',occupant_role:'authorized_occupant',active:true,revision:1};expect((await request('assignments','POST',data)).status).toBe(201);expect((await request('assignments','POST',data)).status).toBe(201);expect((await request('assignments','POST',{...data,idempotencyKey:crypto.randomUUID()})).status).toBe(409);expect((await request('tenants/t1','PATCH',{revision:2,display_name:'QA One',email:'new@example.test',active:true})).status).toBe(409);});
it('supports one superintendent across multiple properties and shares contacts only with explicit property approval',async()=>{const data={idempotencyKey:crypto.randomUUID(),full_name:'QA Superintendent',mobile_phone:'+12125550100',email:'qa-super@example.test',contact_status:'active',internal_notes:'PRIVATE SUPER NOTE',assignments:[{building_id:'b1',tenant_contact_approved:false},{building_id:'b2',tenant_contact_approved:false}]};const r=await request('superintendents','POST',data);expect(r.status).toBe(201);const {id}=await r.json();expect(await approvedPropertyContacts()).toEqual([]);expect((await request('superintendents/'+id,'PATCH',{...data,revision:1,assignments:[{building_id:'b1',tenant_contact_approved:true},{building_id:'b2',tenant_contact_approved:false}]})).status).toBe(200);const contacts=await approvedPropertyContacts();expect(contacts).toHaveLength(1);expect(JSON.stringify(contacts)).not.toContain('PRIVATE SUPER NOTE');state.tenant={id:'t2'};expect(await approvedPropertyContacts()).toEqual([]);});
it('keeps historical leases during renewal and supports multiple independently permissioned leaseholders',async()=>{const old=await createLease({holders:[holder(),holder('t2')]});const renewal=await createLease({predecessor_id:old.id,lease_start:'2028-01-01',lease_end:'2029-12-31',monthly_rent:'2200.00'});expect(renewal.id).not.toBe(old.id);expect(sql.prepare('SELECT monthly_rent_cents,lease_end FROM operations_leases WHERE id=?').get(old.id)).toMatchObject({monthly_rent_cents:210025,lease_end:'2027-12-31'});expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_leaseholders WHERE lease_id=?').get(old.id)?.n).toBe(2);expect((await request('leases/'+old.id,'PATCH',{...old.data,revision:1,unit_id:'u2'})).status).toBe(409);});
it('validates complete dates, chronological lease terms and precise monetary values',async()=>{expect(()=>date('2027-02-30',true)).toThrow();expect(()=>date('2027-99-12',true)).toThrow();expect((await request('leases','POST',leaseInput({lease_end:'2025-01-01'}))).status).toBe(400);expect((await request('leases','POST',leaseInput({monthly_rent:'1.999'}))).status).toBe(400);const lease=await createLease({monthly_rent:'0',security_deposit:'0'});expect(sql.prepare('SELECT monthly_rent_cents FROM operations_leases WHERE id=?').get(lease.id)?.monthly_rent_cents).toBe(0);});
it('leaves uploads and incomplete tenant lease UI unavailable when private storage is absent',async()=>{const l=await createLease();const r=await operationsRequest(new Request(origin+'/upload',{method:'POST',headers:{origin,'content-type':'application/pdf','x-upload-id':crypto.randomUUID()},body:'%PDF-1.7\nQA document'}),['leases',l.id,'documents']);expect(r.status).toBe(503);expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_lease_documents').get()?.n).toBe(0);expect(await availableTenantLease('t1')).toBe(false);await expect(tenantLeaseList()).rejects.toMatchObject({status:404});});
function privateBucket(){const files=new Map<string,Uint8Array>();state.env.LEASE_DOCUMENTS={async put(k:string,bytes:Uint8Array){files.set(k,bytes);},async get(k:string){const bytes=files.get(k);return bytes?{size:bytes.length,body:new Blob([bytes as Uint8Array<ArrayBuffer>]).stream()}:null;},async delete(k:string){files.delete(k);}};return files;}
async function upload(lease:string,key=crypto.randomUUID(),pdf='%PDF-1.7\nQA signed lease fixture'){return operationsRequest(new Request(origin+'/upload',{method:'POST',headers:{origin,'content-type':'application/pdf','x-upload-id':key,'x-file-name':'qa-lease.pdf'},body:pdf}),['leases',lease,'documents']);}
it('keeps document bytes out of D1, checks PDF input and suppresses upload retries',async()=>{const files=privateBucket(),l=await createLease(),key=crypto.randomUUID();expect((await upload(l.id,key)).status).toBe(201);expect((await upload(l.id,key)).status).toBe(201);expect(files.size).toBe(1);expect((await upload(l.id,crypto.randomUUID(),'not a PDF')).status).toBe(400);const columns=sql.prepare('PRAGMA table_info(operations_lease_documents)').all();expect(columns.some(c=>String(c.type).toUpperCase()==='BLOB')).toBe(false);expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_lease_documents').get()?.n).toBe(1);});
it('scopes published tenant leases/documents to own leaseholder AND active matched assignment, and omits private fields/rent by default',async()=>{privateBucket();const l=await createLease({internal_notes:'PRIVATE LEASE NOTE'});const uploaded=await upload(l.id);const doc=await uploaded.json();expect((await request('leases/'+l.id,'PATCH',{...l.data,revision:1,portal_published:true})).status).toBe(200);const leases=await tenantLeaseList();expect(leases).toHaveLength(1);expect(leases[0]).not.toHaveProperty('monthly_rent_cents');expect(JSON.stringify(leases)).not.toContain('PRIVATE LEASE NOTE');expect(JSON.stringify(leases)).not.toContain('storage_key');const pdf=await tenantDocument(doc.id);expect(pdf.status).toBe(200);expect(pdf.headers.get('cache-control')).toBe('private, no-store');expect(pdf.headers.get('content-disposition')).toContain('attachment');state.tenant={id:'t2'};expect(await tenantLeaseList()).toEqual([]);await expect(tenantDocument(doc.id)).rejects.toMatchObject({status:404});state.tenant={id:'t1'};sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='a1'");await expect(tenantDocument(doc.id)).rejects.toMatchObject({status:404});state.tenant=null;await expect(tenantDocument(doc.id)).rejects.toMatchObject({status:401});});
it('paginates 400 units with stable ordering and uses indexed property/unit/request lookups',async()=>{const insert=sql.prepare('INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES(?,?,?,?)');for(let i=0;i<400;i++)insert.run('scale-'+i,'b1','S'+String(i).padStart(3,'0'),2);const ids:string[]=[];for(let p=0;p<9;p++){const r=await request('units?buildingId=b1&page='+p),d=await r.json();expect(r.status).toBe(200);expect(d.items.length).toBeLessThanOrEqual(50);ids.push(...d.items.map((x:any)=>x.id));if(d.nextPage===null)break;}expect(ids).toHaveLength(401);expect(new Set(ids).size).toBe(401);const plan=sql.prepare('EXPLAIN QUERY PLAN SELECT id FROM units WHERE building_id=? ORDER BY unit_identifier COLLATE NOCASE,id LIMIT 51').all('b1');expect(JSON.stringify(plan)).toContain('operations_unit_lookup');const maintenancePlan=sql.prepare("EXPLAIN QUERY PLAN SELECT id FROM tenant_maintenance_requests WHERE assignment_id=? AND status NOT IN('completed','closed')").all('a1');expect(JSON.stringify(maintenancePlan)).toContain('operations_open_requests');});
it('concurrent document retries cannot delete or overwrite the winning private object',async()=>{const files=privateBucket(),l=await createLease(),key=crypto.randomUUID();const responses=await Promise.all([upload(l.id,key),upload(l.id,key)]);expect(responses.every(r=>r.status===201||r.status===409)).toBe(true);expect(files.size).toBe(1);const doc=sql.prepare('SELECT storage_key,sha256 FROM operations_lease_documents WHERE id=?').get(key);expect(doc).toBeTruthy();expect(files.has(String(doc!.storage_key))).toBe(true);expect((await upload(l.id,key,'%PDF-1.7\nDIFFERENT PAYLOAD')).status).toBe(409);expect(files.size).toBe(1);});
it('staff assignment is property-validated, audited, and never duplicates the underlying maintenance request',async()=>{const r=await request('superintendents','POST',{idempotencyKey:crypto.randomUUID(),full_name:'QA Staff',assignments:[{building_id:'b2',tenant_contact_approved:false}]});const s=await r.json();expect((await request('maintenance/r1/assignment','POST',{revision:1,superintendent_id:s.id})).status).toBe(400);expect((await request('maintenance/r1/assignment','POST',{revision:1,staff_email:'admin@example.test'})).status).toBe(200);expect((await request('maintenance/r1/assignment','POST',{revision:1,staff_email:null})).status).toBe(409);expect(sql.prepare('SELECT COUNT(*) AS n FROM tenant_maintenance_requests').get()?.n).toBe(1);expect(sql.prepare("SELECT visibility FROM work_order_events WHERE request_id='r1' AND kind='internal'").get()?.visibility).toBe('internal');});
it('filters the property directory by building, assigned superintendent and open maintenance without changing identities',async()=>{
 const saved=await request('superintendents','POST',{idempotencyKey:crypto.randomUUID(),full_name:'QA Portfolio Superintendent',assignments:[{building_id:'b1',tenant_contact_approved:false}]});const superintendent=await saved.json();expect(saved.status).toBe(201);
 const filtered=await(await request('properties?superintendentId='+superintendent.id+'&openOnly=1&sort=maintenance')).json();expect(filtered.items.map((p:any)=>p.id)).toEqual(['b1']);expect(filtered.items[0].superintendent_names).toBe('QA Portfolio Superintendent');
 const other=await(await request('properties?buildingId=b2')).json();expect(other.items.map((p:any)=>p.id)).toEqual(['b2']);expect(other.items[0].superintendent_names).toBeNull();
 expect(sql.prepare('SELECT COUNT(*) AS n FROM buildings').get()?.n).toBe(2);
});
it('creates staff-managed tenants without email, contacts or portal access and suppresses retries',async()=>{
 const v={idempotencyKey:crypto.randomUUID(),display_name:'[QA] Contactless Business',contacts:[]};const a=await request('tenants','POST',v);expect(a.status).toBe(201);const created=await a.json();expect(sql.prepare('SELECT email,active FROM tenant_accounts WHERE id=?').get(created.id)).toMatchObject({email:null,active:0});expect((await request('tenants','POST',v)).status).toBe(200);expect((await request('tenants','POST',{...v,idempotencyKey:crypto.randomUUID(),active:true})).status).toBe(409);
});
it('stores multiple shared contacts without merging people, preserves login and sessions on email edit',async()=>{
 const contacts=[{contact_type:'email',value_raw:'Shared@Example.test',label:'CC',is_primary:true},{contact_type:'phone',value_raw:'not yet validated',label:'alternate'}];
 for(const name of ['[QA] First','[QA] Second'])expect((await request('tenants','POST',{idempotencyKey:crypto.randomUUID(),display_name:name,contacts})).status).toBe(201);
 const response=await request('tenants/t1','PATCH',{revision:1,display_name:'QA Updated',contacts});expect(response.status).toBe(200);expect(sql.prepare("SELECT email,active FROM tenant_accounts WHERE id='t1'").get()).toMatchObject({email:'one@example.test',active:1});expect(sql.prepare("SELECT revoked_at FROM tenant_sessions WHERE tenant_id='t1'").get()?.revoked_at).toBeNull();expect(sql.prepare('SELECT count(*) AS n FROM tenant_accounts').get()?.n).toBe(4);
 const d=await(await request('tenants/t1')).json();expect(d.contacts).toHaveLength(2);expect(d.contacts.every((c:any)=>c.validation_state==='unreviewed'&&c.verified_at===null)).toBe(true);expect((await(await request('tenants?q=Shared')).json()).items).toHaveLength(3);
});
it('enforces contact ownership, primary limits and stale edits atomically',async()=>{
 const contacts=[{contact_type:'phone',value_raw:'001',is_primary:true},{contact_type:'phone',value_raw:'002',is_primary:true}];expect((await request('tenants/t1','PATCH',{revision:1,display_name:'Wrong',contacts})).status).toBe(400);
 expect((await request('tenants/t1','PATCH',{revision:1,display_name:'QA One',contacts:[contacts[0]]})).status).toBe(200);const d=await(await request('tenants/t1')).json();
 expect((await request('tenants/t2','PATCH',{revision:1,display_name:'Stolen',contacts:d.contacts})).status).toBe(409);
 expect((await request('tenants/t1','PATCH',{revision:1,display_name:'Stale',contacts:[]})).status).toBe(409);expect(sql.prepare("SELECT display_name FROM tenant_accounts WHERE id='t1'").get()?.display_name).toBe('QA One');expect(sql.prepare('SELECT count(*) AS n FROM tenant_contacts WHERE archived=0').get()?.n).toBe(1);
});
it('retains removed contacts privately in history and never exposes directory contacts anonymously',async()=>{
 expect((await request('tenants/t1','PATCH',{revision:1,display_name:'QA One',contacts:[{contact_type:'email',value_raw:'private@example.test',label:'CC'}]})).status).toBe(200);
 expect((await request('tenants/t1','PATCH',{revision:2,display_name:'QA One',contacts:[]})).status).toBe(200);expect(sql.prepare('SELECT archived FROM tenant_contacts').get()?.archived).toBe(1);
 state.actor=null;expect((await request('tenants/t1')).status).toBe(401);expect((await request('tenants')).status).toBe(401);
});
it('preserves existing IDs and foreign-key integrity across the nullable-identity prerequisite',()=>{
 expect(sql.prepare('PRAGMA foreign_key_check').all()).toEqual([]);expect(sql.prepare("SELECT assignment_id FROM tenant_maintenance_requests WHERE id='r1'").get()?.assignment_id).toBe('a1');expect(()=>sql.prepare("INSERT INTO tenant_contacts(id,tenant_id,contact_type,value_raw) VALUES('invalid','missing','phone','555')").run()).toThrow();
});

it('preserves confirmed normalization on role-only edits and clears verification when contact text changes',async()=>{
 const cid=crypto.randomUUID();sql.prepare("INSERT INTO tenant_contacts(id,tenant_id,contact_type,label,value_raw,value_normalized,country_code,extension,validation_state,verified_at) VALUES(?,'t1','phone','mobile','212 555 0100 ext 9','+12125550100','US','9','verified','2026-01-01')").run(cid);
 let d=await(await request('tenants/t1')).json();expect((await request('tenants/t1','PATCH',{revision:1,display_name:'QA One',contacts:d.contacts.map((c:any)=>({...c,label:'alternate'}))})).status).toBe(200);
 d=await(await request('tenants/t1')).json();expect(d.contacts[0]).toMatchObject({value_normalized:'+12125550100',country_code:'US',extension:'9',validation_state:'verified'});
 expect((await request('tenants/t1','PATCH',{revision:2,display_name:'QA One',contacts:d.contacts.map((c:any)=>({...c,value_raw:'Unknown new phone'}))})).status).toBe(200);d=await(await request('tenants/t1')).json();expect(d.contacts[0]).toMatchObject({value_normalized:null,country_code:null,extension:null,validation_state:'unreviewed',verified_at:null});
});
it('shares contacts and exact bidirectional associations across property, apartment and tenant lists without copying identities',async()=>{
 sql.exec("INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES('a3','t2','b1','u1')");
 const before=sql.prepare('SELECT COUNT(*) AS n FROM tenant_accounts').get();
 expect((await request('tenants/t1','PATCH',{revision:1,display_name:'QA Updated',contacts:[{contact_type:'phone',value_raw:'212-555-0100',label:'mobile'},{contact_type:'email',value_raw:'contact@example.test',label:'contact'}]})).status).toBe(200);
 const units=await(await request('units?buildingId=b1')).json(),tenants=await(await request('tenants?buildingId=b1')).json();
 expect(units.items[0].associations.map((a:any)=>a.tenant_id).sort()).toEqual(['t1','t2']);
 const link=units.items[0].associations.find((a:any)=>a.tenant_id==='t1');expect(link).toMatchObject({building_id:'b1',unit_id:'u1',phone:'212-555-0100',contact_email:'contact@example.test',active:1});
 expect(tenants.items.find((t:any)=>t.id==='t1').associations[0]).toEqual(link);
 const property=await(await request('properties/b1')).json();expect(property.current_occupants).toBe(2);expect(property.occupied_units).toBe(1);expect(property.open_maintenance).toBe(1);expect(property.expiring_90_days).toBe(0);
 expect(sql.prepare('SELECT COUNT(*) AS n FROM tenant_accounts').get()).toEqual(before);
 expect(sql.prepare("SELECT assignment_id FROM tenant_maintenance_requests WHERE id='r1'").get()?.assignment_id).toBe('a1');
});
it('retains ended and proposed property associations without presenting them as current occupancy',async()=>{
 sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='a1'; INSERT INTO operations_assignment_profiles(assignment_id,assignment_status) VALUES('a1','proposed')");
 const tenants=await(await request('tenants?buildingId=b1')).json();expect(tenants.items.map((t:any)=>t.id)).toEqual(['t1']);expect(tenants.items[0].associations[0]).toMatchObject({active:0,assignment_status:'proposed',unit_id:'u1'});
 const property=await(await request('properties/b1')).json();expect(property.current_occupants).toBe(0);expect(property.occupied_units).toBe(0);expect(property.confirmed_vacant_units).toBe(0);
 expect((await(await request('tenants?unitId=u2')).json()).items.map((t:any)=>t.id)).toEqual(['t2']);
});

it('unifies maintenance IDs, tenant scoping and effective status filters across Admin and tenant history',async()=>{
 const {orderSelect,authorized,detail:workDetail}=await import('../src/lib/work-orders/server');
 sql.exec("INSERT INTO operations_work_order_profiles(request_id,workflow_status) VALUES('r1','scheduled'); UPDATE tenant_maintenance_requests SET status='scheduled' WHERE id='r1'");
 for(const path of ['maintenance?tenantId=t1','maintenance?unitId=u1','maintenance?buildingId=b1','maintenance?status=scheduled']){
  const result=await(await request(path)).json();expect(result.items).toHaveLength(1);expect(result.items[0]).toMatchObject({id:'r1',tenant_id:'t1',unit_id:'u1',building_id:'b1',status:'scheduled'});
 }
 expect((await(await request('maintenance?tenantId=t2')).json()).items).toHaveLength(0);
 expect((await(await request('maintenance?status=in_progress')).json()).items).toHaveLength(0);
 expect(await authorized(state.db,'r1','t2')).toBeNull();expect(await authorized(state.db,'r1','t1')).toBeTruthy();
 sql.exec("UPDATE operations_work_order_profiles SET workflow_status='cancelled' WHERE request_id='r1'; UPDATE tenant_maintenance_requests SET status='closed' WHERE id='r1'");
 expect((await(await request('maintenance?status=cancelled')).json()).items[0].status).toBe('cancelled');
 expect((await(await request('maintenance?openOnly=1')).json()).items).toHaveLength(0);
 expect((await workDetail(state.db,'r1'))?.request.status).toBe('cancelled');
 expect(sql.prepare(orderSelect+" WHERE r.id='r1'").get()?.status).toBe('cancelled');
});
it('updates a shared lease without changing the unit, tenant or maintenance history',async()=>{
 const lease=await createLease();expect((await request('leases/'+lease.id,'PATCH',{...lease.data,revision:1,lease_end:'2028-06-30'})).status).toBe(200);
 for(const path of ['leases?tenantId=t1','leases?unitId=u1','leases?buildingId=b1'])expect((await(await request(path)).json()).items[0]).toMatchObject({id:lease.id,lease_end:'2028-06-30'});
 expect((await(await request('leases/'+lease.id)).json())).toMatchObject({unit_identifier:'1A',property_name:'QA One',unit_id:'u1'});
 expect(sql.prepare('SELECT COUNT(*) AS n FROM tenant_accounts').get()?.n).toBe(2);expect(sql.prepare('SELECT COUNT(*) AS n FROM units').get()?.n).toBe(2);expect(sql.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
});
it('finds property apartments by occupant name and preserved contact without cross-property leakage',async()=>{
 sql.exec("INSERT INTO tenant_contacts(id,tenant_id,contact_type,label,value_raw) VALUES('contact-search','t1','phone','mobile','212-555-0199')");
 for(const q of ['QA One','212-555']){const found=await(await request('units?buildingId=b1&q='+encodeURIComponent(q))).json();expect(found.items.map((r:any)=>r.id)).toEqual(['u1']);expect((await(await request('units?buildingId=b2&q='+encodeURIComponent(q))).json()).items).toEqual([]);}
});
it('rejects a fresh duplicate lease receipt while retaining safe same-receipt retry',async()=>{
 const lease=await createLease();expect((await request('leases','POST',lease.data)).status).toBe(200);expect((await request('leases','POST',{...lease.data,idempotencyKey:crypto.randomUUID()})).status).toBe(409);expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_leases').get()?.n).toBe(1);
});
it('retains former leaseholders in Admin history and links renewal agreements in both directions',async()=>{
 const old=await createLease();const next=await createLease({predecessor_id:old.id,lease_start:'2028-01-01',lease_end:'2029-12-31'});
 expect((await request('leases/'+old.id,'PATCH',{...old.data,revision:2,status:'renewed',renewal_status:'renewed',holders:[holder('t2')]})).status).toBe(200);
 const tenant=await(await request('leases?tenantId=t1')).json();expect(tenant.items.map((r:any)=>r.id)).toContain(old.id);
 const detail=await(await request('leases/'+old.id)).json();expect(detail.renewals.map((r:any)=>r.id)).toEqual([next.id]);expect((await(await request('leases/'+next.id)).json()).predecessor_id).toBe(old.id);
});
it('refuses editing a different lease into a duplicate apartment and date range',async()=>{
 const old=await createLease();const next=await createLease({lease_start:'2028-01-01',lease_end:'2029-12-31'});
 expect((await request('leases/'+next.id,'PATCH',{...next.data,revision:1,lease_start:old.data.lease_start,lease_end:old.data.lease_end})).status).toBe(409);
 expect((await(await request('leases/'+next.id)).json()).lease_start).toBe('2028-01-01');
});

it('builds the rent roll without fanout and reflects lease edits and assignments immediately',async()=>{
 const l=await createLease();sql.exec("INSERT INTO tenant_assignments(id,tenant_id,unit_id,building_id,active) VALUES('a-extra','t2','u1','b1',1)");
 let d=await(await request('rent-roll?buildingId=b1')).json();expect(d.items).toHaveLength(1);expect(d.items[0]).toMatchObject({id:'u1',lease_id:l.id,monthly_rent_cents:210025,occupancy:'Current occupants'});expect(d.items[0].occupants).toContain('QA');
 expect((await request('leases/'+l.id,'PATCH',{...l.data,revision:1,monthly_rent:'2250.50'})).status).toBe(200);
 d=await(await request('rent-roll?buildingId=b1')).json();expect(d.items[0].monthly_rent_cents).toBe(225050);
 sql.exec("UPDATE tenant_assignments SET active=0 WHERE unit_id='u1'");d=await(await request('rent-roll?buildingId=b1')).json();expect(d.items[0].occupancy).toBe('Needs occupancy review');expect(d.items[0].occupants).toBeNull();
 expect((await(await request('rent-roll?buildingId=b2')).json()).items[0].lease_status).toBe('Lease information not supplied');
 expect((await(await request('rent-roll?review=occupancy')).json()).items.map((r:any)=>r.id)).toEqual(['u1']);
 state.actor=null;expect((await request('rent-roll')).status).toBe(401);
});
it('paginates rent roll apartments once each and scopes searches to saved data',async()=>{
 for(let i=0;i<105;i++)sql.prepare('INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES(?,?,?,1)').run('rr-'+i,'b1','R'+String(i).padStart(3,'0'));
 const ids=[];for(let page=0;page<3;page++){const d=await(await request('rent-roll?buildingId=b1&page='+page)).json();ids.push(...d.items.map((r:any)=>r.id));}expect(ids).toHaveLength(106);expect(new Set(ids).size).toBe(106);
 expect((await(await request('rent-roll?q=R10')).json()).items).toHaveLength(5);expect((await request('rent-roll?review=invalid')).status).toBe(400);
});

it('exports filtered complete pages using an allowlist, rejects unauthorized/cross-origin and audits success',async()=>{
 const exported=await request('tenants/export?buildingId=b1&format=csv','POST');expect(exported.status).toBe(200);const text=await exported.text();expect(text).toContain('QA One');expect(text).not.toContain('QA Two');expect(text).not.toContain('token');expect(text).not.toContain('active_sessions');expect(text).not.toContain('one@example.test');expect(exported.headers.get('cache-control')).toBe('private, no-store');expect(sql.prepare("SELECT action FROM audit_log WHERE entity_type='operations_export'").get()?.action).toBe('exported');
 expect((await request('tenants/export','GET')).status).not.toBe(200);expect((await request('tenants/export','POST',{}, {origin:'https://foreign.example'})).status).toBe(401);state.actor=null;expect((await request('tenants/export','POST')).status).toBe(401);
});
it('exports every matching page without fanout and refuses over-budget exports rather than truncating',async()=>{
 const insert=sql.prepare('INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES(?,?,?,1)');for(let i=0;i<110;i++)insert.run('ex-'+i,'b1','E'+i);
 let r=await request('rent-roll/export?buildingId=b1&format=csv','POST');expect(r.status).toBe(200);expect(r.headers.get('X-Export-Rows')).toBe('111');
 for(let i=110;i<1000;i++)insert.run('ex-'+i,'b1','E'+i);r=await request('rent-roll/export?buildingId=b1&format=csv','POST');expect(r.status).toBe(422);
});

it('phone list defaults to current, distinguishes historical and keeps multiple occupants/contacts without fanout',async()=>{
 sql.exec("INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id,active) VALUES('a3','t2','b1','u1',1); UPDATE tenant_assignments SET active=0 WHERE id='a2'; INSERT INTO tenant_contacts(id,tenant_id,contact_type,value_raw) VALUES('c1','t1','phone','(212) 555-0100'),('c2','t1','phone','212-555-0199'),('c3','t1','email','tenant@example.test');");
 const current=await(await request('phone-list?buildingId=b1')).json();expect(current.items).toHaveLength(2);expect(current.items[0].phones).toContain('555-0100');expect(current.items[0].phones).toContain('555-0199');expect(current.items[0].emails).toBe('tenant@example.test');
 expect((await(await request('phone-list?occupancy=historical')).json()).items.map((r:any)=>r.id)).toEqual(['a2']);expect((await(await request('phone-list?occupancy=all')).json()).items).toHaveLength(3);
 for(const query of ['2125550100','tenant@example','100 QA St','1A','QA One'])expect((await(await request('phone-list?q='+encodeURIComponent(query))).json()).items.length).toBeGreaterThan(0);
 expect((await(await request('phone-list?missing=phone')).json()).items.map((r:any)=>r.tenant_id)).toEqual(['t2']);expect((await(await request('phone-list?missing=email')).json()).items).toHaveLength(1);
 expect((await(await request('phone-list?buildingId=missing')).json()).items).toEqual([]);expect((await request('phone-list?occupancy=bad')).status).toBe(400);
});
it('confirmed names and preferred contact propagate without modifying login identity or sessions',async()=>{
 const r=await request('tenants/t1','PATCH',{revision:1,display_name:'ignored',first_name:'QA',last_name:'Updated',preferred_contact:'phone',contacts:[{contact_type:'phone',value_raw:'212-555-0123'}]});expect(r.status).toBe(200);
 const tenant=await(await request('tenants/t1')).json();expect(tenant).toMatchObject({display_name:'QA Updated',first_name:'QA',last_name:'Updated',preferred_contact:'phone',email:'one@example.test',active:1});expect(sql.prepare("SELECT revoked_at FROM tenant_sessions WHERE tenant_id='t1'").get()?.revoked_at).toBeNull();
 expect((await(await request('phone-list')).json()).items[0]).toMatchObject({display_name:'QA Updated',phones:'212-555-0123'});expect((await(await request('rent-roll?buildingId=b1')).json()).items[0].occupants).toBe('QA Updated');expect(sql.prepare('SELECT COUNT(*) AS n FROM tenant_accounts').get()?.n).toBe(2);
});
it('authorizes and audits print data, and never exports identity/session fields in phone list',async()=>{
 const r=await request('phone-list/print?buildingId=b1','POST');expect(r.status).toBe(200);expect((await r.json()).items).toHaveLength(1);expect(sql.prepare("SELECT action FROM audit_log WHERE entity_type='operations_print'").get()?.action).toBe('print_prepared');
 const exported=await request('phone-list/export?buildingId=b1&format=csv','POST');expect(exported.status).toBe(200);const text=await exported.text();expect(text).not.toContain('one@example.test');expect(text).not.toContain('token');
 expect((await request('phone-list/print','POST',{}, {origin:'https://foreign.example'})).status).toBe(401);state.actor=null;expect((await request('phone-list')).status).toBe(401);expect((await request('phone-list/print','POST')).status).toBe(401);expect((await request('phone-list/export','POST')).status).toBe(401);
});
it('dashboard drill-downs match operational figures and workflow overrides update counts everywhere',async()=>{
 let summary=await(await request('overview')).json();for(const [key,path] of [['current_occupants','tenants?review=current'],['missing_superintendent','properties?review=missing_superintendent'],['missing_contact','tenants?review=missing_contact'],['open_maintenance','maintenance?openOnly=1'],['missing_current_lease','rent-roll?review=missing_lease'],['occupancy_review','rent-roll?review=occupancy']] as const)expect((await(await request(path)).json()).items.length).toBe(summary[key]);
 sql.exec("INSERT INTO operations_work_order_profiles(request_id,workflow_status) VALUES('r1','cancelled')");summary=await(await request('overview')).json();expect(summary.open_maintenance).toBe(0);expect((await(await request('properties/b1')).json()).open_maintenance).toBe(0);expect((await(await request('units/u1')).json()).open_maintenance).toBe(0);expect((await(await request('rent-roll?buildingId=b1')).json()).items[0].open_maintenance).toBe(0);
});

it('separates imported values from verified renewal counts, retaining unknown codes and month-to-month text',async()=>{
 sql.exec("INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,tenant_name,status_code,bedrooms,lease_expiration,legal_rent,rent,source_values_json,imported_by) VALUES('u1','hash','October 2026',1,'October 2026','Original workbook name','D','2 + office','2026-11-30','D','0.00','[]','qa'),('u2','hash','October 2026',2,'October 2026','Other','RC','STORE','Month to Month','D','123.45','[]','qa')");
 const d=await renewalData(state.actor,'2026-10-16');expect(d.summary.days_90).toBe(1);expect(d.summary.missing).toBe(0);expect(d.summary.month_to_month).toBe(1);expect(d.months.find(m=>m.month==='2026-11')?.count).toBe(1);expect(filterRenewals(d,new URL(origin+'?view=calendar&month=2026-11'))).toHaveLength(1);expect(filterRenewals(d,new URL(origin+'?view=review'))).toHaveLength(2);
 const r=await(await request('rent-roll')).json();expect(r.items.find((r:any)=>r.id==='u1')).toMatchObject({rent_roll_status:'D',rent_roll_legal_rent:'D',rent_roll_bedrooms:'2 + office',rent_roll_rent:'0.00'});expect((await(await request('units/u1')).json()).rent_roll_source.tenant_name).toBe('Original workbook name');
});
it('counts each confirmed lease once per month, uses inclusive rolling windows without summing, and filters the same exact records',async()=>{
 const one=await createLease({lease_end:'2026-10-31'});await createLease({unit_id:'u2',lease_end:'2026-11-15',holders:[holder('t2')]});
 const d=await renewalData(state.actor,'2026-10-16');expect(d.summary).toMatchObject({this_month:0,next_month:0,days_30:0,days_60:0,days_90:0,distinct_upcoming:2});expect(d.months.reduce((n,m)=>n+m.count,0)).toBe(0);expect(filterRenewals(d,new URL(origin+'?month=2026-10')).map(r=>r.lease_id)).toEqual([one.id]);
});
it('preserves original renewal history, excludes predecessor from forecast and updates after move-out without inferring vacancy',async()=>{
 const old=await createLease({lease_end:'2026-10-31'});const renewed=await createLease({predecessor_id:old.id,lease_start:'2026-11-01',lease_end:'2027-10-31'});
 const d=await renewalData(state.actor,'2026-10-16');expect(d.summary.days_90).toBe(0);expect(d.rows.find(r=>r.id===old.id)).toMatchObject({lease_status:'renewed',successor_id:renewed.id});expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_leases').get()?.n).toBe(2);
 const future=await renewalData(state.actor,'2026-11-01');expect(future.summary.distinct_upcoming).toBe(1);sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='a1'");expect((await renewalData(state.actor,'2026-11-01')).summary.distinct_upcoming).toBe(0);expect(sql.prepare("SELECT vacancy_confirmed FROM operations_units WHERE unit_id='u1'").get()).toBeUndefined();
});
it('does not count expired, future, terminated, overlapping or unmatched historical agreements as confirmed active',async()=>{
 await createLease({lease_end:'2026-10-15'});await createLease({lease_start:'2026-11-01',lease_end:'2027-11-01'});expect((await renewalData(state.actor,'2026-10-16')).summary.distinct_upcoming).toBe(0);
 await createLease({lease_end:'2026-12-30'});await createLease({lease_end:'2026-12-31'});const d=await renewalData(state.actor,'2026-10-16');expect(d.summary.distinct_upcoming).toBe(0);expect(d.rows.some(r=>r.overlap_count===2)).toBe(true);
});
it('tracks staff follow-up with stale-save, clear, audit rollback and no automatic renewal or occupancy change',async()=>{
 const l=await createLease({lease_end:'2026-12-31'});expect((await request('renewals/'+l.id,'PATCH',{revision:1,status:'renewed'})).status).toBe(409);
 const v={revision:1,status:'notice_prepared',staff_email:'admin@example.test',last_contact_date:'2026-01-01',follow_up_date:'2026-01-02',internal_notes:'PRIVATE follow-up'};expect((await request('renewals/'+l.id,'PATCH',v)).status).toBe(200);expect((await request('renewals/'+l.id,'PATCH',v)).status).toBe(409);
 const d=await renewalData(state.actor,'2026-10-16');expect(d.summary.in_progress).toBe(1);expect(d.summary.follow_up).toBe(1);expect(sql.prepare("SELECT active FROM tenant_assignments WHERE id='a1'").get()?.active).toBe(1);expect(sql.prepare('SELECT status FROM operations_leases WHERE id=?').get(l.id)?.status).toBe('active');
 expect((await request('renewals/'+l.id,'PATCH',{revision:2,status:'review_needed',last_contact_date:'',follow_up_date:'',internal_notes:''})).status).toBe(200);expect(sql.prepare('SELECT follow_up_date FROM operations_renewal_tracking').get()?.follow_up_date).toBeNull();
 sql.exec("CREATE TRIGGER qa_renewal_audit_failure BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'QA'); END;");expect((await request('renewals/'+l.id,'PATCH',{revision:3,status:'notice_sent'})).status).toBe(409);expect(sql.prepare('SELECT status FROM operations_renewal_tracking').get()?.status).toBe('review_needed');
});
it('configures internal thresholds/status labels, validates staff/date input and protects all report endpoints',async()=>{
 const d=await(await request('renewals')).json();expect(d.settings.reminderDays).toEqual([90,60,30]);const settings={...d.settings,reminderDays:[120,45],statuses:d.settings.statuses.map((s:any)=>({...s,label:s.key==='notice_sent'?'Notice recorded':s.label}))};expect((await request('renewals/settings','PATCH',settings)).status).toBe(200);expect((await request('renewals/settings','PATCH',settings)).status).toBe(409);expect((await(await request('renewals')).json()).settings.reminderDays).toEqual([120,45]);
 const l=await createLease();expect((await request('renewals/'+l.id,'PATCH',{revision:1,status:'notice_sent',staff_email:'unknown@example.test'})).status).toBe(400);expect((await request('renewals/'+l.id,'PATCH',{revision:1,status:'notice_sent',last_contact_date:'2026-02-30'})).status).toBe(400);
 state.actor=null;for(const p of ['renewals','renewals/print','renewals/export'])expect((await request(p,p==='renewals'?'GET':'POST')).status).toBe(401);state.actor={db:state.db,email:'admin@example.test'};expect((await request('renewals/'+l.id,'PATCH',{revision:1,status:'notice_sent'},{origin:'https://foreign.test'})).status).toBe(401);
});
it('exports and prints the whole filtered renewal worklist, excluding other properties and using identical calculation rules',async()=>{
 await createLease({lease_end:'2026-11-15'});await createLease({unit_id:'u2',lease_end:'2026-11-30',holders:[holder('t2')]});const r=await request('renewals/export?buildingId=b1&month=2026-11&format=csv','POST');expect(r.status).toBe(200);expect(r.headers.get('x-export-rows')).toBe('1');const csv=await r.text();expect(csv).toContain('QA One');expect(csv).not.toContain('QA Two');expect((await(await request('renewals/print?buildingId=b1&month=2026-11','POST')).json()).items).toHaveLength(1);
});

it('does not remove an expiration merely because staff record non-renewal; only the authorized underlying assignment or agreement change does',async()=>{
 const l=await createLease({lease_end:'2026-11-15'});expect((await request('renewals/'+l.id,'PATCH',{revision:1,status:'not_renewing'})).status).toBe(200);expect((await renewalData(state.actor,'2026-10-16')).rows.filter(r=>r.confirmed&&r.days_until<=30).length).toBe(1);sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='a1'");expect((await renewalData(state.actor,'2026-10-16')).rows.filter(r=>r.confirmed&&r.days_until<=30).length).toBe(0);
});
it('derives apartment occupancy from linked tenant records, retaining source bedrooms and no fabricated agreements',async()=>{
 sql.exec("DELETE FROM tenant_assignments WHERE id='a2'; INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,tenant_name,status_code,bedrooms,square_footage,source_values_json,imported_by) VALUES('u2','hash','October',1,'October 2026','Recorded tenant','D','0','460','[]','qa')");
 let r=await (await request('units/u2')).json();expect(r).toMatchObject({occupancy_status:'Needs occupancy review',rent_roll_bedrooms:'0',rent_roll_square_footage:'460'});
 sql.exec("UPDATE units SET unit_identifier='1A' WHERE id='u2'");
 expect((await (await request('rent-roll?buildingId=b2&unitId=u2')).json()).items.map((r:any)=>r.id)).toEqual(['u2']);
 expect((await (await request('rent-roll?buildingId=b1&unitId=u2')).json()).items).toEqual([]);
 sql.exec("UPDATE operations_rent_roll_source SET tenant_name='VACANT' WHERE unit_id='u2'");
 r=await (await request('units/u2')).json();expect(r.occupancy_status).toBe('Needs occupancy review');
 sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='a1'");
 expect((await (await request('units/u1')).json()).occupancy_status).toBe('Needs occupancy review');
 expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_leases').get()?.n).toBe(0);
});

it('uses stable IDs, preserves exact labels, and rejects a lease under a mismatched property',async()=>{
 const created=await(await createUnit('A-01','b1')).json();expect((await(await request('units/'+created.id)).json()).unit_identifier).toBe('A-01');
 expect((await createUnit('A-01','b2')).status).toBe(201);
 expect((await request('leases','POST',leaseInput({building_id:'b2'}))).status).toBe(409);
 expect((await request('leases','POST',leaseInput({unit_id:'missing'}))).status).toBe(404);
 expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_leases').get()?.n).toBe(0);
});
it('lease edits immediately update the consolidated view without modifying workbook evidence or apartment ownership',async()=>{
 sql.exec("INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,tenant_name,status_code,square_footage,bedrooms,lease_expiration,security,legal_rent,rent,source_values_json,imported_by) VALUES('u1','hash','October',1,'October 2026','Workbook tenant','D','460','STORE','Month to Month','D','RC','uninterpreted','[]','qa'); INSERT INTO operations_units(unit_id,square_feet,bedrooms) VALUES('u1',850,2)");
 const source=sql.prepare('SELECT * FROM operations_rent_roll_source').get(),lease=await createLease({holders:[holder(),holder('t2')]});
 expect((await request('leases/'+lease.id,'PATCH',{...lease.data,revision:1,monthly_rent:'2600',security_deposit:'2500',lease_end:'2028-01-31'})).status).toBe(200);
 const r=(await(await request('rent-roll?unitId=u1&buildingId=b1')).json()).items[0];expect(r).toMatchObject({lease_id:lease.id,monthly_rent_cents:260000,security_deposit_cents:250000,lease_end:'2028-01-31',square_feet:850,bedrooms:2,rent_roll_square_footage:'460',rent_roll_status:'D',rent_roll_rent:'uninterpreted',leaseholders:'QA One; QA Two'});
 expect(sql.prepare('SELECT * FROM operations_rent_roll_source').get()).toEqual(source);
 const apartment=await(await request('units/u1')).json();expect(apartment.square_feet).toBe(850);expect(sql.prepare('PRAGMA table_info(operations_units)').all().map(r=>r.name)).not.toContain('lease_end');
});
it('resolves live tenant contacts without changing historical lease records and move-out preserves maintenance and agreements',async()=>{
 const lease=await createLease({lease_end:'2026-01-31'}),before=sql.prepare('SELECT * FROM operations_leases WHERE id=?').get(lease.id);
 expect((await request('tenants/t1','PATCH',{revision:1,display_name:'QA One',contacts:[{contact_type:'phone',value_raw:'212-555-0188'},{contact_type:'email',value_raw:'contact@example.test'}]})).status).toBe(200);
 const detail=await(await request('leases/'+lease.id)).json();expect(detail.holders[0]).toMatchObject({phone:'212-555-0188',contact_email:'contact@example.test'});expect(sql.prepare('SELECT * FROM operations_leases WHERE id=?').get(lease.id)).toEqual(before);
 expect((await request('assignments','POST',{idempotencyKey:crypto.randomUUID(),tenant_id:'t1',unit_id:'u1',active:false,revision:2})).status).toBe(201);
 expect((await(await request('units/u1')).json()).occupancy_status).toBe('Needs occupancy review');
 expect((await(await request('leases?unitId=u1&buildingId=b1')).json()).items.map((r:any)=>r.id)).toEqual([lease.id]);expect((await(await request('maintenance?unitId=u1')).json()).items.map((r:any)=>r.id)).toContain('r1');
 expect(sql.prepare('SELECT * FROM operations_leases WHERE id=?').get(lease.id)).toEqual(before);
});

it('keeps source conflicts visible without inventing tenants, and aligns dashboard expiry counts with Rent Roll',async()=>{
 const expiry=new Date(Date.now()+20*86400000).toISOString().slice(0,10);
 sql.prepare(`INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,tenant_name,lease_expiration,rent,source_values_json,imported_by) VALUES('u1','qa-sha','QA',1,'QA period','Recorded Party',?,'1250','[]','QA')`).run(expiry);
 sql.exec(`INSERT INTO tenant_import_batches(id,source_sha256,approved_package_sha256,parser_version,status,requested_by,approved_by,counts_json) VALUES('qa-reconcile','qa-sha','qa-package','qa','committed','QA','QA','{}');
 INSERT INTO tenant_import_items(id,batch_id,record_id,source_sha256,source_sheet,source_row,source_cell,unit_id,outcome,review_reason,reviewed_by,reviewed_at) VALUES('qa-held','qa-reconcile','rentroll:u1','qa-sha','QA',1,'@row','u1','hold','Different names in source files','QA',datetime('now'));`);
 const conflicts=await(await request('rent-roll?review=reconciliation')).json();expect(conflicts.items).toHaveLength(1);expect(conflicts.items[0]).toMatchObject({id:'u1',rent_roll_tenant:'Recorded Party',rent_roll_expiration:expiry,reconciliation_outcome:'hold',reconciled_tenant_id:null,lease_status:'Recorded terms · agreement not supplied'});
 const property=await(await request('properties/b1')).json();expect(property).toMatchObject({rent_roll_records:1,reconciliation_pending:1,expiring_90_days:1});
 const summary=await(await request('overview')).json();expect(summary).toMatchObject({rent_roll_records:1,reconciliation_pending:1});
 const tenants=await(await request('tenants?buildingId=b1')).json();expect(tenants.items).toHaveLength(1);expect(tenants.items[0].lease_expirations).toBeNull();
 sql.exec("UPDATE tenant_import_items SET tenant_id='t1',outcome='link' WHERE id='qa-held'");const linked=await(await request('tenants?buildingId=b1')).json();expect(linked.items[0].lease_expirations).toBe(expiry);
 const scoped=await(await request('rent-roll?tenantId=t1')).json();expect(scoped.items.map((r:any)=>r.id)).toEqual(['u1']);expect((await(await request('rent-roll?tenantId=unknown')).json()).items).toHaveLength(0);
 expect(sql.prepare('SELECT count(*) AS n FROM tenant_accounts').get()?.n).toBe(2);expect(sql.prepare('SELECT count(*) AS n FROM operations_leases').get()?.n).toBe(0);
 state.actor=null;expect((await request('rent-roll?review=reconciliation')).status).toBe(401);
});

it('serves every provided contact before verification, preserves literal units, and rejects changed source evidence',async()=>{
 const bundle={source_sha256:'source-qa',records:[{id:'QA!1',property:'b1',address:'QA One',unit:'A01',name:'Source Name',source_tenant_text:'QA A01 Source Name',contacts:[{contact_value_raw:'212-555-0100 relative'}]},{id:'QA!2',property:'b1',address:'QA One',unit:'1A',name:'Source Name',source_tenant_text:'QA 1A Source Name',contacts:[]}]};
 const encoded=JSON.stringify(bundle),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(encoded))),v=>v.toString(16).padStart(2,'0')).join('');
 const insert=sql.prepare('INSERT INTO audit_log(id,action,entity_type,entity_id,record_after_json) VALUES(?,?,?,?,?)');insert.run('phone-source-roster:summary','source_summary','tenant_source_roster','qa',JSON.stringify({bundle_sha256:digest,rows:2,contacts:1,properties:{b1:2}}));insert.run('qa-source-chunk','source_chunk','tenant_source_roster','00000',JSON.stringify({text:encoded}));
 const result=await(await request('source-roster?buildingId=b1')).json();expect(result.total).toBe(2);expect(result.items[0].unit_id).toBeNull();expect(result.items[1].unit_id).toBe('u1');expect(result.items[0].contacts[0].contact_value_raw).toBe('212-555-0100 relative');
 const filtered=await(await request('source-roster?q=relative')).json();expect(filtered.items).toHaveLength(1);
 expect((await(await request('properties/b1')).json()).phone_source_rows).toBe(2);expect((await(await request('overview')).json()).phone_source_rows).toBe(2);
 sql.prepare("UPDATE audit_log SET record_after_json=? WHERE id='qa-source-chunk'").run(JSON.stringify({text:encoded+' '}));expect((await request('source-roster')).status).toBe(503);
 state.actor=null;expect((await request('source-roster')).status).toBe(401);
});

it('preserves populated unit links and supports unknown floor create, clear, refresh and retries',async()=>{
 sql.exec('BEGIN');sql.exec(readFileSync('src/lib/migrations/units-nullable-floor.sql','utf8'));sql.exec('COMMIT');
 expect(sql.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
 expect(sql.prepare('SELECT unit_id FROM tenant_assignments WHERE id=?').get('a1')?.unit_id).toBe('u1');
 const input={idempotencyKey:crypto.randomUUID(),building_id:'b1',unit_identifier:'Mezz',floor_number:'',status:'unverified'};
 const created=await request('units','POST',input);expect(created.status).toBe(201);const record=await created.json();
 expect((await (await request('units/'+record.id)).json()).floor_number).toBeNull();
 const retry=await request('units','POST',input);expect((await retry.json()).duplicate).toBe(true);
 const cleared=await request('units/u1','PATCH',{revision:1,unit_identifier:'1A',floor_number:'',status:'unverified'});expect(cleared.status).toBe(200);
 expect((await (await request('units/u1')).json()).floor_number).toBeNull();
 const invalid=await request('units/u1','PATCH',{revision:2,unit_identifier:'1A',floor_number:1.5,status:'unverified'});expect(invalid.status).toBe(400);
 expect(sql.prepare('SELECT floor_number FROM units WHERE id=?').get('u1')?.floor_number).toBeNull();
});
