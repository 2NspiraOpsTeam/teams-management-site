-- Migration: Initialize teams-database-dev schema
-- Add lat/lng fields additively (nullable) without modifying existing columns
-- This migration preserves all existing building IDs, slugs, and publication_state values

-- Create buildings table if not exists (or use existing with migrations)
CREATE TABLE IF NOT EXISTS buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address_json TEXT NOT NULL DEFAULT '{}',
  description_public TEXT,
  amenities_public TEXT NOT NULL DEFAULT '[]',
  gallery TEXT NOT NULL DEFAULT '[]',
  publication_state TEXT NOT NULL DEFAULT 'draft' CHECK (publication_state IN ('draft','internal_review','published','archived')),
  latitude REAL, -- Additively added: nullable for geocoding status
  longitude REAL, -- Additively added: nullable for geocoding status  
  geocode_status TEXT, -- Additively added: 'verified'|'pending'|'failed'|NULL
  map_verified INTEGER DEFAULT 0, -- Optional flag for verified coordinate accuracy
  management_context TEXT DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_buildings_slug ON buildings(slug);
CREATE INDEX IF NOT EXISTS idx_buildings_publication_state ON buildings(publication_state);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);
CREATE INDEX IF NOT EXISTS idx_buildings_latitude_longitude ON buildings(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add columns additively if they don't exist
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS latitude REAL;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS longitude REAL;
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS geocode_status TEXT DEFAULT NULL CHECK (geocode_status IN ('verified','pending','failed'));
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS map_verified INTEGER DEFAULT 0 CHECK (map_verified IN (0,1));

-- Note: In preview/development, records may be empty or have draft publication_state
-- This migration ensures schema is ready for populated data in production
