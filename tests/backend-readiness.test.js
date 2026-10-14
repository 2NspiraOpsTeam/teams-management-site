import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
const state = vi.hoisted(() => ({ env: {}, cookies: new Map(), mail: [], failMail: false, jobs: [] }));
vi.mock('@cloudflare/next-on-pages', () => ({ getRequestContext: () => ({env: state.env,ctx:{waitUntil:p=>state.jobs.push(p)}}) }));
vi.mock('next/headers', () => ({ cookies: async () => ({get:name=>state.cookies.has(name)?{value:state.cookies.get(name)}:undefined}) }));
vi.mock('../src/lib/mail-service', () => ({ MailService: class {
  configured(){return true;}
  async sendAdminOtp(email,code){if(state.failMail)throw Error('mail');state.mail.push({email,code});return 'local-mail';}
  async sendTenantOtp(email,code){if(state.failMail)throw Error('mail');state.mail.push({email,code});return 'local-mail';}
  async sendInquiryNotification(){return 'local-mail';}
} }));
import * as admin from '../src/app/api/admin/session/route';
import * as tenant from '../src/app/api/tenant/session/route';
import * as maintenance from '../src/app/api/tenant/maintenance/route';
import * as contact from '../src/app/api/contact/route';
import * as reports from '../src/app/api/buildings/data-report/route';
import * as uploads from '../src/app/api/admin/media/route';
import { hash, currentAdmin } from '../src/lib/admin-auth';
import { currentTenant } from '../src/lib/tenant-auth';
import { mediaResponse } from '../src/lib/media-response';
import { boundedBody, BodyTooLarge } from '../src/lib/request-body';
let sql, db;
const origin='https://qa.example';
const post=(path,input,headers={})=>new Request(origin+path,{method:'POST',headers:{origin,'content-type':'application/json',...headers},body:JSON.stringify(input)});
function adapter(sql){return {prepare(query){let args=[];const p={bind(...values){args=values;return p},async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}}}};return p},async batch(statements){sql.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());sql.exec('COMMIT');return r}catch(e){sql.exec('ROLLBACK');throw e}}}}
beforeEach(()=>{
 sql=new DatabaseSync(':memory:');
 for(const file of ['schema.sql','admin-phase1.sql','admin-otp.sql','tenant-portal.sql','add-inquiry-details.sql','rental-inquiry-handoff.sql'])sql.exec(readFileSync('src/lib/migrations/'+file,'utf8'));
 sql.exec(readFileSync('src/lib/migrations/media-management.sql','utf8').split(/^INSERT /m)[0]);
 sql.exec("INSERT INTO buildings(id,name,slug,address_json,publication_state) VALUES ('b1','QA One','qa-one','{}','published'),('b2','QA Two','qa-two','{}','draft'); INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES ('u1','b1','1',1),('u2','b2','2',2); INSERT INTO tenant_accounts(id,email,active) VALUES ('t1','one@example.test',1),('t2','two@example.test',1); INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES ('a1','t1','b1','u1'),('a2','t2','b2','u2'); INSERT INTO admin_identities(email) VALUES ('qa-admin@example.test'); CREATE TABLE dining_venues (id TEXT,property_id TEXT,hero_media_asset_id TEXT,publication_state TEXT); CREATE TABLE dining_venue_photos (venue_id TEXT,asset_id TEXT);");
 db=adapter(sql);state.env={DB:db,ADMIN_OTP_PEPPER:'a'.repeat(32),TENANT_OTP_PEPPER:'t'.repeat(32),ADMIN_AUTH_FROM:'qa@example.test',TENANT_AUTH_FROM:'qa@example.test'};state.cookies.clear();state.mail=[];state.jobs=[];state.failMail=false;
});
afterEach(()=>sql.close());
async function signIn(module,email,cookie){expect((await module.POST(post('/session',{action:'request',email}))).status).toBe(200);const code=state.mail.at(-1).code;const response=await module.POST(post('/session',{action:'verify',email,code}));expect(response.status).toBe(200);const header=response.headers.get('set-cookie');expect(header).toMatch(/HttpOnly/i);expect(header).toMatch(/Secure/i);expect(header).toMatch(/SameSite=strict/i);state.cookies.set(cookie,header.split(';')[0].split('=')[1]);return code;}

