import { adminDb, hash } from '@/lib/admin-auth';
import { randomSession } from '@/lib/admin-password';
import type { NextResponse } from 'next/server';

export const browserCookie = '__Host-teams_browser';
export const browserCookieOptions = { httpOnly: true, secure: true, sameSite: 'strict' as const, path: '/', maxAge: 30 * 86400 };
export function browserToken(request: Request) {
 return request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-teams_browser=([0-9a-f]{64})(?:;|$)/)?.[1] || '';
}
export async function rememberedBrowser(request: Request, email: string, requirePassword = true) {
 const token = browserToken(request);
 if (!token) return false;
 const row = await adminDb().prepare(`SELECT b.token_hash FROM admin_remembered_browsers b JOIN admin_identities a ON a.email=b.email WHERE b.token_hash=? AND b.email=? AND b.revoked_at IS NULL AND b.expires_at>datetime('now') AND a.active=1 ${requirePassword ? 'AND EXISTS (SELECT 1 FROM admin_passwords p WHERE p.email=b.email)' : ''}`).bind(await hash(token), email).first();
 return !!row;
}
export async function rememberBrowser(request: Request, response: NextResponse, email: string) {
 const token = randomSession();
 const old = browserToken(request);
 const db = adminDb();
 await db.batch([
  db.prepare("UPDATE admin_remembered_browsers SET revoked_at=datetime('now') WHERE token_hash=?").bind(await hash(old)),
  db.prepare("INSERT INTO admin_remembered_browsers (token_hash,email,expires_at) SELECT ?,email,datetime('now','+30 days') FROM admin_identities WHERE email=? AND active=1").bind(await hash(token),email),
 ]);
 response.cookies.set(browserCookie, token, browserCookieOptions);
}
