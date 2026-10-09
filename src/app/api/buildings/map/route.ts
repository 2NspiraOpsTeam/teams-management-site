import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
import { previewPortfolioEnabled } from '@/lib/preview-portfolio';
export const runtime = 'edge';
export async function GET() {
  const db = (getRequestContext().env as { DB?: D1Database }).DB;
  if (!db) return NextResponse.json({ error: 'Map temporarily unavailable' }, { status: 503 });
  const where = previewPortfolioEnabled ? '' : "AND publication_state = 'published'";
  const result = await db.prepare(`SELECT slug, latitude, longitude FROM buildings WHERE map_verified = 1 AND geocode_status = 'verified' AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180 ${where}`).all<{slug:string;latitude:number;longitude:number}>();
  return NextResponse.json(result.results, { headers: { 'Cache-Control': 'no-store' } });
}
