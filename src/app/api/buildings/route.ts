import { NextResponse } from 'next/server';
import { listPublicBuildings } from '@/lib/public-buildings';

export const runtime = 'edge';

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
      source: 'teams-database-dev',
      database_id: '2d04fbea-8af6-4d6d-b5bf-cf758666d55e',
      query_timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Public building list failed:', error);
    return NextResponse.json(
      { 
        error: 'Service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to query buildings from teams-database-dev'
      }, 
      { status: 503 }
    );
  }
}
