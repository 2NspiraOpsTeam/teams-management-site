-- Teams Management - D1 Database Schema (Phase 1)
-- Isolated from 2Nspira infrastructure
-- Transfer-ready, client-owned

-- Core Entities
-- Buildings (Public + Private fields)
CREATE TABLE buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_public TEXT,
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT NOT NULL,
  address_zip TEXT NOT NULL,
  neighborhood TEXT,
  amenities_public TEXT, -- JSON array
  management_team_name TEXT,
  publication_state TEXT DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

-- Units (Internal only - never public in Phase 1)
CREATE TABLE units (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  unit_identifier TEXT NOT NULL,
  floor_number INTEGER NOT NULL,
  layout_id TEXT REFERENCES layouts(id),
  status TEXT DEFAULT 'available_internal',
  square_footage REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

-- Layouts (Reusable floor plans)
CREATE TABLE layouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  window_type TEXT,
  ceiling_height_feet REAL,
  dimensions_width_feet REAL NOT NULL,
  dimensions_depth_feet REAL NOT NULL,
  asset_version INTEGER DEFAULT 1,
  reused_by_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

-- Media Assets
CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  size_bytes REAL,
  checksum TEXT NOT NULL,
  provenance TEXT NOT NULL,
  visibility TEXT DEFAULT 'private',
  uploaded_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

-- Media Assignments
CREATE TABLE media_assignments (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  building_id TEXT REFERENCES buildings(id),
  unit_id TEXT REFERENCES units(id),
  layout_id TEXT REFERENCES layouts(id),
  is_cover INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  caption TEXT,
  alt_text TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

-- Inquiries
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_info_hash TEXT NOT NULL,
  status TEXT DEFAULT 'submitted',
  routing_destination TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc')),
  resolved_at TEXT
);

-- Users & Roles
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  active_state TEXT DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  permissions TEXT NOT NULL
);

-- User assignments (many-to-many)
CREATE TABLE user_assignments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  scope_type TEXT NOT NULL,
  resource_ids TEXT,
  granted_at TEXT NOT NULL DEFAULT (datetime('now','utc'))
);

-- Historical Events (Audit Trail)
CREATE TABLE historical_events (
  event_id TEXT PRIMARY KEY,
  schema_version INTEGER DEFAULT 1,
  timestamp TEXT NOT NULL,
  client_scope TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  change_type TEXT NOT NULL,
  actor_source TEXT,
  previous_values TEXT,
  new_values TEXT
);

-- Indexes for common queries
CREATE INDEX idx_buildings_published ON buildings(publication_state, updated_at DESC) WHERE publication_state='published';
CREATE INDEX idx_units_building ON units(building_id, status);
CREATE INDEX idx_media_visibility ON media_assets(visibility);
CREATE INDEX idx_inquiries_status ON inquiries(status, created_at DESC);
