-- Prerequisite compatibility correction, NOT an additive-only migration.
-- tenant_accounts is the existing tenant entity and all IDs/links are preserved.
-- SQLite cannot drop NOT NULL additively. Run ONLY in a validated atomic migration
-- with deferred foreign keys; export and check original schema/indexes first.
-- No remote application is authorized by this file.
PRAGMA defer_foreign_keys=ON;
CREATE TABLE tenant_identity_preserved AS SELECT id,email,display_name,active,created_at FROM tenant_accounts;
CREATE TABLE tenant_accounts_nullable (
 id TEXT PRIMARY KEY, email TEXT UNIQUE COLLATE NOCASE, display_name TEXT,
 active INTEGER NOT NULL DEFAULT 0 CHECK(active IN(0,1)),
 created_at TEXT NOT NULL DEFAULT(datetime('now')),
 CHECK(active=0 OR (email IS NOT NULL AND length(trim(email))>0))
);
DROP TABLE tenant_accounts;
ALTER TABLE tenant_accounts_nullable RENAME TO tenant_accounts;
INSERT INTO tenant_accounts(id,email,display_name,active,created_at) SELECT * FROM tenant_identity_preserved;
DROP TABLE tenant_identity_preserved;
CREATE INDEX operations_tenant_name ON tenant_accounts(display_name COLLATE NOCASE,id);
