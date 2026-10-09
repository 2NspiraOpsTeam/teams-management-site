import { NextResponse } from 'next/server';
import { audit, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin || !sameOrigin(request)) return unauthorized();
  const { id } = await params;
  const before = await admin.db.prepare('SELECT id, latitude, longitude, geocode_status, map_verified FROM buildings WHERE id = ? AND publication_state != ?').bind(id, 'archived').first<{id:string;latitude:number|null;longitude:number|null;geocode_status:string|null;map_verified:number}>();
  if (!before) return NextResponse.json({ error: 'Building not found' }, { status: 404 });
  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
  const clearing = input.latitude === null && input.longitude === null;
  const latitude = clearing ? null : Number(input.latitude);
  const longitude = clearing ? null : Number(input.longitude);
  const valid = clearing || (input.latitude !== '' && input.longitude !== '' && input.latitude !== null && input.longitude !== null &&
    typeof latitude === 'number' && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && typeof longitude === 'number' && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180);
  if (!valid) return NextResponse.json({ error: 'Enter a complete latitude and longitude within valid ranges.' }, { status: 400 });
  const status = clearing ? null : String(input.geocode_status ?? 'pending');
  const verified = input.map_verified === true;
  if ((!clearing && !['pending', 'failed', 'verified'].includes(status!)) || (verified && (clearing || status !== 'verified'))) return NextResponse.json({ error: 'Coordinates must be reviewed before public verification.' }, { status: 400 });
  const after = { latitude, longitude, geocode_status: status, map_verified: verified ? 1 : 0 };
  await admin.db.prepare("UPDATE buildings SET latitude=?, longitude=?, geocode_status=?, map_verified=?, updated_at=datetime('now') WHERE id=?").bind(latitude, longitude, status, after.map_verified, id).run();
  await audit(admin.db, admin.email, 'updated', 'building', id, before, after);
  return NextResponse.json(after, { headers: { 'Cache-Control': 'no-store' } });
}
