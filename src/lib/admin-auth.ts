import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
const cookieName = 'teams_admin_session';
const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
export { unauthorized };

export function adminEnv() {
  return getRequestContext().env as { DB?: D1Database; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; GOOGLE_REFRESH_TOKEN?: string; ADMIN_LOGIN_FROM_EMAIL?: string; ADMIN_OTP_PEPPER?: string };
}
export function adminDb(): D1Database {
  const db = adminEnv().DB;
  if (!db) throw new Error('D1 unavailable');
  return db;
}
async function hash(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export { hash, cookieName };

export async function activeAdmin(email: string) {
  return !!(await adminDb().prepare('SELECT email FROM admin_identities WHERE email = ? AND active = 1').bind(email).first());
}
export async function currentAdmin(): Promise<string | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await adminDb().prepare("SELECT s.email FROM admin_sessions s JOIN admin_identities a ON a.email = s.email WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > datetime('now') AND a.active = 1").bind(await hash(token)).first<{ email: string }>();
  return row?.email ?? null;
}
export async function requireAdmin() {
  const email = await currentAdmin();
  return email ? { email, db: adminDb() } : null;
}
export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
export async function audit(db: D1Database, actor: string, action: string, entityType: string, entityId: string, before: unknown, after: unknown) {
  await db.prepare('INSERT INTO audit_log (id, action, entity_type, entity_id, record_before_json, record_after_json, user_actor) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(crypto.randomUUID(), action, entityType, entityId, before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, actor).run();
}
