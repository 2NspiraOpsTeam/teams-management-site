import { cookies } from 'next/headers';
import { adminDb, adminEnv, hash } from './admin-auth';

export const tenantCookie = 'teams_tenant_session';
export const tenantDb = adminDb;
export type Tenant = { id: string; email: string; display_name: string | null };
export async function currentTenant(): Promise<Tenant | null> {
  const token = (await cookies()).get(tenantCookie)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return tenantDb().prepare("SELECT a.id,a.email,a.display_name FROM tenant_sessions s JOIN tenant_accounts a ON a.id=s.tenant_id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>datetime('now') AND a.active=1 AND EXISTS (SELECT 1 FROM tenant_assignments ta JOIN units u ON u.id=ta.unit_id AND u.building_id=ta.building_id WHERE ta.tenant_id=a.id AND ta.active=1)").bind(await hash(token)).first<Tenant>();
}
export async function tenantCodeHash(tenantId: string, code: string) {
  const pepper = adminEnv().TENANT_OTP_PEPPER;
  if (!pepper || pepper.length < 32) throw new Error('Tenant sign-in unavailable');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${tenantId}:${code}`));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export const randomHex = (n: number) => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join('');
