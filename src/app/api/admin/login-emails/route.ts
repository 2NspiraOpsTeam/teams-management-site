import { NextResponse } from 'next/server';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'nodejs';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const params = new URL(request.url).searchParams;
  const portal = params.get('portal') || 'all';
  const before = params.get('before') || '';
  if (!['all','admin','tenant'].includes(portal) || (before && !/^[0-9a-f-]{36}$/.test(before))) return reply({ error: 'Invalid filter.' }, 400);
  try {
    // Existing entity index bounds this query to login-email records; no per-row queries.
    const rows = await admin.db.prepare(`SELECT id,created_at,record_after_json FROM audit_log
      WHERE entity_type='login_email' AND (?='all' OR entity_id=?)
      AND (?='' OR rowid < (SELECT rowid FROM audit_log WHERE id=? AND entity_type='login_email'))
      ORDER BY rowid DESC LIMIT 51`).bind(portal, portal, before, before).all<{id:string;created_at:string;record_after_json:string}>();
    const items = rows.results.slice(0,50).map(row => {
      const data = JSON.parse(row.record_after_json);
      return { id: row.id, requestedAt: row.created_at.replace(' ', 'T') + 'Z', recipient: data.recipient, portal: data.portal, status: data.status, sentAt: data.sentAt || null };
    });
    return reply({ items, next: rows.results.length > 50 ? items.at(-1)?.id : null });
  } catch { return reply({ error: 'Login email history is unavailable. Please try again.' }, 503); }
}
