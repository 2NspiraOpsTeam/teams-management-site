import type { BuildingPublic } from './database.types';

export type PublicBuildingRow = Pick<BuildingPublic, 'id' | 'name' | 'slug' | 'description_public' | 'publication_state' | 'created_at' | 'updated_at'> & {
  address_json: string;
  amenities_public: string;
  gallery: string;
  latitude?: number | null;
  longitude?: number | null;
  geocode_status?: BuildingPublic['geocode_status'];
  map_verified?: number;
};

export function parsePublicBuildingRow(row: PublicBuildingRow): BuildingPublic {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description_public: row.description_public,
    address: JSON.parse(row.address_json),
    amenities_public: JSON.parse(row.amenities_public || '[]'),
    // The legacy gallery JSON has no asset-level publication proof. R2 media
    // becomes public only after an approved media_assets/assignments join.
    gallery: [],
    publication_state: row.publication_state,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    geocode_status: row.geocode_status,
    map_verified: row.map_verified === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
