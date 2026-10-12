-- Additive rental-inquiry context; no applicant documents or application records.
ALTER TABLE inquiry_details ADD COLUMN property_interest TEXT;
CREATE TABLE IF NOT EXISTS rental_handoff_settings (
  id TEXT PRIMARY KEY CHECK(id = 'primary'),
  kind TEXT NOT NULL DEFAULT 'none' CHECK(kind IN ('none','url','email','phone')),
  label TEXT,
  destination TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
INSERT OR IGNORE INTO rental_handoff_settings (id,kind) VALUES ('primary','none');
