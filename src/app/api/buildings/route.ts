import { NextResponse } from 'next/server';
import { listPublicBuildings, getPublicBuilding, type BuildingPublic } from '@/lib/public-buildings';

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

/** GET /api/buildings/{slug} - Single building detail */
export async function GET(
  req: Request,
  { params }: { params: { slug?: string } }
) {
  if (!params.slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
  }
  
  try {
    const building = await getPublicBuilding(params.slug);
    
    if (!building) {
      return NextResponse.json(
        { 
          error: 'Building not found', 
          slug: params.slug,
          details: 'No published building with this slug exists in teams-database-dev'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ building });
    
  } catch (error) {
    console.error('Building detail failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load building',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
