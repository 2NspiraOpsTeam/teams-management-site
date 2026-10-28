-- Metadata only. Admin-only links; no file bodies, tokens, public sharing or tenant grants.
CREATE TABLE IF NOT EXISTS operations_lease_links (
 id TEXT PRIMARY KEY, lease_id TEXT NOT NULL REFERENCES operations_leases(id),
 drive_id TEXT NOT NULL, item_id TEXT NOT NULL, file_name TEXT NOT NULL,
 web_url TEXT NOT NULL, created_by TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now')),
 UNIQUE(lease_id,drive_id,item_id)
);
CREATE INDEX IF NOT EXISTS operations_lease_links_lease ON operations_lease_links(lease_id,created_at);
