import { randomInt } from 'node:crypto';
import { trackLoginEmail } from '@/lib/login-email-history';
import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { NextResponse } from 'next/server';
import { activeAdmin, adminDb, adminEnv, cookieName, currentAdmin, hash, sameOrigin, unauthorized } from '@/lib/admin-auth';
import { MailService } from '@/lib/mail-service';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const generic = { message: 'If this email is authorized, a sign-in code has been sent.' };
const randomHex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join('');
async function codeHash(email: string, code: string) {
  const pepper = adminEnv().ADMIN_OTP_PEPPER;
  if (!pepper || pepper.length < 32) throw new Error('Admin sign-in unavailable');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${email}:${code}`));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
export async function GET() {
  const email = await currentAdmin();
  return email ? reply({ email }) : unauthorized();
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return unauthorized();
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return reply({error:'Expected JSON.'},415);
  let input: {email?:unknown;code?:unknown;action?:unknown}|null;
  try {
    const value:unknown=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));
    if(!value||typeof value!=='object'||Array.isArray(value))return reply({error:'Invalid sign-in request.'},400);
    input=value;
  } catch(error) {
    return reply({error:error instanceof BodyTooLarge?'Sign-in request is too large.':'Invalid sign-in request.'},error instanceof BodyTooLarge?413:400);
  }
  const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}$/.test(email)) return reply(generic);
  const db = adminDb();
  const env = adminEnv();
  const mail = new MailService(env);
  if (!env.ADMIN_OTP_PEPPER || env.ADMIN_OTP_PEPPER.length < 32 || !mail.configured() || !env.ADMIN_AUTH_FROM) return reply({ error: 'Admin sign-in is temporarily unavailable.' }, 503);
  if (input?.action === 'request') {
    // Separate daily keys from legacy hourly counters; no data migration is needed.
    // Count requests atomically, with the first 300 allowed in each 24-hour window.
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const keys = [await hash(`daily:email:${email}`), await hash(`daily:ip:${ip}`)];
    const rates = await Promise.all(keys.map(key => db.prepare("INSERT INTO admin_login_throttle (key_hash, window_start, count) VALUES (?, datetime('now'), 1) ON CONFLICT(key_hash) DO UPDATE SET count=CASE WHEN window_start <= datetime('now','-1 day') THEN 1 ELSE count+1 END, window_start=CASE WHEN window_start <= datetime('now','-1 day') THEN datetime('now') ELSE window_start END RETURNING count, MAX(1, CAST(strftime('%s', window_start) AS INTEGER) + 86400 - CAST(strftime('%s', 'now') AS INTEGER)) AS retry_after").bind(key).first<{ count: number; retry_after: number }>()));
    if (rates.some(rate => !rate)) return reply({ error: 'Admin sign-in is temporarily unavailable.' }, 503);
    const blocked = rates.filter(rate => rate && rate.count > 300);
    if (blocked.length) {
      const retryAfter = Math.max(...blocked.map(rate => rate!.retry_after));
      const response = reply({ error: 'Daily sign-in code request limit reached (300 per 24 hours for an email address or network). Please try again when the limit resets.', retryAfterSeconds: retryAfter }, 429);
      response.headers.set('Retry-After', String(retryAfter));
      return response;
    }
    if (!(await activeAdmin(email))) return reply(generic);
    const recent = await db.prepare("SELECT id FROM admin_login_codes WHERE email=? AND created_at > datetime('now','-60 seconds') ORDER BY created_at DESC LIMIT 1").bind(email).first();
    if (recent) return reply(generic);
    const code = String(randomInt(100000000)).padStart(8, '0');
    const id = crypto.randomUUID();
    await db.prepare("UPDATE admin_login_codes SET used_at=datetime('now') WHERE email=? AND used_at IS NULL").bind(email).run();
    await db.prepare("INSERT INTO admin_login_codes (id,email,code_hash,expires_at) VALUES (?,?,?,datetime('now','+10 minutes'))").bind(id, email, await codeHash(email, code)).run();
    try {
      await trackLoginEmail(db, 'admin', email, () => mail.sendAdminOtp(email, code));
    } catch {
      await db.prepare("UPDATE admin_login_codes SET used_at=datetime('now') WHERE id=?").bind(id).run();
      console.warn('Admin code delivery failed');
      return reply({ error: 'Admin sign-in is temporarily unavailable.' }, 503);
    }
    return reply(generic);
  }
  if (input?.action !== 'verify' || typeof input.code !== 'string' || !/^\d{8}$/.test(input.code)) return unauthorized();
  const row = await db.prepare("SELECT id,code_hash,attempt_count FROM admin_login_codes WHERE email=? AND used_at IS NULL AND expires_at>datetime('now') ORDER BY created_at DESC LIMIT 1").bind(email).first<{ id: string; code_hash: string; attempt_count: number }>();
  if (!row || row.attempt_count >= 5 || !(await activeAdmin(email))) return unauthorized();
  const candidate = await codeHash(email, input.code);
  const valid = candidate === row.code_hash;
  const claim = await db.prepare("UPDATE admin_login_codes SET attempt_count=attempt_count+1,used_at=CASE WHEN ? THEN datetime('now') ELSE used_at END WHERE id=? AND used_at IS NULL AND expires_at>datetime('now') AND attempt_count<5").bind(valid ? 1 : 0, row.id).run();
  if (!valid || claim.meta.changes !== 1) return unauthorized();
  const session = randomHex(32);
  await db.prepare("INSERT INTO admin_sessions (token_hash,email,expires_at) VALUES (?,?,datetime('now','+24 hours'))").bind(await hash(session), email).run();
  const response = reply({ email });
  response.cookies.set(cookieName, session, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 24 * 60 * 60 });
  return response;
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return unauthorized();
  const token = request.headers.get('cookie')?.match(/(?:^|;\s*)teams_admin_session=([0-9a-f]{64})(?:;|$)/)?.[1];
  if (token) await adminDb().prepare("UPDATE admin_sessions SET revoked_at=datetime('now') WHERE token_hash=?").bind(await hash(token)).run();
  const response = reply({ ok: true });
  response.cookies.set(cookieName, '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
