-- Teams Management D1 Database Schema (Local Development)
CREATE TABLE IF NOT EXISTS buildings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_public TEXT,
    address_json TEXT NOT NULL,
    amenities_public JSON DEFAULT '[]',
    gallery JSON DEFAULT '[]',
    publication_state TEXT DEFAULT 'draft',
    management_context JSON DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_identifier TEXT NOT NULL,
    floor_number INTEGER NOT NULL,
    layout_id TEXT REFERENCES layouts(id),
    status TEXT DEFAULT 'available_internal',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS layouts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    specifications JSON DEFAULT '{}',
    dimensions_json TEXT,
    asset_version INTEGER DEFAULT 1,
    reused_by_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,
    storage_key TEXT UNIQUE NOT NULL,
    file_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    checksum TEXT,
    provenance TEXT,
    visibility TEXT DEFAULT 'public',
    uploaded_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media_assignments (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    building_id TEXT REFERENCES buildings(id),
    unit_id TEXT REFERENCES units(id),
    is_cover BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    alt_text TEXT,
    caption TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_info_hash TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    routing_destination TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    record_before_json TEXT,
    record_after_json TEXT,
    user_actor TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_buildings_state ON buildings(publication_state);
CREATE INDEX IF NOT EXISTS idx_units_status ON units(building_id, status);
CREATE INDEX IF NOT EXISTS idx_media_storage ON media_assets(storage_key);
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at);
