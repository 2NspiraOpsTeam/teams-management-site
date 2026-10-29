import { after, NextResponse } from 'next/server';
import { activeAdmin, adminDb, hash, sameOrigin } from '@/lib/admin-auth';
import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { POST as adminSignIn } from '@/lib/admin-code-session';
import { POST as tenantSignIn } from '@/lib/tenant-code-session';
import { rememberedBrowser, rememberBrowser } from '@/lib/remembered-browser';

export const runtime = 'nodejs';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const generic = { message: 'If this email is authorized, a sign-in code has been sent.' };

// All addresses share these atomic limits, independent of role or registration.
async function limited(request: Request, email: string, action: string) {
 const minutes = action === 'verify' ? 15 : 60;
 const limits = action === 'verify' ? [10, 50] : [6, 30];
 const keys = [`shared:${action}:email:${email}`, `shared:${action}:ip:${request.headers.get('cf-connecting-ip') || 'unknown'}`];
 const rows = await Promise.all(keys.map(async key => adminDb().prepare(`INSERT INTO admin_login_throttle (key_hash,window_start,count) VALUES (?,datetime('now'),1) ON CONFLICT(key_hash) DO UPDATE SET count=CASE WHEN window_start<=datetime('now','-${minutes} minutes') THEN 1 ELSE count+1 END,window_start=CASE WHEN window_start<=datetime('now','-${minutes} minutes') THEN datetime('now') ELSE window_start END RETURNING count`).bind(await hash(key)).first<{ count: number }>()));
 if (rows.some(row => !row)) throw new Error('storage');
 return rows.some((row, index) => row!.count > limits[index]);
}
export async function POST(request: Request) {
 if (!sameOrigin(request)) return reply({ error: 'Unauthorized' }, 401);
 if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ error: 'Expected JSON.' }, 415);
 let input: { email?: unknown; action?: unknown; code?: unknown; remember?: unknown; sendCode?: unknown };
 try {
  const value: unknown = JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
  if (!value || typeof value !== 'object' || Array.isArray(value)) return reply({ error: 'Invalid sign-in request.' },400);
  input = value;
 } catch (error) { return reply({ error: 'Invalid sign-in request.' },error instanceof BodyTooLarge ? 413 : 400); }
 if (input.action !== 'request' && input.action !== 'verify') return reply({ error: 'Invalid sign-in request.' },400);
 const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
 if (!/^[^\s@]{1,64}@[^\s@]{1,190}$/.test(email)) return reply({ error: 'Enter a valid email address.' },400);
 try {
  const blocked = await limited(request,email,input.action);
  if (input.action === 'request') {
   // Only an existing server-issued browser credential may disclose a password option.
   if (!blocked && input.sendCode !== true && await rememberedBrowser(request,email)) return reply({ passwordAvailable: true });
   // Atomically claim a one-minute dispatch window before scheduling. Concurrent
   // retries/double clicks cannot race the role-specific recent-code lookup.
   const cooldown = !blocked ? await adminDb().prepare("INSERT INTO admin_login_throttle (key_hash,window_start,count) VALUES (?,datetime('now'),1) ON CONFLICT(key_hash) DO UPDATE SET count=CASE WHEN window_start<=datetime('now','-60 seconds') THEN 1 ELSE count+1 END,window_start=CASE WHEN window_start<=datetime('now','-60 seconds') THEN datetime('now') ELSE window_start END RETURNING count").bind(await hash(`shared:dispatch:${email}`)).first<{count:number}>() : null;
   if (cooldown?.count === 1) {
    const forwarded = new Request(request.url,{method:'POST',headers:request.headers,body:JSON.stringify({action:'request',email})});
    // Dispatch after the neutral response: neither account lookup nor mail/provider
    // latency, failures, cooldowns or role-specific limits become discovery signals.
    after(async () => {
     try { await (await activeAdmin(email) ? adminSignIn : tenantSignIn)(forwarded); }
     catch { console.warn('Sign-in code dispatch unavailable'); }
    });
   }
   return reply(generic);
  }
  if (blocked) {
   const response = reply({error:'Too many sign-in attempts. Please try again in 15 minutes.'},429);
   response.headers.set('Retry-After','900'); return response;
  }
  const admin = await activeAdmin(email);
  const forwarded = new Request(request.url,{method:'POST',headers:request.headers,body:JSON.stringify({action:'verify',email,code:input.code})});
  const response = await (admin ? adminSignIn : tenantSignIn)(forwarded);
  if (!response.ok) return reply({error:'Invalid or expired code. Request a new code and try again.'},401);
  const result = new NextResponse(JSON.stringify({ok:true,redirect:admin?'/admin':'/tenant'}),{status:200,headers:response.headers});
  result.headers.set('Cache-Control','no-store');
  if (admin && input.remember === true) {
   // Remembering is optional and must never turn successful OTP into a second step.
   try { await rememberBrowser(request,result,email); } catch { console.warn('Browser preference could not be saved'); }
  }
  return result;
 } catch {
  return reply({error:'Sign-in is temporarily unavailable. Please try again later.'},503);
 }
}
