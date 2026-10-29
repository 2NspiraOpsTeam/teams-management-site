import {createOfficeMaintenance,officeAssignments} from '../src/lib/operations/office-maintenance';
import {renewalData,filterRenewals} from '../src/lib/operations/renewals';
import { beforeEach,afterEach,expect,it,vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
const state=vi.hoisted(()=>({actor:null as any,env:{} as any,tenant:null as any,db:null as any}));
vi.mock('../src/lib/admin-auth',()=>({sameOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,adminEnv:()=>state.env,requireAdmin:async()=>state.actor,hash:async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('')}));
vi.mock('../src/lib/tenant-auth',()=>({currentTenant:async()=>state.tenant,tenantDb:()=>state.db}));
import { operationsRequest } from '../src/lib/operations/handler';
import { tenantLeaseList,tenantDocument,approvedPropertyContacts,availableTenantLease } from '../src/lib/operations/tenant-leases';
import * as residentContactRoute from '../src/app/api/tenant/contacts/route';
import {residentContacts} from '../src/lib/household/contacts';
import {householdMembers} from '../src/lib/household/server';
import { date } from '../src/lib/operations/validation';
let sql:DatabaseSync;
function adapter(){return {prepare(query:string){let args:any[]=[];const p={bind(...values:any[]){args=values;return p;},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}};}};return p;},async batch(statements:any[]){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};}
const origin='https://operations.example';
const request=async(path:string,method='GET',data?:any,extraHeaders={})=>operationsRequest(new Request(origin+'/api/admin/operations/'+path,{method,headers:{origin,'content-type':'application/json',...extraHeaders},...(method!=='GET'?{body:JSON.stringify(data||{})}:{})}),path.split('?')[0].split('/'));
const createUnit=(identifier='2A',building='b1',key=crypto.randomUUID())=>request('units','POST',{idempotencyKey:key,building_id:building,unit_identifier:identifier,floor_number:2,status:'unverified',bedrooms:2,bathrooms:1,square_feet:800});
const holder=(tenant='t1')=>({tenant_id:tenant,holder_role:'leaseholder',can_view_document:true,show_rent:false});
const leaseInput=(extra={})=>({idempotencyKey:crypto.randomUUID(),unit_id:'u1',lease_start:'2026-01-01',lease_end:'2027-12-31',monthly_rent:'2100.25',security_deposit:'2100.25',status:'active',renewal_status:'not_started',portal_published:false,holders:[holder()],...extra});
const createLease=async(extra={})=>{const data=leaseInput(extra),response=await request('leases','POST',data);expect(response.status).toBe(201);return {data,...await response.json()};};
beforeEach(()=>{sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');for(const file of ['schema.sql','admin-phase1.sql','admin-otp.sql','tenant-portal.sql','work-orders-mvp.sql'])sql.exec(readFileSync('src/lib/migrations/'+file,'utf8'));sql.exec(`INSERT INTO buildings(id,name,slug,address_json) VALUES('b1','QA One','qa-one','{"street":"100 QA St","city":"New York","state":"NY","zip":"10021"}'),('b2','QA Two','qa-two','{}'); INSERT INTO units(id,building_id,unit_identifier,floor_number,status) VALUES('u1','b1','1A',1,'unverified'),('u2','b2','1B',1,'unverified'); INSERT INTO tenant_accounts(id,email,display_name,active) VALUES('t1','one@example.test','QA One',1),('t2','two@example.test','QA Two',1); INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES('a1','t1','b1','u1'),('a2','t2','b2','u2'); INSERT INTO admin_identities(email) VALUES('admin@example.test'); INSERT INTO tenant_sessions(token_hash,tenant_id,expires_at) VALUES('fixture-token','t1',datetime('now','+1 day')); INSERT INTO tenant_maintenance_requests(id,tenant_id,assignment_id,category,description,urgency,preferred_contact) VALUES('r1','t1','a1','plumbing','QA existing request','routine','email');`);sql.exec(readFileSync('src/lib/migrations/property-operations.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/property-llc-name.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/property-admin-facts.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/rent-roll-source.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/rent-roll-complete-fields.sql','utf8'));sql.exec('BEGIN');sql.exec(readFileSync('src/lib/migrations/tenant-directory-identity-nullable.sql','utf8'));sql.exec('COMMIT');sql.exec(readFileSync('src/lib/migrations/tenant-directory-import.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/tenant-directory-names.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/media-presentation-contexts.sql','utf8').split('-- Preserve current public presentation')[0]);state.db=adapter();state.actor={db:state.db,email:'admin@example.test'};state.env={PROPERTY_OPERATIONS_ENABLED:'1',TENANT_LEASES_ENABLED:'1'};state.tenant={id:'t1',email:'one@example.test'};});
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
it('keeps private uploads unavailable but permits explicitly published lease summaries without storage',async()=>{const l=await createLease();const r=await operationsRequest(new Request(origin+'/upload',{method:'POST',headers:{origin,'content-type':'application/pdf','x-upload-id':crypto.randomUUID()},body:'%PDF-1.7\nQA document'}),['leases',l.id,'documents']);expect(r.status).toBe(503);expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_lease_documents').get()?.n).toBe(0);expect(await availableTenantLease('t1')).toBe(false);expect(await tenantLeaseList()).toEqual([]);expect((await request('leases/'+l.id,'PATCH',{...l.data,revision:1,portal_published:true})).status).toBe(200);expect(await availableTenantLease('t1')).toBe(true);expect((await tenantLeaseList())[0]).toMatchObject({lease_end:'2027-12-31',documents:[],documents_available:false});});
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

it('exposes complete source fields and filtered totals across pages without inventing dates or RentRedi negatives',async()=>{
 sql.prepare("INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,source_values_json,imported_by,move_in_date,rentredi,utility_reimbursement,additional_notes) VALUES('u1','sha','QA',1,'QA','[]','QA','2025-05-01','RentRedi','0','$150 storage')").run();
 const r=await request('rent-roll?buildingId=b1');const data=await r.json();expect(data.total).toBe(1);expect(data.items[0]).toMatchObject({rent_roll_move_in_date:'2025-05-01',rent_roll_rentredi:'RentRedi',rent_roll_utility_reimbursement:'0',rent_roll_additional_notes:'$150 storage'});
 const blank=await (await request('rent-roll?buildingId=b2')).json();expect(blank.total).toBe(1);expect(blank.items[0].rent_roll_move_in_date).toBeNull();expect(blank.items[0].rent_roll_rentredi).toBeNull();
 const empty=await (await request('rent-roll?q=nonexistent')).json();expect(empty.total).toBe(0);expect(empty.items).toEqual([]);
});

it('counts filtered apartment and distinct tenant records across pages and empty results',async()=>{
 for(let i=0;i<55;i++)sql.prepare('INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES(?,?,?,2)').run('count-'+i,'b1','COUNT-'+String(i).padStart(3,'0'));
 for(const page of [0,1]){const d=await(await request('units?buildingId=b1&q=COUNT-&page='+page)).json();expect(d.total).toBe(55);expect(d.items).toHaveLength(page===0?50:5);}
 const none=await(await request('units?buildingId=b1&q=no-match')).json();expect(none.total).toBe(0);expect(none.items).toEqual([]);
 sql.exec("INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES('extra-count','t1','b1','count-0')");
 const tenants=await(await request('tenants?buildingId=b1')).json();expect(tenants.total).toBe(1);expect(tenants.items).toHaveLength(1);
 expect((await(await request('tenants?buildingId=b1&q=no-match')).json()).total).toBe(0);
});

it('counts every operational directory and paginates only eligible recorded leases',async()=>{
 for(const entity of ['properties','superintendents','leases','maintenance']){
  const data=await(await request(entity)).json();expect(data.total).toBe(data.items.length);
  const empty=await(await request(entity+'?q=zz-no-match')).json();expect(empty.total).toBe(0);expect(empty.items).toEqual([]);
 }
 for(let i=0;i<55;i++){
  const id='recorded-count-'+i;
  sql.prepare('INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES(?,?,?,2)').run(id,'b1',id);
  sql.prepare("INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,source_values_json,imported_by) VALUES(?,'sha','QA',?,'QA','[]','QA')").run(id,i+1);
 }
 for(const page of [0,1]){
  const data=await(await request('rent-roll?recordedOnly=1&buildingId=b1&page='+page)).json();
  expect(data.total).toBe(55);expect(data.items).toHaveLength(page===0?50:5);
  expect(data.items.every((r:any)=>r.rent_roll_period&&!r.lease_id)).toBe(true);
 }
});

it('sums workbook monthly rent in cents across all pages without substituting lease rent or blanks',async()=>{
 for(let i=0;i<55;i++){
  const id='monthly-'+i;sql.prepare('INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES(?,?,?,2)').run(id,'b1',id);
  sql.prepare("INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,rent,source_values_json,imported_by) VALUES(?,'sha','QA',?,'QA',?,'[]','QA')").run(id,i+1,i===0?'$1,234.56':i===1?null:'100.01');
 }
 for(const page of [0,1]){const d=await(await request('rent-roll?buildingId=b1&q=monthly-&page='+page)).json();expect(d.total).toBe(55);expect(d.workbookMonthlyRentCents).toBe(653509);expect(d.unavailableRentCount).toBe(1);}
 const empty=await(await request('rent-roll?q=zz-no-match')).json();expect(empty.workbookMonthlyRentCents).toBe(0);expect(empty.unavailableRentCount).toBe(0);
});

it('combines only the explicit 349/351 workbook group without changing property links',async()=>{
 for(const [i,id]of ['real-349-w-46th-st','real-351-w-46th-st','real-349-351-w-46th-st'].entries()){
  sql.prepare("INSERT INTO buildings(id,slug,name,address_json) VALUES(?,?,?, '{}')").run(id,id,id);
  sql.prepare('INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES(?,?,?,1)').run('shared-'+i,id,'shared-'+i);
  sql.prepare("INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,rent,source_values_json,imported_by) VALUES(?,'sha','QA',?,'QA','100.01','[]','QA')").run('shared-'+i,i+1);
 }
 const separate=await(await request('rent-roll?buildingId=real-351-w-46th-st')).json();expect(separate.total).toBe(1);
 const grouped=await(await request('rent-roll?buildingId=real-351-w-46th-st&group349351=1')).json();expect(grouped.total).toBe(3);expect(grouped.workbookMonthlyRentCents).toBe(30003);expect(new Set(grouped.items.map((r:any)=>r.building_id)).size).toBe(3);
 expect((await(await request('rent-roll?buildingId=b1&group349351=1')).json()).total).toBe(1);
});

it('persists, clears and validates LLC names with revisions and audited history',async()=>{
 const input={revision:1,property_type:'unverified',llc_name:'QA Owners LLC',internal_notes:''};
 expect((await request('properties/b1','PATCH',input)).status).toBe(200);
 expect((await(await request('properties/b1')).json()).llc_name).toBe('QA Owners LLC');
 expect((await(await request('properties')).json()).items.find((r:any)=>r.id==='b1').llc_name).toBe('QA Owners LLC');
 expect((await request('properties/b1','PATCH',input)).status).toBe(409);
 expect((await request('properties/b1','PATCH',{...input,revision:2,llc_name:'x'.repeat(241)})).status).toBe(400);
 expect((await request('properties/b1','PATCH',{...input,revision:2,llc_name:''})).status).toBe(200);
 expect((await(await request('properties/b1')).json()).llc_name).toBe('');
 expect(sql.prepare("SELECT count(*) n FROM audit_log WHERE entity_type='operations_property'").get()?.n).toBe(2);
});
const officeInput=()=>({idempotencyKey:crypto.randomUUID(),buildingId:'b1',unitId:'u1',assignmentId:'a1',category:'plumbing',description:'[QA] Office-created plumbing request',urgency:'routine',preferredContact:'phone',permissionToEnter:null,accessInstructions:''});
it('creates office requests against the exact assignment, attributes Admin, and suppresses duplicate retries without sending mail',async()=>{
 const v=officeInput(),saved=await createOfficeMaintenance(state.actor,v);
 expect(saved.number).toBeTruthy();expect((await createOfficeMaintenance(state.actor,v)).duplicate).toBe(true);
 expect(sql.prepare('SELECT tenant_id,assignment_id FROM tenant_maintenance_requests WHERE id=?').get(saved.id)).toMatchObject({tenant_id:'t1',assignment_id:'a1'});
 expect(sql.prepare('SELECT actor_type,actor_id FROM work_order_events WHERE request_id=?').get(saved.id)).toMatchObject({actor_type:'admin',actor_id:'admin@example.test'});
 expect(sql.prepare('SELECT permission_to_enter FROM work_order_details WHERE request_id=?').get(saved.id)?.permission_to_enter).toBeNull();
 expect(sql.prepare('SELECT count(*) n FROM work_order_notifications WHERE request_id=?').get(saved.id)?.n).toBe(0);
 await expect(createOfficeMaintenance(state.actor,{...v,description:'Different request payload'})).rejects.toMatchObject({status:409});
});
it('rejects mismatched, historical and incomplete office requests and rolls back failed audits',async()=>{
 await expect(createOfficeMaintenance(state.actor,{...officeInput(),unitId:'u2'})).rejects.toMatchObject({status:409});
 await expect(createOfficeMaintenance(state.actor,{...officeInput(),description:'short'})).rejects.toMatchObject({status:400});
 sql.exec("CREATE TRIGGER qa_office_fail BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'QA failure'); END;");
 await expect(createOfficeMaintenance(state.actor,officeInput())).rejects.toMatchObject({status:503});
 expect(sql.prepare('SELECT count(*) n FROM tenant_maintenance_requests').get()?.n).toBe(1);
 sql.exec("DROP TRIGGER qa_office_fail; UPDATE tenant_assignments SET active=0 WHERE id='a1'");
 expect(await officeAssignments(state.actor,'b1')).toEqual([]);
 await expect(createOfficeMaintenance(state.actor,officeInput())).rejects.toMatchObject({status:409});
});
it('projects saved tenant and apartment edits consistently into phone, rent roll, assignments and lease views',async()=>{
 expect((await request('tenants/t1','PATCH',{revision:1,display_name:'QA Synced Name',contacts:[{contact_type:'phone',value_raw:'212-555-0100',is_primary:true}]})).status).toBe(200);
 expect((await request('units/u1','PATCH',{revision:1,unit_identifier:'1A-corrected',floor_number:1,status:'unverified'})).status).toBe(200);
 const phone=(await(await request('phone-list?buildingId=b1')).json()).items[0];expect(phone).toMatchObject({display_name:'QA Synced Name',unit_identifier:'1A-corrected',phones:'212-555-0100'});
 const roll=(await(await request('rent-roll?buildingId=b1')).json()).items[0];expect(roll).toMatchObject({unit_identifier:'1A-corrected',occupants:'QA Synced Name'});
 const lease=await createLease();expect((await(await request('leases/'+lease.id)).json()).unit_identifier).toBe('1A-corrected');
});

it('uses a cheap audit watermark to detect other staff edits without reloading unchanged records',async()=>{const before=await(await request('sync')).json();expect((await(await request('sync')).json()).version).toBe(before.version);expect((await request('properties/b1','PATCH',{revision:1,property_type:'unverified',llc_name:'QA Sync LLC'})).status).toBe(200);expect((await(await request('sync')).json()).version).toBeGreaterThan(before.version);state.actor=null;expect((await request('sync')).status).toBe(401);});
it('uses paginated minimal selectors without contact or aggregate payloads',async()=>{
 const data=await(await request('properties?lookup=1')).json();expect(data.items[0]).toEqual({id:'b1',name:'QA One'});expect(data.nextPage).toBeNull();
 expect((await request('units?lookup=1')).status).toBe(422);
 const units=await(await request('units?lookup=1&buildingId=b1')).json();expect(units.items).toEqual([{id:'u1',building_id:'b1',unit_identifier:'1A'}]);
 state.actor=null;expect((await request('properties?lookup=1')).status).toBe(401);
});
it('applies read indexes additively and uses the unit-review index',()=>{
 const before=sql.prepare('SELECT count(*) n FROM tenant_accounts').get()?.n;
 sql.exec(readFileSync('src/lib/migrations/operations-read-efficiency.sql','utf8'));sql.exec(readFileSync('src/lib/migrations/operations-read-efficiency.sql','utf8'));
 expect(sql.prepare('SELECT count(*) n FROM tenant_accounts').get()?.n).toBe(before);
 const plan=sql.prepare("EXPLAIN QUERY PLAN SELECT id FROM tenant_import_items WHERE unit_id=? AND source_cell='@row' AND outcome='hold' AND record_id=?").all('u1','rentroll:u1');expect(JSON.stringify(plan)).toContain('operations_import_unit_review');
 expect(sql.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
});

const contactRequest=(data:object,source=origin)=>new Request(origin+'/api/tenant/contacts',{method:'PUT',headers:{origin:source,'Content-Type':'application/json'},body:JSON.stringify(data)});
it('allows only own contact edits, preserves name/login/lease, persists clear and rejects unexpected identity fields',async()=>{const before=sql.prepare("SELECT * FROM tenant_accounts WHERE id='t1'").get();for(const raw of [{email:'bad',phone:'',snapshot:''},{email:'new@example.test',phone:'',snapshot:'',display_name:'Changed'},{email:'',phone:'abc',snapshot:''}])expect((await residentContactRoute.PUT(contactRequest(raw))).status).toBe(400);expect((await residentContactRoute.PUT(contactRequest({email:'',phone:'',snapshot:''},'https://other.example'))).status).toBe(401);let response=await residentContactRoute.PUT(contactRequest({email:'contact@example.test',phone:'+1 212 555 0100',snapshot:''}));expect(response.status).toBe(200);let saved=await response.json();expect(await residentContacts(state.db,'t1')).toMatchObject({email:'contact@example.test',phone:'+1 212 555 0100'});expect(sql.prepare("SELECT * FROM tenant_accounts WHERE id='t1'").get()).toEqual(before);expect(await residentContacts(state.db,'t2')).toMatchObject({email:'',phone:''});response=await residentContactRoute.PUT(contactRequest({...saved,email:'',phone:''}));expect(response.status).toBe(200);expect(await residentContacts(state.db,'t1')).toMatchObject({email:'',phone:''});state.tenant=null;expect((await residentContactRoute.GET()).status).toBe(401);expect((await residentContactRoute.PUT(contactRequest(saved))).status).toBe(401);});
it('rejects stale contact saves and rolls back both contact changes when auditing fails',async()=>{let response=await residentContactRoute.PUT(contactRequest({email:'original@example.test',phone:'2125550100',snapshot:''}));const saved=await response.json();expect((await residentContactRoute.PUT(contactRequest({...saved,email:'stale@example.test',snapshot:''}))).status).toBe(409);sql.exec("CREATE TRIGGER reject_contacts_audit BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'outage'); END");expect((await residentContactRoute.PUT(contactRequest({...saved,email:'changed@example.test',phone:'2125550199'}))).status).toBe(409);expect(await residentContacts(state.db,'t1')).toEqual(saved);});
it('detects a contact edit or assignment revocation racing the save transaction',async()=>{const batch=state.db.batch;state.db.batch=async(s:any[])=>{sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='a1'");return batch(s);};expect((await residentContactRoute.PUT(contactRequest({email:'race@example.test',phone:'',snapshot:''}))).status).toBe(409);expect(sql.prepare('SELECT COUNT(*) n FROM tenant_contacts').get()?.n).toBe(0);expect(sql.prepare('SELECT COUNT(*) n FROM audit_log').get()?.n).toBe(0);});
it('lists only current same-apartment household names and explicit leaseholder roles, never contacts or notes',async()=>{await createLease({holders:[{...holder(),holder_role:'primary_leaseholder'}]});let members=await householdMembers(state.db,'t1');expect(members).toHaveLength(1);expect(members[0]).toMatchObject({tenant_id:'t1',role:'primary_leaseholder'});expect(JSON.stringify(members)).not.toContain('one@example.test');sql.exec("UPDATE tenant_assignments SET unit_id='u1',building_id='b1' WHERE id='a2'");members=await householdMembers(state.db,'t1');expect(members.map(x=>x.tenant_id)).toEqual(['t1','t2']);sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='a2'");expect(await householdMembers(state.db,'t1')).toHaveLength(1);expect(await householdMembers(state.db,'t2')).toEqual([]);});
it('blocks an active account assignment that would create a fourth portal user atomically',async()=>{sql.exec("INSERT INTO tenant_accounts(id,email,active) VALUES('third','third@example.test',1),('fourth','fourth@example.test',1); INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES('third-home','third','b1','u1'); UPDATE tenant_assignments SET unit_id='u1',building_id='b1' WHERE id='a2'");const result=await request('assignments','POST',{idempotencyKey:crypto.randomUUID(),tenant_id:'fourth',unit_id:'u1',occupant_role:'authorized_occupant',active:true,revision:1});expect(result.status).toBe(409);expect(sql.prepare("SELECT COUNT(*) n FROM tenant_assignments WHERE tenant_id='fourth'").get()?.n).toBe(0);});

it('saves Admin-only property facts, preserves partial fields and notes, clears unknowns and refuses invalid or stale edits',async()=>{
 const metadata={year_purchased:'2011 (Took over 12/2023)',tax_block:'000768',tax_lot:'17',apartment_count:20,store_count:3,floor_count:4,stabilization_summary:'Destabilized-13 Stabilized-7'};
 expect((await request('properties/b1','PATCH',{revision:1,...metadata,internal_notes:'PRIVATE PROPERTY NOTE'})).status).toBe(200);
 const detail=await(await request('properties/b1')).json();expect(detail).toMatchObject({...metadata,internal_notes:'PRIVATE PROPERTY NOTE',revision:2});
 expect((await request('properties/b1','PATCH',{revision:2,internal_notes:'UPDATED PRIVATE NOTE'})).status).toBe(200);
 expect(await(await request('properties/b1')).json()).toMatchObject({...metadata,internal_notes:'UPDATED PRIVATE NOTE',revision:3});
 expect((await request('properties/b1','PATCH',{revision:2,internal_notes:'STALE'})).status).toBe(409);
 for(const invalid of [-1,1.5,'abc',true])expect((await request('properties/b1','PATCH',{revision:3,apartment_count:invalid})).status).toBe(400);
 expect((await request('properties/b1','PATCH',{revision:3,floor_count:1001})).status).toBe(400);
 expect((await request('properties/b1','PATCH',{revision:3,internal_notes:'',floor_count:'',store_count:0})).status).toBe(200);
 expect(await(await request('properties/b1')).json()).toMatchObject({apartment_count:20,floor_count:null,store_count:0,internal_notes:''});
 expect(JSON.stringify(await(await request('properties')).json())).not.toContain('stabilization_summary');
 state.actor=null;expect((await request('properties/b1')).status).toBe(401);expect((await request('properties/b1','PATCH',{revision:4,internal_notes:'bad'})).status).toBe(401);
});
it('rolls back private property facts if the audit fails',async()=>{
 sql.exec("CREATE TRIGGER qa_property_audit_failure BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'QA forced audit failure'); END;");
 expect((await request('properties/b1','PATCH',{revision:1,apartment_count:20,internal_notes:'must roll back'})).status).toBe(409);
 expect(sql.prepare("SELECT * FROM operations_properties WHERE building_id='b1'").get()).toBeUndefined();
});

it('shows only the selected building-wide cover in property lists and detail without changing media',async()=>{
 sql.exec("INSERT INTO media_assets(id,storage_key,file_type) VALUES('cover','qa/cover.jpg','image/jpeg'),('other','qa/other.jpg','image/jpeg'); INSERT INTO media_assignments(id,asset_id,building_id,is_cover) VALUES('mc','cover','b1',1),('mo','other','b2',1)");
 let result=await(await request('properties')).json();expect(result.items.find((r:any)=>r.id==='b1').cover_asset_id).toBe('cover');expect((await(await request('properties/b2')).json()).cover_asset_id).toBe('other');
 sql.exec("INSERT INTO media_presentation_settings(building_id,context,cover_asset_id) VALUES('b1','residential',NULL)");
 expect((await(await request('properties/b1')).json()).cover_asset_id).toBeNull();
 sql.exec("UPDATE media_presentation_settings SET cover_asset_id='other' WHERE building_id='b1'");
 expect((await(await request('properties/b1')).json()).cover_asset_id).toBeNull();
 sql.exec("UPDATE media_assets SET visibility='archived' WHERE id='other'");
 expect((await(await request('properties/b2')).json()).cover_asset_id).toBeNull();
 expect(sql.prepare('SELECT COUNT(*) AS n FROM media_assignments').get()?.n).toBe(2);
});

it('keeps current and earlier tenant agreements separate and paginates newest first without another occupant’s leases',async()=>{
 const current=await createLease();
 const before=sql.prepare('SELECT * FROM operations_leases WHERE id=?').get(current.id);
 const earlier=await createLease({lease_start:'2020-01-01',lease_end:'2020-12-31',status:'expired'});
 await createLease({lease_start:'2019-01-01',lease_end:'2019-12-31',status:'expired',holders:[holder('t2')]});
 const history=await(await request('leases?tenantId=t1&sort=recent')).json();
 expect(history.items.map((l:any)=>l.id)).toEqual([current.id,earlier.id]);
 expect(sql.prepare('SELECT * FROM operations_leases WHERE id=?').get(current.id)).toEqual(before);
 expect(sql.prepare('SELECT predecessor_id FROM operations_leases WHERE id=?').get(earlier.id)?.predecessor_id).toBeNull();
 const duplicate=await request('leases','POST',leaseInput({lease_start:'2020-01-01',lease_end:'2020-12-31',status:'expired'}));
 expect(duplicate.status).toBe(409);
 expect(sql.prepare('SELECT * FROM operations_leases WHERE id=?').get(current.id)).toEqual(before);
});

it('finds lease-editor tenants by surname and email fragments, preserves literal wildcard handling and does not require a residence match',async()=>{
 sql.prepare("UPDATE tenant_accounts SET display_name='Longterm ExampleSurname',email='longterm@example.test' WHERE id='t1'").run();
 const surname=await(await request('tenants?q=ExampleSurname&match=contains')).json();expect(surname.items.map((t:any)=>t.id)).toEqual(['t1']);
 const email=await(await request('tenants?q=term%40example&match=contains')).json();expect(email.items.map((t:any)=>t.id)).toEqual(['t1']);
 expect((await(await request('tenants?q=ExampleSurname')).json()).items).toHaveLength(0);
 expect((await(await request('tenants?q=%25&match=contains')).json()).items).toHaveLength(0);
 expect((await(await request('tenants?q=not-found&match=contains')).json()).items).toHaveLength(0);
});

it('saves a new lease and its OneDrive URL atomically and suppresses whole-form retries',async()=>{
 sql.exec(readFileSync('src/lib/migrations/lease-onedrive-links.sql','utf8'));
 const assignments=sql.prepare('SELECT * FROM tenant_assignments ORDER BY id').all();
 const l=await createLease({pdfLink:{name:'QA lease.pdf',webUrl:'https://1drv.ms/b/s!qa_lease?e=abc',reviewed:true}});
 const link=sql.prepare('SELECT lease_id,file_name,drive_id FROM operations_lease_links').get();expect(link).toMatchObject({lease_id:l.id,file_name:'QA lease.pdf',drive_id:'microsoft-sharing'});
 expect((await request('leases','POST',l.data)).status).toBe(200);
 expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_leases').get()?.n).toBe(1);expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_lease_links').get()?.n).toBe(1);
 expect(sql.prepare('SELECT * FROM tenant_assignments ORDER BY id').all()).toEqual(assignments);
 expect(JSON.stringify(sql.prepare('SELECT record_after_json FROM audit_log').all())).not.toContain('https://');
});
it('rejects invalid/unreviewed lease URLs before writing and rolls back the agreement when link storage fails',async()=>{
 sql.exec(readFileSync('src/lib/migrations/lease-onedrive-links.sql','utf8'));
 for(const pdfLink of [{name:'QA.pdf',webUrl:'http://example.test/lease.pdf',reviewed:true},{name:'QA.pdf',webUrl:'https://1drv.ms/b/qa',reviewed:false}])expect((await request('leases','POST',leaseInput({pdfLink}))).status).toBe(400);
 expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_leases').get()?.n).toBe(0);
 const input=leaseInput({pdfLink:{name:'QA.pdf',webUrl:'https://1drv.ms/b/qa',reviewed:true}});
 sql.exec("CREATE TRIGGER qa_link_failure BEFORE INSERT ON operations_lease_links BEGIN SELECT RAISE(ABORT,'QA link failure'); END;");
 expect((await request('leases','POST',input)).status).toBe(409);
 for(const table of ['operations_leases','operations_leaseholders','operations_lease_links','operations_mutation_receipts','audit_log'])expect(sql.prepare('SELECT COUNT(*) AS n FROM '+table).get()?.n).toBe(0);
 sql.exec('DROP TRIGGER qa_link_failure');expect((await request('leases','POST',input)).status).toBe(201);
 expect(sql.prepare('SELECT COUNT(*) AS n FROM operations_lease_links').get()?.n).toBe(1);
});
