import { previewPortfolio } from './preview-portfolio';
import { publicDataCache } from './public-data-cache';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import type { BuildingPublic } from './database.types';
import { parsePublicBuildingRow, type PublicBuildingRow } from './public-building-projection';

function database() {
  const db = (getCloudflareContext().env as { DB?: D1Database }).DB;
  if (!db) throw new Error('Teams D1 binding is unavailable');
  return db;
}

// Existing seed descriptions/amenities have not been approved by Teams.
// Keep portfolio identity/location visible, but suppress unreviewed copy.
const publicColumns = "id, name, slug, NULL AS description_public, address_json, latitude, longitude, geocode_status, map_verified, '[]' AS amenities_public, '[]' AS gallery, publication_state, created_at, updated_at";

export async function listPublicBuildings(): Promise<BuildingPublic[]> {
  return publicDataCache('published-buildings',async()=>{
  const result = await database().prepare(`SELECT ${publicColumns} FROM buildings WHERE publication_state = ? ORDER BY name`).bind('published').all<PublicBuildingRow>();
  return result.results.map(parsePublicBuildingRow);
  });
}

export async function getPublicBuilding(slug: string): Promise<BuildingPublic | null> {
  const row = await database().prepare(`SELECT ${publicColumns} FROM buildings WHERE slug = ? AND publication_state = ?`).bind(slug, 'published').first<PublicBuildingRow>();
  return row ? parsePublicBuildingRow(row) : null;
}


/** Preserve preview-only publication scope, while taking mailing addresses from canonical records. */
export async function canonicalPreviewBuildings(fixtures: BuildingPublic[]): Promise<BuildingPublic[]> {
  const rows = await publicDataCache('preview-addresses',async()=> (await database().prepare(`SELECT slug,name,address_json FROM buildings WHERE publication_state!='archived' AND slug IN (${previewPortfolio.map(()=>'?').join(',')})`).bind(...previewPortfolio.map(b=>b.slug)).all<{slug:string;name:string;address_json:string}>()).results);
  const canonical = new Map(rows.map(row => [row.slug, {name:row.name,address:JSON.parse(row.address_json) as BuildingPublic['address']}]));
  return fixtures.map(building => ({ ...building, ...canonical.get(building.slug) }));
}
