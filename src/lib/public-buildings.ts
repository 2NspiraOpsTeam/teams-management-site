import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
import type { BuildingPublic } from './database.types';
import { parsePublicBuildingRow, type PublicBuildingRow } from './public-building-projection';

function database() {
  const db = (getRequestContext().env as { DB?: D1Database }).DB;
  if (!db) throw new Error('Teams D1 binding is unavailable');
  return db;
}

// Existing seed descriptions/amenities have not been approved by Teams.
// Keep portfolio identity/location visible, but suppress unreviewed copy.
const publicColumns = "id, name, slug, NULL AS description_public, address_json, latitude, longitude, geocode_status, map_verified, '[]' AS amenities_public, '[]' AS gallery, publication_state, created_at, updated_at";

export async function listPublicBuildings(): Promise<BuildingPublic[]> {
  const result = await database().prepare(`SELECT ${publicColumns} FROM buildings WHERE publication_state = ? ORDER BY name`).bind('published').all<PublicBuildingRow>();
  return result.results.map(parsePublicBuildingRow);
}

export async function getPublicBuilding(slug: string): Promise<BuildingPublic | null> {
  const row = await database().prepare(`SELECT ${publicColumns} FROM buildings WHERE slug = ? AND publication_state = ?`).bind(slug, 'published').first<PublicBuildingRow>();
  return row ? parsePublicBuildingRow(row) : null;
}

// Preview addresses remain a curated fixture; only independently verified map
// metadata is joined from Teams D1. Draft copy/media never flows into preview.
export async function previewBuildingsWithVerifiedLocations(preview: BuildingPublic[]): Promise<BuildingPublic[]> {
  const rows = await database().prepare("SELECT slug, latitude, longitude, geocode_status, map_verified FROM buildings WHERE map_verified = 1 AND geocode_status = 'verified' AND latitude IS NOT NULL AND longitude IS NOT NULL").all<{slug:string;latitude:number;longitude:number;geocode_status:'verified';map_verified:number}>();
  const bySlug = new Map(rows.results.map(row => [row.slug, row]));
  return preview.map(building => {
    const row = bySlug.get(building.slug);
    return row ? { ...building, latitude: row.latitude, longitude: row.longitude, geocode_status: row.geocode_status, map_verified: row.map_verified === 1 } : building;
  });
}
