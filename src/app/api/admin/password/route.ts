import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminDb, cookieName, hash, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { encodePassword, passwordError, randomSession, verifyPassword } from '@/lib/admin-password';
export const runtime = 'nodejs';
const reply = (body:object,status=200) => NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
async function input(request:Request) {
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new Error('json');
 const value:unknown=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('body');
 return value as Record<string,unknown>;
}
const emailValue = (v:unknown) => typeof v==='string'?v.trim().toLowerCase():'';
async function limit(request:Request,email:string) {
 const db=adminDb();
 const keys=await Promise.all([`password:email:${email}`,`password:ip:${request.headers.get('cf-connecting-ip')||'unknown'}`].map(hash));
 const rows=await Promise.all(keys.map(key=>db.prepare("INSERT INTO admin_login_throttle (key_hash,window_start,count) VALUES (?,datetime('now'),1) ON CONFLICT(key_hash) DO UPDATE SET count=CASE WHEN window_start<=datetime('now','-15 minutes') THEN 1 ELSE count+1 END,window_start=CASE WHEN window_start<=datetime('now','-15 minutes') THEN datetime('now') ELSE window_start END RETURNING count").bind(key).first<{count:number}>()));
 if(rows.some(row=>!row))throw new Error('storage');
 if(rows.some(row=>row!.count>10)) {const response=reply({error:'Too many password attempts. Try again in 15 minutes or use an email sign-in code.'},429);response.headers.set('Retry-After','900');return response;}
 return null;
}
function failure(error:unknown) {if(error instanceof SyntaxError || error instanceof Error && ['json','body'].includes(error.message))return reply({error:'Invalid password request.'},400);return reply({error:error instanceof BodyTooLarge?'Request is too large.':'Password sign-in is temporarily unavailable. Please try again.'},error instanceof BodyTooLarge?413:503);}
export async function POST(request:Request) {
 if(!sameOrigin(request))return unauthorized();
 try {
  const value=await input(request),email=emailValue(value.email);
  if(!/^[^\s@]{1,64}@[^\s@]{1,190}$/.test(email)||typeof value.password!=='string'||value.password.length>128||!value.password)return reply({error:'Enter your email address and password.'},400);
  const blocked=await limit(request,email);if(blocked)return blocked;
  const db=adminDb();
  const row=await db.prepare('SELECT p.password_hash,p.version FROM admin_passwords p JOIN admin_identities a ON a.email=p.email WHERE p.email=? AND a.active=1').bind(email).first<{password_hash:string;version:string}>();
  if(!await verifyPassword(value.password,row?.password_hash??null)||!row)return reply({error:'Email or password is incorrect. You can also sign in with an email code.'},401);
  const token=randomSession(),tokenHash=await hash(token);
  // Recheck credential version and active identity inside the session write to
  // prevent a concurrent reset/disable from issuing a stale authenticated session.
  const result=await db.batch([
   db.prepare("INSERT INTO admin_sessions (token_hash,email,expires_at) SELECT ?,p.email,datetime('now','+24 hours') FROM admin_passwords p JOIN admin_identities a ON a.email=p.email WHERE p.email=? AND p.version=? AND a.active=1").bind(tokenHash,email,row.version),
   db.prepare('INSERT INTO admin_password_sessions (token_hash) SELECT token_hash FROM admin_sessions WHERE token_hash=?').bind(tokenHash),
  ]);
  if(result[0].meta.changes!==1)return unauthorized();
  const response=reply({ok:true,redirect:'/admin'});
  response.cookies.set(cookieName,token,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:86400});
  return response;
 }catch(error){return failure(error);}
}
export async function GET() {
 try {
  const admin=await requireAdmin();if(!admin)return unauthorized();
  const members=await admin.db.prepare('SELECT a.email,CASE WHEN p.email IS NULL THEN 0 ELSE 1 END AS hasPassword FROM admin_identities a LEFT JOIN admin_passwords p ON p.email=a.email WHERE a.active=1 ORDER BY a.email').all<{email:string;hasPassword:number}>();
  return reply({email:admin.email,members:members.results});
 }catch(error){return failure(error);}
}
export async function PUT(request:Request) {
 if(!sameOrigin(request))return unauthorized();
 try {
  const admin=await requireAdmin();if(!admin)return unauthorized();
  const value=await input(request),target=emailValue(value.email),invalid=passwordError(value.password);
  if(invalid)return reply({error:invalid},400);
  if(typeof value.currentPassword!=='undefined'&&(typeof value.currentPassword!=='string'||value.currentPassword.length>128))return reply({error:'Enter a valid current password.'},400);
  const blocked=await limit(request,admin.email);if(blocked)return blocked;
  const db=admin.db;
  const token=(await cookies()).get(cookieName)?.value||'',tokenHash=await hash(token);
  const recentCode=await db.prepare("SELECT s.token_hash FROM admin_sessions s WHERE s.token_hash=? AND s.email=? AND s.revoked_at IS NULL AND s.expires_at>datetime('now') AND s.created_at>datetime('now','-15 minutes') AND NOT EXISTS (SELECT 1 FROM admin_password_sessions p WHERE p.token_hash=s.token_hash)").bind(tokenHash,admin.email).first();
  if(!recentCode) {
   const actor=await db.prepare('SELECT password_hash FROM admin_passwords WHERE email=?').bind(admin.email).first<{password_hash:string}>();
   if(typeof value.currentPassword!=='string'||!await verifyPassword(value.currentPassword,actor?.password_hash??null))return reply({error:'Enter your own current password, or sign out and sign in with an email code to verify your identity.'},403);
  }
  if(!await db.prepare('SELECT email FROM admin_identities WHERE email=? AND active=1').bind(target).first())return reply({error:'Select an active admin team member. Tenant passwords are not supported.'},400);
  const encoded=await encodePassword(value.password as string),version=crypto.randomUUID();
  const event=JSON.stringify({targetEmail:target,changedBy:admin.email});
  await db.batch([
   db.prepare("INSERT INTO admin_passwords (email,password_hash,version) VALUES (?,?,?) ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash,version=excluded.version,updated_at=datetime('now')").bind(target,encoded,version),
   db.prepare("UPDATE admin_sessions SET revoked_at=datetime('now') WHERE email=? AND token_hash<>? AND revoked_at IS NULL").bind(target,tokenHash),
   db.prepare("INSERT INTO audit_log (id,action,entity_type,entity_id,record_after_json,user_actor) VALUES (?,'admin_password_changed','admin_identity',?,?,?)").bind(crypto.randomUUID(),target,event,admin.email),
  ]);
  return reply({ok:true,message:target===admin.email?'Your password has been saved. Your other admin sessions have been signed out.':'Team member password saved. Their existing admin sessions have been signed out.'});
 }catch(error){return failure(error);}
}
