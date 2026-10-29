-- Discovery credential only: this token never authenticates an admin session.
CREATE TABLE IF NOT EXISTS admin_remembered_browsers (
 token_hash TEXT PRIMARY KEY,
 email TEXT NOT NULL COLLATE NOCASE REFERENCES admin_identities(email),
 expires_at TEXT NOT NULL,
 revoked_at TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS admin_remembered_browsers_email ON admin_remembered_browsers(email);
