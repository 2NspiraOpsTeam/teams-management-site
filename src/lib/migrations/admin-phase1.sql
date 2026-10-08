-- Additive Phase 1 authorization and notification metadata. No identity is seeded.
CREATE TABLE IF NOT EXISTS admin_identities (email TEXT PRIMARY KEY COLLATE NOCASE, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL REFERENCES admin_identities(email), expires_at TEXT NOT NULL, revoked_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_admin_sessions_email ON admin_sessions(email, expires_at);
CREATE TABLE IF NOT EXISTS inquiry_notifications (inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id), state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sent','failed','unknown')), destination TEXT, attempts INTEGER NOT NULL DEFAULT 0, last_attempt_at TEXT, provider_id TEXT, error_code TEXT);
