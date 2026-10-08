import { NextResponse } from 'next/server';
import { listPublicBuildings } from '@/lib/public-buildings';

export const runtime = 'edge';

export async function GET() {
  try {
    const buildings = await listPublicBuildings();
    return NextResponse.json(buildings.map(({ id, name, slug }) => ({ id, name, slug })));
  } catch (error) {
    console.error('Public building list failed:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
