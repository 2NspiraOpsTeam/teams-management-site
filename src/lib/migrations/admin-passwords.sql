-- Additive optional passwords for existing active Admin identities only.
-- admin_passwords: private credential store; never join into generic API DTOs.
CREATE TABLE IF NOT EXISTS admin_passwords (
 email TEXT PRIMARY KEY COLLATE NOCASE REFERENCES admin_identities(email),
 password_hash TEXT NOT NULL,
 version TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Distinguishes password sessions from verified email-code sessions for step-up.
CREATE TABLE IF NOT EXISTS admin_password_sessions (
 token_hash TEXT PRIMARY KEY REFERENCES admin_sessions(token_hash) ON DELETE CASCADE
);
