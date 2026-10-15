-- Private manual uploads. No scheduler, external storage, portal grants or sync.
CREATE TABLE tenant_upload_configuration (
 id TEXT PRIMARY KEY CHECK(id='teams-preview'), database_id TEXT NOT NULL,
 backup_sha256 TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN(0,1)),
 verified_at TEXT NOT NULL, verified_by TEXT NOT NULL
);
CREATE TABLE tenant_uploads (
 id TEXT PRIMARY KEY, file_name TEXT NOT NULL, parser_version TEXT NOT NULL,
 rows_json TEXT NOT NULL, resolutions_json TEXT NOT NULL DEFAULT '{}', preview_json TEXT NOT NULL,
 plan_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
 created_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now')),
 updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);
-- Stable exact source lineage, not a name/email-based identity merge.
CREATE TABLE tenant_upload_identity_links (
 id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id) ON DELETE RESTRICT,
 source_sheet TEXT NOT NULL, source_row INTEGER NOT NULL, building_id TEXT NOT NULL REFERENCES buildings(id),
 unit_id TEXT NOT NULL REFERENCES units(id), source_name TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