describe('local SQLite-backed auth, isolation and persistence (mail stubbed)',()=>{
 it('Admin OTP is single-use and does not grant tenant access',async()=>{const code=await signIn(admin,'qa-admin@example.test','teams_admin_session');expect(await currentAdmin()).toBe('qa-admin@example.test');expect(await currentTenant()).toBeNull();expect((await admin.POST(post('/session',{action:'verify',email:'qa-admin@example.test',code}))).status).toBe(401);});
 it('Tenant OTP cannot grant Admin access; deactivation invalidates a live session',async()=>{await signIn(tenant,'one@example.test','teams_tenant_session');expect((await currentTenant()).id).toBe('t1');expect(await currentAdmin()).toBeNull();sql.exec("UPDATE tenant_accounts SET active=0 WHERE id='t1'");expect(await currentTenant()).toBeNull();});
 it('rejects expired codes and locks after five wrong attempts',async()=>{await tenant.POST(post('/session',{action:'request',email:'one@example.test'}));const code=state.mail.at(-1).code;for(let i=0;i<5;i++)expect((await tenant.POST(post('/session',{action:'verify',email:'one@example.test',code:code==='00000000'?'11111111':'00000000'}))).status).toBe(401);expect((await tenant.POST(post('/session',{action:'verify',email:'one@example.test',code}))).status).toBe(401);sql.exec("UPDATE tenant_login_codes SET attempt_count=0,expires_at=datetime('now','-1 minute')");expect((await tenant.POST(post('/session',{action:'verify',email:'one@example.test',code}))).status).toBe(401);});
 it('revokes logout sessions and rejects foreign Origin',async()=>{await signIn(tenant,'one@example.test','teams_tenant_session');expect((await tenant.POST(post('/session',{}, {origin:'https://foreign.example'}))).status).toBe(401);await tenant.DELETE(new Request(origin+'/session',{method:'DELETE',headers:{origin,cookie:'teams_tenant_session='+state.cookies.get('teams_tenant_session')}}));expect(await currentTenant()).toBeNull();});
 it('fails closed on missing pepper and mail failure; failed code cannot be used',async()=>{state.env.TENANT_OTP_PEPPER='';expect((await tenant.POST(post('/session',{action:'request',email:'one@example.test'}))).status).toBe(503);state.env.TENANT_OTP_PEPPER='t'.repeat(32);state.failMail=true;expect((await tenant.POST(post('/session',{action:'request',email:'one@example.test'}))).status).toBe(503);expect(sql.prepare('SELECT used_at FROM tenant_login_codes').get().used_at).toBeTruthy();});
 it('denies diagnostic reports and uploads without a verified Admin',async()=>{expect((await reports.GET()).status).toBe(401);expect((await uploads.POST(post('/upload',{}))).status).toBe(401);state.cookies.set('teams_admin_session','0'.repeat(64));expect((await reports.GET()).status).toBe(401);});
 it('maintenance persists once across retries, is audited, hides staff notes and rejects cross-tenant assignment',async()=>{await signIn(tenant,'one@example.test','teams_tenant_session');const input={idempotencyKey:crypto.randomUUID(),assignmentId:'a1',category:'plumbing',description:'QA only: leaking faucet',urgency:'routine',preferredContact:'email'};expect((await maintenance.POST(post('/maintenance',input))).status).toBe(201);expect((await maintenance.POST(post('/maintenance',input))).status).toBe(200);expect(sql.prepare('SELECT COUNT(*) AS n FROM tenant_maintenance_requests').get().n).toBe(1);expect(sql.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action='submitted'").get().n).toBe(1);expect((await maintenance.POST(post('/maintenance',{...input,description:'Changed body cannot reuse receipt'}))).status).toBe(409);expect((await maintenance.POST(post('/maintenance',{...input,idempotencyKey:crypto.randomUUID(),assignmentId:'a2'}))).status).toBe(403);const history=await (await maintenance.GET()).json();expect(history.requests).toHaveLength(1);expect(history.requests[0]).not.toHaveProperty('staff_notes');await signIn(tenant,'two@example.test','teams_tenant_session');expect((await (await maintenance.GET()).json()).requests).toEqual([]);});
 it('contact validates malformed/oversized requests; saves atomically and suppresses duplicate retries',async()=>{expect((await contact.POST(new Request(origin+'/contact',{method:'POST',headers:{origin,'content-type':'application/json'},body:'{'}))).status).toBe(400);expect((await contact.POST(post('/contact',{message:'x'.repeat(13000)}))).status).toBe(413);const input={idempotencyKey:crypto.randomUUID(),category:'property',name:'QA Test',email:'qa@example.test',phone:'2125550100',propertyInterest:'QA One',message:'QA integration inquiry only'};expect((await contact.POST(post('/contact',input))).status).toBe(201);expect((await contact.POST(post('/contact',input))).status).toBe(200);await Promise.all(state.jobs);expect(sql.prepare('SELECT COUNT(*) AS n FROM inquiry_details').get().n).toBe(1);expect(sql.prepare('SELECT state,error_code FROM inquiry_notifications').get()).toMatchObject({state:'pending',error_code:'configuration_pending'});expect((await contact.POST(post('/contact',{...input,building:'qa-two',idempotencyKey:crypto.randomUUID()}))).status).toBe(400);});
 it('private/unpublished media returns 404 and static redirects stay same-origin',async()=>{sql.exec("INSERT INTO media_assets(id,storage_key,file_type,visibility) VALUES ('private','preview-d1/private','image/jpeg','internal'),('static','/preview-properties/approved.jpg','image/jpeg','public'); INSERT INTO media_assignments(id,asset_id,building_id) VALUES ('m1','static','b1'); INSERT INTO media_publications(assignment_id,published) VALUES ('m1',1)");expect((await mediaResponse(db,'private',false)).status).toBe(404);const response=await mediaResponse(db,'static',false);expect(response.headers.get('location')).toBe('/preview-properties/approved.jpg');sql.exec('UPDATE media_publications SET published=0');expect((await mediaResponse(db,'static',false)).status).toBe(404);});
 it('bounds streamed bodies even without Content-Length',async()=>{const request=new Request(origin,{method:'POST',body:new ReadableStream({start(c){c.enqueue(new Uint8Array(9));c.enqueue(new Uint8Array(9));c.close()}}),duplex:'half'});await expect(boundedBody(request,12)).rejects.toBeInstanceOf(BodyTooLarge);});
});

it('every Admin API handler enforces session authorization and mutations reject foreign Origin',async()=>{
 const modules=import.meta.glob('../src/app/api/admin/**/route.ts');let checked=0;
 for(const [path,load]of Object.entries(modules)){
  if(path.endsWith('/session/route.ts'))continue;
  const handlers=await load();
  for(const method of ['GET','POST','PATCH','PUT','DELETE']){
   if(typeof handlers[method]!=='function')continue;
   const request=new Request(origin+'/api/admin/qa',{method,headers:{origin,...(method==='GET'?{}:{'content-type':'application/json'})},...(method==='GET'?{}:{body:'{}'})});
   expect((await handlers[method](request,{params:Promise.resolve({id:'qa'})})).status,`${path} ${method}`).toBe(401);checked++;
  }
 }
 expect(checked).toBeGreaterThan(30);
 await signIn(admin,'qa-admin@example.test','teams_admin_session');
 for(const [path,load]of Object.entries(modules)){
  if(path.endsWith('/session/route.ts'))continue;
  const handlers=await load();
  for(const method of ['POST','PATCH','PUT','DELETE'])if(typeof handlers[method]==='function'){
   const request=new Request(origin+'/api/admin/qa',{method,headers:{origin:'https://foreign.example','content-type':'application/json'},body:'{}'});
   expect([401,403]).toContain((await handlers[method](request,{params:Promise.resolve({id:'qa'})})).status);
  }
 }
});
