import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { NextResponse } from 'next/server';
import { adminEnv, hash, sameOrigin } from '@/lib/admin-auth';
import { tenantCookie, tenantDb, currentTenant, randomHex, tenantCodeHash } from '@/lib/tenant-auth';
import { MailService } from '@/lib/mail-service';
export const runtime = 'nodejs';
const reply = (body: object, status=200) => NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
const generic={message:'If this address has tenant access, a sign-in code has been sent.'};
export async function GET(){const tenant=await currentTenant();return tenant?reply({tenant}):reply({error:'Unauthorized'},401);}
export async function POST(request:Request){
  if(!sameOrigin(request)) return reply({error:'Unauthorized'},401);
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply({error:'Expected JSON.'},415);
  let input: {email?:unknown;code?:unknown;action?:unknown}|null;
  try {
    const value:unknown=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
    if(!value||typeof value!=='object'||Array.isArray(value))return reply({error:'Invalid sign-in request.'},400);
    input=value;
  } catch(error) {
    return reply({error:error instanceof BodyTooLarge?'Sign-in request is too large.':'Invalid sign-in request.'},error instanceof BodyTooLarge?413:400);
  }
  const email=typeof input?.email==='string'?input.email.trim().toLowerCase():'';
  if(!/^[^\s@]{1,64}@[^\s@]{1,190}$/.test(email)) return reply(generic);
  const db=tenantDb(),env=adminEnv(),mail=new MailService(env);
  if(!env.TENANT_OTP_PEPPER||env.TENANT_OTP_PEPPER.length<32||!env.TENANT_AUTH_FROM||!mail.configured()) return reply({error:'Tenant sign-in is temporarily unavailable. Please contact Teams Management.'},503);
  const tenant=await db.prepare("SELECT a.id FROM tenant_accounts a WHERE a.email=? AND a.active=1 AND EXISTS (SELECT 1 FROM tenant_assignments ta JOIN units u ON u.id=ta.unit_id AND u.building_id=ta.building_id WHERE ta.tenant_id=a.id AND ta.active=1)").bind(email).first<{id:string}>();
  if(input?.action==='request'){
    const keys=[await hash(`tenant-email:${email}`),await hash(`tenant-ip:${request.headers.get('cf-connecting-ip')||'unknown'}`)];
    for(const key of keys) await db.prepare("INSERT INTO tenant_login_throttle (key_hash,window_start,count) VALUES (?,datetime('now'),1) ON CONFLICT(key_hash) DO UPDATE SET count=CASE WHEN window_start<datetime('now','-1 hour') THEN 1 ELSE count+1 END,window_start=CASE WHEN window_start<datetime('now','-1 hour') THEN datetime('now') ELSE window_start END").bind(key).run();
    const rates=await Promise.all(keys.map(key=>db.prepare('SELECT count FROM tenant_login_throttle WHERE key_hash=?').bind(key).first<{count:number}>()));
    if((rates[0]?.count||0)>6||(rates[1]?.count||0)>30||!tenant) return reply(generic);
    const recent=await db.prepare("SELECT id FROM tenant_login_codes WHERE tenant_id=? AND created_at>datetime('now','-60 seconds') LIMIT 1").bind(tenant.id).first();
    if(recent) return reply(generic);
    const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%100000000).padStart(8,'0'),id=crypto.randomUUID();
    await db.prepare("UPDATE tenant_login_codes SET used_at=datetime('now') WHERE tenant_id=? AND used_at IS NULL").bind(tenant.id).run();
    await db.prepare("INSERT INTO tenant_login_codes (id,tenant_id,code_hash,expires_at) VALUES (?,?,?,datetime('now','+10 minutes'))").bind(id,tenant.id,await tenantCodeHash(tenant.id,code)).run();
    try{await mail.sendTenantOtp(email,code);}catch{await db.prepare("UPDATE tenant_login_codes SET used_at=datetime('now') WHERE id=?").bind(id).run();return reply({error:'Tenant sign-in is temporarily unavailable. Please contact Teams Management.'},503);}
    return reply(generic);
  }
  if(input?.action!=='verify'||typeof input.code!=='string'||!/^\d{8}$/.test(input.code)||!tenant) return reply({error:'Invalid or expired code.'},401);
  const row=await db.prepare("SELECT id,code_hash FROM tenant_login_codes WHERE tenant_id=? AND used_at IS NULL AND expires_at>datetime('now') AND attempt_count<5 ORDER BY created_at DESC LIMIT 1").bind(tenant.id).first<{id:string;code_hash:string}>();
  if(!row) return reply({error:'Invalid or expired code.'},401);
  const valid=(await tenantCodeHash(tenant.id,input.code))===row.code_hash;
  const claim=await db.prepare("UPDATE tenant_login_codes SET attempt_count=attempt_count+1,used_at=CASE WHEN ? THEN datetime('now') ELSE used_at END WHERE id=? AND used_at IS NULL AND expires_at>datetime('now') AND attempt_count<5").bind(valid?1:0,row.id).run();
  if(!valid||claim.meta.changes!==1) return reply({error:'Invalid or expired code.'},401);
  const token=randomHex(32);
  await db.prepare("INSERT INTO tenant_sessions (token_hash,tenant_id,expires_at) VALUES (?,?,datetime('now','+8 hours'))").bind(await hash(token),tenant.id).run();
  const response=reply({ok:true});response.cookies.set(tenantCookie,token,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:8*60*60});return response;
}
export async function DELETE(request:Request){if(!sameOrigin(request))return reply({error:'Unauthorized'},401);const token=request.headers.get('cookie')?.match(/(?:^|;\s*)teams_tenant_session=([0-9a-f]{64})(?:;|$)/)?.[1];if(token)await tenantDb().prepare("UPDATE tenant_sessions SET revoked_at=datetime('now') WHERE token_hash=?").bind(await hash(token)).run();const response=reply({ok:true});response.cookies.set(tenantCookie,'',{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:0});return response;}
