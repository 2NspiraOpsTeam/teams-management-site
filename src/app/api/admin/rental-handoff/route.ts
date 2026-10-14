import { NextResponse } from 'next/server';
import { audit, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';
const reply = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const setting = await admin.db.prepare("SELECT kind,label,destination,updated_at FROM rental_handoff_settings WHERE id='primary'").first();
  return reply(setting || { kind: 'none', label: '', destination: '' }, 200);
}
export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  if (!sameOrigin(request) || !request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Invalid request' }, 403);
  const input = await request.json() as { kind?: string; label?: string; destination?: string };
  const kind = input.kind || 'none';
  const label = typeof input.label === 'string' ? input.label.trim() : '';
  const destination = typeof input.destination === 'string' ? input.destination.trim() : '';
  if (!['none','url','email','phone'].includes(kind) || label.length > 80 || destination.length > 500 || /[\x00-\x1f]/.test(label + destination)) return reply({ error: 'Check the broker destination' }, 400);
  if (kind !== 'none' && (!label || !destination)) return reply({ error: 'Add a link label and destination' }, 400);
  if (kind === 'url') {
    try { const url = new URL(destination); if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.)/.test(url.hostname)) return reply({ error: 'Use a public HTTPS URL' }, 400); }
    catch { return reply({ error: 'Use a valid HTTPS URL' }, 400); }
  }
  if (kind === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)) return reply({ error: 'Use a valid broker email' }, 400);
  if (kind === 'phone' && !/^\+?[\d\s().-]{7,30}$/.test(destination)) return reply({ error: 'Use a valid broker phone' }, 400);
  const before = await admin.db.prepare("SELECT kind,label,destination FROM rental_handoff_settings WHERE id='primary'").first();
  const after = { kind, label: kind === 'none' ? null : label, destination: kind === 'none' ? null : destination };
  await admin.db.prepare("INSERT INTO rental_handoff_settings (id,kind,label,destination,updated_by) VALUES ('primary',?,?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,label=excluded.label,destination=excluded.destination,updated_by=excluded.updated_by,updated_at=datetime('now')").bind(after.kind, after.label, after.destination, admin.email).run();
  await audit(admin.db, admin.email, 'update', 'rental_handoff_settings', 'primary', before, after);
  return reply(after, 200);
}
