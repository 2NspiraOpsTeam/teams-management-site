import { NextResponse } from 'next/server';
import { listPublicBuildings } from '@/lib/public-buildings';

export const runtime = 'nodejs';

/**
 * GET /api/buildings - Public endpoint for building listings
 * Uses direct Teams Management D1 binding (no proxy)
 * Only returns published buildings filtered by publication_state
 */
export async function GET() {
  try {
    // Use existing public projection from teams management app
    const buildings = await listPublicBuildings();
    
    return NextResponse.json({ 
      buildings: buildings,
      count: buildings.length,
      query_timestamp: new Date().toISOString()
    });
    
  } catch {
    console.error('Public building list unavailable');
    return NextResponse.json(
      { 
        error: 'Service unavailable',
      }, 
      { status: 503 }
    );
  }
}
