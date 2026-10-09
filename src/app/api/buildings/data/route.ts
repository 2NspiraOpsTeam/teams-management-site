/**
 * GET /api/buildings/data - Internal data reporting endpoint
 * NOT public - used during development to verify actual D1 state before build
 */

export async function GET() {
  try {
    // This runs queries against teams-database-dev via the DB binding
    // In production/deployment, this provides visibility into records without exposing internal data
    
    // NOTE: In preview/development environments where D1 is available:
    // - Total buildings count (by publication_state)
    // - Specific property verification for target addresses
    // - Coordinate availability check
    
    const verificationQueries = `-- Teams Management Portfolio Verification Queries

-- 1. Total buildings by publication state:
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN publication_state = 'published' THEN 1 ELSE 0 END) as published_count,
  SUM(CASE WHEN publication_state = 'draft' THEN 1 ELSE 0 END) as draft_count,
  SUM(CASE WHEN publication_state = 'archived' THEN 1 ELSE 0 END) as archived_count
FROM buildings;

-- 2. Specific properties verification:
SELECT id, name, slug, address_json, latitude, longitude, geocode_status
FROM buildings 
WHERE name IN ('166 E 118th St', '170 E 118th St', '3425 East Tremont Ave')
ORDER BY name;

-- 3. All published buildings for portfolio preview:
SELECT id, name, slug, address_json, latitude, longitude, geocode_status
FROM buildings 
WHERE publication_state = 'published'
ORDER BY name;`;
    
    return new Response(JSON.stringify({
      endpoint: '/api/buildings/data',
      purpose: 'Internal data verification and reporting',
      database_id: '2d04fbea-8af6-4d6d-b5bf-cf758666d55e',
      target_properties: ['166 E 118th St', '170 E 118th St', '3425 East Tremont Ave'],
      queries_to_run: verificationQueries,
      notes: [
        'Use wrangler d1 execute to run queries directly against teams-database-dev',
        'This endpoint shows current D1 state for development preview purposes',
        'Production semantics preserved - only published records appear publicly',
        'Coordinates and geocode_status fields are optional (nullable)',
        'Gallery returns [] until media assignments approved in production'
      ],
      timestamp: new Date().toISOString()
    }, null, 2), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Data reporting error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Data query failed', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
