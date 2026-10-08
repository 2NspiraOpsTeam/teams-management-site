-- Private inquiry payload. The existing inquiries row remains the status/audit record.
-- Public routes never select from this table. No existing row or column is changed.
CREATE TABLE IF NOT EXISTS inquiry_details (
  inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  building_id TEXT REFERENCES buildings(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inquiry_details_building ON inquiry_details(building_id);
