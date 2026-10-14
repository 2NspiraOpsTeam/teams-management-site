import { NextResponse } from 'next/server';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';

/** Internal inventory diagnostics are available only to an authenticated Admin. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  try {
    const counts = await admin.db.prepare('SELECT publication_state, COUNT(*) AS count FROM buildings GROUP BY publication_state ORDER BY publication_state').all();
    return NextResponse.json({ stateCounts: counts.results }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Report temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
