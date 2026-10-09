import { NextResponse } from 'next/server';
import { activeAdmin, adminDb, adminEnv, cookieName, currentAdmin, hash, sameOrigin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';
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
  const input = await request.json().catch(() => null) as { email?: unknown; code?: unknown; action?: unknown } | null;
  const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}$/.test(email)) return reply(generic);
  const db = adminDb();
  const env = adminEnv();
  if (!env.ADMIN_OTP_PEPPER || env.ADMIN_OTP_PEPPER.length < 32 || !env.RESEND_API_KEY || !env.ADMIN_LOGIN_FROM_EMAIL) return reply({ error: 'Admin sign-in is temporarily unavailable.' }, 503);
  if (input?.action === 'request') {
    // A fixed window limits both a recipient and a network without storing raw IPs.
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const keys = [await hash(`email:${email}`), await hash(`ip:${ip}`)];
    for (const key of keys) {
      await db.prepare("INSERT INTO admin_login_throttle (key_hash, window_start, count) VALUES (?, datetime('now'), 1) ON CONFLICT(key_hash) DO UPDATE SET count=CASE WHEN window_start < datetime('now','-1 hour') THEN 1 ELSE count+1 END, window_start=CASE WHEN window_start < datetime('now','-1 hour') THEN datetime('now') ELSE window_start END").bind(key).run();
    }
    const rates = await Promise.all(keys.map(key => db.prepare('SELECT count FROM admin_login_throttle WHERE key_hash=?').bind(key).first<{ count: number }>()));
    if ((rates[0]?.count || 0) > 6 || (rates[1]?.count || 0) > 30) return reply(generic);
    if (!(await activeAdmin(email))) return reply(generic);
    const recent = await db.prepare("SELECT id FROM admin_login_codes WHERE email=? AND created_at > datetime('now','-60 seconds') ORDER BY created_at DESC LIMIT 1").bind(email).first();
    if (recent) return reply(generic);
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 100000000).padStart(8, '0');
    const id = crypto.randomUUID();
    await db.prepare("UPDATE admin_login_codes SET used_at=datetime('now') WHERE email=? AND used_at IS NULL").bind(email).run();
    await db.prepare("INSERT INTO admin_login_codes (id,email,code_hash,expires_at) VALUES (?,?,?,datetime('now','+10 minutes'))").bind(id, email, await codeHash(email, code)).run();
    try {
      const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `teams-admin-login-${id}` }, body: JSON.stringify({ from: env.ADMIN_LOGIN_FROM_EMAIL, to: [email], subject: 'Teams Admin sign-in code', text: `Your Teams Admin sign-in code is ${code}. It expires in 10 minutes. If you did not request it, ignore this email.` }) });
      if (!response.ok) await db.prepare("UPDATE admin_login_codes SET used_at=datetime('now') WHERE id=?").bind(id).run();
    } catch { await db.prepare("UPDATE admin_login_codes SET used_at=datetime('now') WHERE id=?").bind(id).run(); }
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
  await db.prepare("INSERT INTO admin_sessions (token_hash,email,expires_at) VALUES (?,?,datetime('now','+8 hours'))").bind(await hash(session), email).run();
  const response = reply({ email });
  response.cookies.set(cookieName, session, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 });
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
