-- Additive app-native Admin authentication; no identity seeding.
CREATE TABLE IF NOT EXISTS admin_login_codes (id TEXT PRIMARY KEY, email TEXT NOT NULL REFERENCES admin_identities(email), code_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT, attempt_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_admin_login_codes_email ON admin_login_codes(email, created_at);
CREATE TABLE IF NOT EXISTS admin_login_throttle (key_hash TEXT PRIMARY KEY, window_start TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0);
