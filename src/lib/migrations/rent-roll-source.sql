-- Source-backed apartment facts. Does not create leases, identities or assignments.
-- Text columns retain status codes, legal-rent codes, month-to-month and commercial descriptions.
CREATE TABLE IF NOT EXISTS operations_rent_roll_source (
 unit_id TEXT PRIMARY KEY NOT NULL REFERENCES units(id),
 source_sha256 TEXT NOT NULL, source_sheet TEXT NOT NULL, source_row INTEGER NOT NULL CHECK(source_row>0),
 source_period TEXT NOT NULL, tenant_name TEXT, status_code TEXT, square_footage TEXT, bedrooms TEXT,
 lease_expiration TEXT, security TEXT, legal_rent TEXT, rent TEXT,
 source_values_json TEXT NOT NULL,
 imported_by TEXT NOT NULL, imported_at TEXT NOT NULL DEFAULT(datetime('now')),
 UNIQUE(source_sha256,source_sheet,source_row)
);

CREATE TABLE IF NOT EXISTS operations_renewal_tracking (
 lease_id TEXT PRIMARY KEY REFERENCES operations_leases(id),
 status TEXT NOT NULL DEFAULT 'not_started',
 staff_email TEXT REFERENCES admin_identities(email), last_contact_date TEXT, follow_up_date TEXT,
 internal_notes TEXT NOT NULL DEFAULT '', completed_at TEXT,
 revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0), updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS operations_renewal_followup ON operations_renewal_tracking(follow_up_date,status,lease_id);
CREATE TABLE IF NOT EXISTS operations_renewal_settings (
 id TEXT PRIMARY KEY CHECK(id='default'), settings_json TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE INDEX IF NOT EXISTS operations_renewal_successor ON operations_leases(predecessor_id,status,lease_start,lease_end);

CREATE TRIGGER IF NOT EXISTS operations_rent_roll_source_audit AFTER INSERT ON operations_rent_roll_source BEGIN
 INSERT INTO audit_log(id,action,entity_type,entity_id,record_after_json,user_actor) VALUES(
 'rentroll-source:'||NEW.source_sha256||':'||NEW.source_sheet||':'||NEW.source_row,
 'imported','operations_rent_roll_source',NEW.unit_id,
 json_object('source_sha256',NEW.source_sha256,'source_sheet',NEW.source_sheet,'source_row',NEW.source_row,'source_period',NEW.source_period,'tenant_name',NEW.tenant_name,'status',NEW.status_code,'square_footage',NEW.square_footage,'bedrooms',NEW.bedrooms,'lease_expiration',NEW.lease_expiration,'security',NEW.security,'legal_rent',NEW.legal_rent,'rent',NEW.rent),NEW.imported_by);
END;
