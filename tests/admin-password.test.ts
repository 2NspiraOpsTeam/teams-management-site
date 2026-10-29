import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
const state=vi.hoisted(()=>({actor:null as any,db:null as any,token:'a'.repeat(64)}));
vi.mock('next/headers',()=>({cookies:async()=>({get:()=>({value:state.token})})}));
vi.mock('@/lib/admin-auth',()=>({adminDb:()=>state.db,requireAdmin:async()=>state.actor,cookieName:'teams_admin_session',sameOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,unauthorized:()=>Response.json({error:'Unauthorized'},{status:401}),hash:async(v:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),b=>b.toString(16).padStart(2,'0')).join('')}));
import {GET,POST,PUT} from '@/app/api/admin/password/route';
import {encodePassword,verifyPassword,passwordError} from '@/lib/admin-password';
import {hash} from '@/lib/admin-auth';
let sql:DatabaseSync;
const origin='https://example.test';
function adapter(){return {prepare(query:string){let args:any[]=[];const p={bind(...v:any[]){args=v;return p;},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}};return p;},async batch(statements:any[]){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};}
const req=(body:unknown,method='POST',source=origin)=>new Request(origin+'/api/admin/password',{method,headers:{origin:source,'content-type':'application/json'},body:JSON.stringify(body)});
async function login(body:any) {
 const token='b'.repeat(64);
 if(sql.prepare('SELECT email FROM admin_identities WHERE email=?').get(String(body.email).trim().toLowerCase()))sql.prepare("INSERT OR REPLACE INTO admin_remembered_browsers(token_hash,email,expires_at) VALUES (?,?,datetime('now','+1 day'))").run(await hash(token),String(body.email).trim().toLowerCase());
 const request=req(body);request.headers.set('cookie','__Host-teams_browser='+token);return POST(request);
}
const password='Synthetic-only long passphrase 42';
beforeEach(async()=>{
 sql=new DatabaseSync(':memory:');sql.exec('PRAGMA foreign_keys=ON');
 for(const file of ['schema.sql','admin-phase1.sql','admin-otp.sql','admin-passwords.sql','remembered-browsers.sql'])sql.exec(readFileSync('src/lib/migrations/'+file,'utf8'));
 sql.exec("INSERT INTO admin_identities(email,active) VALUES ('admin@example.test',1),('other@example.test',1),('disabled@example.test',0)");
 state.db=adapter();state.actor={email:'admin@example.test',db:state.db};state.token='a'.repeat(64);
 sql.prepare("INSERT INTO admin_sessions(token_hash,email,expires_at) VALUES (?,'admin@example.test',datetime('now','+1 day'))").run(await hash(state.token));
});
afterEach(()=>sql.close());
it('salts credentials, preserves spaces and rejects wrong/unknown/malformed hashes',async()=>{
 const a=await encodePassword(password),b=await encodePassword(password);expect(a).not.toBe(b);expect(a).not.toContain(password);
 expect(await verifyPassword(password,a)).toBe(true);expect(await verifyPassword(password+' ',a)).toBe(false);expect(await verifyPassword(password,null)).toBe(false);expect(await verifyPassword(password,'malformed')).toBe(false);
 expect(passwordError('short')).toBeTruthy();expect(passwordError('x'.repeat(129))).toBeTruthy();
});
it('sets own password after fresh code login, logs no credential and persists on reload',async()=>{
 expect((await PUT(req({email:'admin@example.test',password},'PUT'))).status).toBe(200);
 const data=await (await GET()).json();expect(data.members.find((m:any)=>m.email==='admin@example.test').hasPassword).toBe(1);
 const audit=JSON.stringify(sql.prepare('SELECT * FROM audit_log').all());expect(audit).not.toContain(password);expect(audit).not.toContain('scrypt$');
 expect(JSON.stringify(data)).not.toContain('password_hash');expect(JSON.stringify(data)).not.toContain('version');
});
it('signs in without mail and marks password session with secure admin-only cookie',async()=>{
 await PUT(req({email:'admin@example.test',password},'PUT'));
 const r=await login({email:' ADMIN@EXAMPLE.TEST ',password});expect(r.status).toBe(200);expect(await r.json()).toEqual({ok:true,redirect:'/admin'});
 const cookie=r.headers.get('set-cookie')!;expect(cookie).toContain('teams_admin_session=');for(const flag of ['HttpOnly','Secure','SameSite=strict'])expect(cookie).toContain(flag);
 expect(cookie).not.toContain('teams_tenant');expect(sql.prepare('SELECT count(*) n FROM admin_password_sessions').get()?.n).toBe(1);
});
it('resets another admin, invalidates old password and all their sessions, retains actor',async()=>{
 await PUT(req({email:'other@example.test',password},'PUT'));
 const signed=await login({email:'other@example.test',password});expect(signed.status).toBe(200);
 const next='Replacement synthetic passphrase 99';expect((await PUT(req({email:'other@example.test',password:next},'PUT'))).status).toBe(200);
 expect(sql.prepare("SELECT count(*) n FROM admin_sessions WHERE email='other@example.test' AND revoked_at IS NULL").get()?.n).toBe(0);
 expect(sql.prepare("SELECT count(*) n FROM admin_sessions WHERE email='admin@example.test' AND revoked_at IS NULL").get()?.n).toBe(1);
 expect((await login({email:'other@example.test',password})).status).toBe(401);expect((await login({email:'other@example.test',password:next})).status).toBe(200);
});
it('requires actor password for password sessions or stale OTP, never the target password',async()=>{
 await PUT(req({email:'admin@example.test',password},'PUT'));
 sql.prepare('INSERT INTO admin_password_sessions(token_hash) VALUES (?)').run(await hash(state.token));
 expect((await PUT(req({email:'other@example.test',password},'PUT'))).status).toBe(403);
 expect((await PUT(req({email:'other@example.test',password,currentPassword:'wrong'},'PUT'))).status).toBe(403);
 expect((await PUT(req({email:'other@example.test',password,currentPassword:password},'PUT'))).status).toBe(200);
 sql.exec('DELETE FROM admin_password_sessions');sql.exec("UPDATE admin_sessions SET created_at=datetime('now','-16 minutes')");
 expect((await PUT(req({email:'other@example.test',password},'PUT'))).status).toBe(403);
});
it('rejects anonymous/tenant management, inactive targets and role escalation',async()=>{
 state.actor=null;expect((await GET()).status).toBe(401);expect((await PUT(req({email:'other@example.test',password},'PUT'))).status).toBe(401);
 state.actor={email:'admin@example.test',db:state.db};
 for(const email of ['tenant@example.test','disabled@example.test']){expect((await PUT(req({email,password},'PUT'))).status).toBe(400);expect((await POST(req({email,password}))).status).toBe(401);}
 expect(sql.prepare('SELECT count(*) n FROM admin_passwords').get()?.n).toBe(0);expect(sql.prepare('SELECT count(*) n FROM admin_identities').get()?.n).toBe(3);
});
it('blocks cross-origin, oversized and malformed writes without credential updates',async()=>{
 expect((await POST(req({email:'admin@example.test',password},'POST','https://evil.test'))).status).toBe(401);
 expect((await PUT(req({email:'admin@example.test',password},'PUT','https://evil.test'))).status).toBe(401);
 expect((await POST(req({password:'x'.repeat(5000)}))).status).toBe(413);
 expect((await POST(req([]))).status).toBe(400);expect((await PUT(req({email:'admin@example.test',password:'short'},'PUT'))).status).toBe(400);
});
it('bounds password brute force per email and network without setting a cookie',async()=>{
 for(let i=0;i<10;i++)expect((await login({email:`missing${i}@example.test`,password})).status).toBe(401);
 const r=await login({email:'admin@example.test',password});expect(r.status).toBe(429);expect(r.headers.get('retry-after')).toBe('900');expect(r.headers.get('set-cookie')).toBeNull();
});
it('rolls back credential and session changes when auditing fails',async()=>{
 sql.exec("CREATE TRIGGER audit_failure BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'private error'); END;");
 const r=await PUT(req({email:'admin@example.test',password},'PUT'));expect(r.status).toBe(503);expect(await r.text()).not.toContain('private');expect(sql.prepare('SELECT count(*) n FROM admin_passwords').get()?.n).toBe(0);
});
it('applies the new migration repeatedly without changing preexisting identities and sessions',()=>{sql.exec(readFileSync('src/lib/migrations/admin-passwords.sql','utf8'));expect(sql.prepare('SELECT count(*) n FROM admin_identities').get()?.n).toBe(3);expect(sql.prepare('SELECT count(*) n FROM admin_sessions').get()?.n).toBe(1);expect(sql.prepare('PRAGMA foreign_key_check').all()).toEqual([]);});

it('requires a valid browser credential even for the correct password; reset revokes it',async()=>{
 await PUT(req({email:'admin@example.test',password},'PUT'));
 expect((await POST(req({email:'admin@example.test',password}))).status).toBe(401);
 expect((await login({email:'admin@example.test',password})).status).toBe(200);
 const request=req({email:'admin@example.test',password});request.headers.set('cookie','__Host-teams_browser='+'b'.repeat(64));
 sql.exec("UPDATE admin_remembered_browsers SET expires_at=datetime('now','-1 second')");expect((await POST(request)).status).toBe(401);
 await login({email:'admin@example.test',password});
 await PUT(req({email:'admin@example.test',password:password+' new'},'PUT'));
 expect(sql.prepare('SELECT count(*) n FROM admin_remembered_browsers WHERE revoked_at IS NULL').get()?.n).toBe(0);
});
