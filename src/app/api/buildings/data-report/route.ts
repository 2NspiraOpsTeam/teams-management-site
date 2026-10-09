import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get('q') || ''; // SQL fragment (sanitized)
    
    const db = (getRequestContext().env as { DB?: D1Database }).DB;
    if (!db) {
      return NextResponse.json({ error: 'D1 binding not available' }, { status: 503 });
    }
    
    // Report total records and publication states
    const stateCounts = await db.prepare(`
      SELECT publication_state, COUNT(*) as count 
      FROM buildings 
      GROUP BY publication_state 
      ORDER BY publication_state
    `).all();
    
    // Get specific property details
    const targetProperties = ['166 E 118th St', '170 E 118th St', '3425 East Tremont Ave'];
    const targetRecords = await Promise.all(
      targetProperties.map(name => 
        db.prepare(`
          SELECT id, name, slug, address_json
          FROM buildings 
          WHERE name = ? 
            AND (publication_state = 'published' OR publication_state = 'draft')
        `).bind(name).first()
      )
    );
    
    // Get count by state
    const statesCount = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN publication_state = 'published' THEN 1 ELSE 0 END) as published_count,
        SUM(CASE WHEN publication_state = 'draft' THEN 1 ELSE 0 END) as draft_count
      FROM buildings
    `).first<{ total: number; published_count: number; draft_count: number }>();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: 'teams-database-dev',
      stateCounts: stateCounts.results,
      targetPropertiesCount: targetProperties.length,
      targetRecords: targetRecords.filter(r => r !== null),
      totalBuildings: statesCount?.total ?? 0,
      publishedCount: statesCount?.published_count ?? 0,
      draftCount: statesCount?.draft_count ?? 0
    });
    
  } catch (error) {
    console.error('Data report error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to query D1',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
