import { NextResponse } from 'next/server';
import { activeAdmin, adminDb, cookieName, currentAdmin, hash, sameOrigin, unauthorized, verifyAccessIdentity } from '@/lib/admin-auth';
export const runtime = 'edge';
export async function GET() {
  const email = await currentAdmin();
  return email ? NextResponse.json({ email }, { headers: { 'Cache-Control': 'no-store' } }) : unauthorized();
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return unauthorized();
  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) return unauthorized();
  const email = await verifyAccessIdentity(token);
  if (!email || !(await activeAdmin(email))) return unauthorized();
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const session = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  await adminDb().prepare("INSERT INTO admin_sessions (token_hash, email, expires_at) VALUES (?, ?, datetime('now', '+8 hours'))").bind(await hash(session), email).run();
  const response = NextResponse.json({ email }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(cookieName, session, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 });
  return response;
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return unauthorized();
  const token = request.headers.get('cookie')?.match(/(?:^|;\s*)teams_admin_session=([0-9a-f]{64})(?:;|$)/)?.[1];
  if (token) await adminDb().prepare("UPDATE admin_sessions SET revoked_at = datetime('now') WHERE token_hash = ?").bind(await hash(token)).run();
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(cookieName, '', { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
