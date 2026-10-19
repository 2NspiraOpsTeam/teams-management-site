-- Additive only. Defaults stay in the approved source until an admin saves a draft.
CREATE TABLE IF NOT EXISTS website_content (
  page_id TEXT PRIMARY KEY,
  revision TEXT NOT NULL,
  draft_json TEXT NOT NULL CHECK(json_valid(draft_json)),
  published_json TEXT NOT NULL CHECK(json_valid(published_json)),
  previous_json TEXT CHECK(previous_json IS NULL OR json_valid(previous_json)),
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT NOT NULL
);
