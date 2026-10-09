import { NextResponse } from 'next/server';

interface Env {
  DB: D1Database;
}

export async function GET(request: Request, env: Env) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get('q') || ''; // SQL fragment (sanitized)
    
    if (!env.DB) {
      return NextResponse.json({ error: 'D1 binding not available' }, { status: 503 });
    }
    
    // Report total records and publication states
    const stateCounts = await env.DB.prepare(`
      SELECT publication_state, COUNT(*) as count 
      FROM buildings 
      GROUP BY publication_state 
      ORDER BY name
    `).all();
    
    // Get specific property details
    const targetProperties = ['166 E 118th St', '170 E 118th St', '3425 East Tremont Ave'];
    const targetRecords = await Promise.all(
      targetProperties.map(name => 
        env.DB.prepare(`
          SELECT id, name, slug, address_json, latitude, longitude, geocode_status
          FROM buildings 
          WHERE name = ? 
            AND (publication_state = 'published' OR publication_state = 'draft')
        `).bind(name).first()
      )
    );
    
    // Get count by state
    const statesCount = await env.DB.prepare(`
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
      totalBuildings: statesCount.total,
      publishedCount: statesCount.published_count,
      draftCount: statesCount.draft_count
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
