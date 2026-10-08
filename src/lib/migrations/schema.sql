-- Teams Management D1 Database Schema
-- Isolated environment - not shared with 2Nspira resources

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_public TEXT,
    address_json TEXT NOT NULL,
    amenities_public JSON,
    gallery JSON DEFAULT '[]',
    publication_state TEXT DEFAULT 'draft',
    management_context JSON,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Units table
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

-- Layouts table (reusable templates)
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

-- Media assets table
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

-- Media assignments (link assets to buildings/units)
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

-- Inquiries table
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

-- Audit log for all operations
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_buildings_public_state ON buildings(publication_state);
CREATE INDEX IF NOT EXISTS idx_units_building_status ON units(building_id, status);
CREATE INDEX IF NOT EXISTS idx_media_assets_storage ON media_assets(storage_key);
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);

-- Comments for schema documentation (will be stripped on execution)
-- Buildings: Represents property buildings with public-facing information.
-- Units: Individual units within a building, linked via building_id.
-- Layouts: Reusable floor plan templates that can be applied to multiple units.
-- MediaAssets: Stored media files in R2 with metadata tracking.
-- MediaAssignments: Maps media assets to specific buildings or units.
-- Inquiries: Contact form submissions with routing and status tracking.
-- AuditLog: Immutable log of all database operations for compliance.
