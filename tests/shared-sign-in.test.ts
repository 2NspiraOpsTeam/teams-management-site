import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
const state = vi.hoisted(() => ({ db:null as any, pending:[] as Array<()=>Promise<void>>, admin:vi.fn(),tenant:vi.fn(),lookup:vi.fn() }));
vi.mock('next/server',async original=>({...await original<typeof import('next/server')>(),after:(task:()=>Promise<void>)=>state.pending.push(task)}));
vi.mock('../src/lib/admin-auth', () => ({
 adminDb:()=>state.db,
 activeAdmin:state.lookup,
 hash:async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join(''),
 sameOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,
}));
vi.mock('../src/lib/admin-code-session',()=>({POST:state.admin}));
vi.mock('../src/lib/tenant-code-session',()=>({POST:state.tenant}));
import { POST } from '../src/app/api/session/route';
import { DELETE } from '../src/app/api/session/browser/route';
import { hash } from '../src/lib/admin-auth';
import { rememberedBrowser } from '../src/lib/remembered-browser';
let sql:DatabaseSync;
const origin='https://example.test',email='admin@example.test',token='b'.repeat(64);
const request=(body:unknown,cookie='',source=origin)=>new Request(origin+'/api/session',{method:'POST',headers:{origin:source,'content-type':'application/json',cookie},body:JSON.stringify(body)});
function adapter(){return {prepare(query:string){let args:any[]=[];const p={bind(...values:any[]){args=values;return p;},async first(){return sql.prepare(query).get(...args)||null;},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};return p;},async batch(items:any[]){sql.exec('BEGIN');try{const results=[];for(const item of items)results.push(await item.run());sql.exec('COMMIT');return results;}catch(e){sql.exec('ROLLBACK');throw e;}}};}
async function enroll(){sql.prepare("INSERT INTO admin_remembered_browsers(token_hash,email,expires_at) VALUES (?,?,datetime('now','+30 days'))").run(await hash(token),email);}
async function drain(){for(const task of state.pending.splice(0))await task();}
beforeEach(()=>{
 vi.resetAllMocks();state.pending=[];sql=new DatabaseSync(':memory:');
 for(const file of ['schema.sql','admin-phase1.sql','admin-otp.sql','admin-passwords.sql','remembered-browsers.sql'])sql.exec(readFileSync('src/lib/migrations/'+file,'utf8'));
 sql.prepare('INSERT INTO admin_identities(email) VALUES (?)').run(email);
 sql.prepare("INSERT INTO admin_passwords(email,password_hash,version) VALUES (?,'synthetic','1')").run(email);
 state.db=adapter();state.lookup.mockImplementation(async address=>address===email);
 state.admin.mockResolvedValue(Response.json({email},{headers:{'set-cookie':'teams_admin_session=verified; HttpOnly; Secure; SameSite=Strict; Path=/'}}));
 state.tenant.mockResolvedValue(Response.json({ok:true},{headers:{'set-cookie':'teams_tenant_session=verified; HttpOnly; Secure; SameSite=Strict; Path=/'}}));
});
afterEach(()=>sql.close());
it.each([email,'tenant@example.test','unknown@example.test'])('returns the identical neutral response before role lookup or dispatch: %s',async address=>{
 const response=await POST(request({action:'request',email:address}));
 expect(response.status).toBe(200);expect(await response.json()).toEqual({message:'If this email is authorized, a sign-in code has been sent.'});
 expect(response.headers.get('set-cookie')).toBeNull();expect(response.headers.get('cache-control')).toBe('no-store');
 expect(state.lookup).not.toHaveBeenCalled();expect(state.admin).not.toHaveBeenCalled();expect(state.tenant).not.toHaveBeenCalled();
 await drain();expect(address===email?state.admin:state.tenant).toHaveBeenCalledOnce();
});
it.each([401,429,503])('does not expose role-specific delivery errors or rate limits: %s',async status=>{
 state.admin.mockResolvedValue(Response.json({error:'private admin detail'},{status}));
 const response=await POST(request({action:'request',email}));await drain();expect(response.status).toBe(200);expect(await response.text()).not.toContain('admin');
});
it('uniformly suppresses repeated requests without dispatching or invalidating existing codes',async()=>{
 for(let i=0;i<6;i++){expect((await POST(request({action:'request',email}))).status).toBe(200);await drain();}
 state.admin.mockClear();const response=await POST(request({action:'request',email}));expect(response.status).toBe(200);await drain();expect(state.admin).not.toHaveBeenCalled();
});
it.each([email,'tenant@example.test'])('code verification completes sign-in without a password: %s',async address=>{
 const response=await POST(request({action:'verify',email:address,code:'12345678',role:'admin',redirect:'https://evil.test'}));
 expect(await response.json()).toEqual({ok:true,redirect:address===email?'/admin':'/tenant'});
 expect(response.headers.get('set-cookie')).toContain(address===email?'teams_admin_session=':'teams_tenant_session=');
 expect(sql.prepare('SELECT count(*) n FROM admin_remembered_browsers').get()?.n).toBe(0);
});
it('never remembers an unverified or tenant identity, and never falls back after rejection',async()=>{
 state.admin.mockResolvedValue(Response.json({error:'invalid'},{status:401}));
 const response=await POST(request({action:'verify',email,code:'00000000',remember:true}));expect(response.status).toBe(401);expect(response.headers.get('set-cookie')).toBeNull();expect(state.tenant).not.toHaveBeenCalled();
 await POST(request({action:'verify',email:'tenant@example.test',code:'12345678',remember:true}));
 expect(sql.prepare('SELECT count(*) n FROM admin_remembered_browsers').get()?.n).toBe(0);
});
it('issues only a hashed, expiring, secure browser credential after successful admin OTP',async()=>{
 const response=await POST(request({action:'verify',email,code:'12345678',remember:true}));
 expect(await response.json()).toEqual({ok:true,redirect:'/admin'});
 const cookies=response.headers.get('set-cookie')!;expect(cookies).toContain('teams_admin_session=verified');expect(cookies).toContain('__Host-teams_browser=');
 for(const flag of ['HttpOnly','Secure','SameSite=strict','Max-Age=2592000','Path=/'])expect(cookies).toContain(flag);
 const issued=cookies.match(/__Host-teams_browser=([a-f0-9]{64})/)![1];
 const row=sql.prepare('SELECT * FROM admin_remembered_browsers').get()!;expect(row.token_hash).toBe(await hash(issued));expect(JSON.stringify(row)).not.toContain(issued);expect(row.expires_at).toBeTruthy();
 const recognized=await POST(request({action:'request',email},'__Host-teams_browser='+issued));expect(await recognized.json()).toEqual({message:'If this email is authorized, a sign-in code has been sent.'});expect(state.pending).toHaveLength(1);
});
it('does not accept flags, guessed cookies, another email, expiry, revocation or disabled identity',async()=>{
 await enroll();
 for(const cookie of ['', '__Host-teams_browser=true','__Host-teams_browser='+'c'.repeat(64)]){
  const response=await POST(request({action:'request',email,remember:true,method:'password'},cookie));expect(await response.json()).not.toHaveProperty('passwordAvailable');
 }
 const known=request({},'__Host-teams_browser='+token);
 expect(await rememberedBrowser(known,'tenant@example.test')).toBe(false);
 sql.exec("UPDATE admin_remembered_browsers SET expires_at=datetime('now','-1 second')");expect(await rememberedBrowser(known,email)).toBe(false);
 sql.exec("UPDATE admin_remembered_browsers SET expires_at=datetime('now','+1 day'),revoked_at=datetime('now')");expect(await rememberedBrowser(known,email)).toBe(false);
 sql.exec('UPDATE admin_remembered_browsers SET revoked_at=NULL');sql.exec('UPDATE admin_identities SET active=0');expect(await rememberedBrowser(known,email)).toBe(false);
});
it('supports code fallback on remembered browsers and explicit server-side forgetting',async()=>{
 await enroll();const cookie='__Host-teams_browser='+token;
 const response=await POST(request({action:'request',email,sendCode:true},cookie));expect(await response.json()).not.toHaveProperty('passwordAvailable');await drain();expect(state.admin).toHaveBeenCalledOnce();
 const forgotten=await DELETE(new Request(origin+'/api/session/browser',{method:'DELETE',headers:{origin,cookie}}));expect(forgotten.status).toBe(200);expect(forgotten.headers.get('set-cookie')).toContain('Max-Age=0');expect(await rememberedBrowser(request({},cookie),email)).toBe(false);
});
it('bounds code attempts per network and address before role lookup',async()=>{
 state.admin.mockResolvedValue(Response.json({error:'invalid'},{status:401}));for(let i=0;i<10;i++)expect((await POST(request({action:'verify',email,code:'00000000'}))).status).toBe(401);
 state.lookup.mockClear();const response=await POST(request({action:'verify',email,code:'00000000'}));expect(response.status).toBe(429);expect(response.headers.get('retry-after')).toBe('900');expect(state.lookup).not.toHaveBeenCalled();
});
it('rejects foreign origin, invalid email and oversized input before lookup',async()=>{
 expect((await POST(request({action:'request',email},'','https://evil.test'))).status).toBe(401);
 expect((await POST(request({action:'request',email:'invalid'}))).status).toBe(400);
 expect((await POST(request({action:'request',email:'x'.repeat(5000)}))).status).toBe(413);expect(state.lookup).not.toHaveBeenCalled();
});

it('claims only one background dispatch for concurrent code requests',async()=>{
 const responses=await Promise.all(Array.from({length:5},()=>POST(request({action:'request',email}))));
 expect(responses.every(response=>response.status===200)).toBe(true);expect(state.pending).toHaveLength(1);await drain();expect(state.admin).toHaveBeenCalledOnce();
});
