/**
 * Teams Management - Public Building API
 * Phase 1: Only expose approved public fields
 * 
 * Security: Server-enforced authorization ensures private unit/internal data never leaks.
 */

import { NextResponse } from 'next/server';
import { getPublicBuilding } from '@/lib/public-buildings';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const building = await getPublicBuilding(slug);
    if (!building) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(building);
  } catch {
    console.error('Building API unavailable');
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
