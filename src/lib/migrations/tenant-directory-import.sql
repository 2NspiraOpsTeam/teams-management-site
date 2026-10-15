-- Additive directory/import schema; depends on property-operations.sql and the
-- separately reviewed nullable-identity prerequisite. Existing IDs remain intact.
ALTER TABLE operations_tenants ADD COLUMN directory_status TEXT NOT NULL DEFAULT 'active' CHECK(directory_status IN('active','inactive','unknown'));
ALTER TABLE operations_tenants ADD COLUMN updated_at TEXT;
ALTER TABLE operations_units ADD COLUMN unit_type TEXT NOT NULL DEFAULT 'unknown' CHECK(unit_type IN('residential','commercial','unknown'));
ALTER TABLE operations_assignment_profiles ADD COLUMN relationship_type TEXT NOT NULL DEFAULT 'unknown' CHECK(relationship_type IN('occupant','business','contact','unknown'));
ALTER TABLE operations_assignment_profiles ADD COLUMN assignment_status TEXT NOT NULL DEFAULT 'unknown' CHECK(assignment_status IN('proposed','current','historical','unknown'));
CREATE TABLE tenant_contacts (
 id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id) ON DELETE RESTRICT,
 contact_type TEXT NOT NULL CHECK(contact_type IN('phone','email')), label TEXT NOT NULL DEFAULT 'unknown',
 value_raw TEXT NOT NULL CHECK(length(trim(value_raw))>0), value_normalized TEXT, country_code TEXT, extension TEXT,
 validation_state TEXT NOT NULL DEFAULT 'unreviewed' CHECK(validation_state IN('unreviewed','syntax_valid','invalid','verified')),
 is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN(0,1)), verified_at TEXT,
 archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN(0,1)), revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0),
 created_at TEXT NOT NULL DEFAULT(datetime('now')), updated_at TEXT NOT NULL DEFAULT(datetime('now')),
 CHECK(validation_state!='verified' OR verified_at IS NOT NULL)
);
CREATE INDEX tenant_contacts_owner ON tenant_contacts(tenant_id,contact_type,archived);
CREATE UNIQUE INDEX tenant_contacts_primary ON tenant_contacts(tenant_id,contact_type) WHERE is_primary=1 AND archived=0;
CREATE UNIQUE INDEX tenant_contacts_exact ON tenant_contacts(tenant_id,contact_type,value_raw) WHERE archived=0;
CREATE INDEX directory_assignments_unit ON tenant_assignments(unit_id,active,tenant_id);
CREATE TABLE tenant_import_batches (
 id TEXT PRIMARY KEY, source_sha256 TEXT NOT NULL, approved_package_sha256 TEXT NOT NULL,
 parser_version TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN('validated','committing','committed','failed','undone')),
 requested_by TEXT NOT NULL, approved_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now')), committed_at TEXT, counts_json TEXT NOT NULL,
 UNIQUE(source_sha256,approved_package_sha256,parser_version)
);
CREATE TABLE tenant_import_items (
 id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES tenant_import_batches(id) ON DELETE RESTRICT,
 record_id TEXT NOT NULL, source_sha256 TEXT NOT NULL, source_sheet TEXT NOT NULL, source_row INTEGER NOT NULL CHECK(source_row>0),
 source_cell TEXT NOT NULL DEFAULT '@row', tenant_id TEXT REFERENCES tenant_accounts(id) ON DELETE RESTRICT,
 unit_id TEXT REFERENCES units(id) ON DELETE RESTRICT, contact_id TEXT REFERENCES tenant_contacts(id) ON DELETE RESTRICT,
 resolved_tenant_id TEXT, resolved_unit_id TEXT, resolved_contact_id TEXT,
 outcome TEXT NOT NULL CHECK(outcome IN('create','update','link','exclude','hold')),
 review_reason TEXT NOT NULL, reviewed_by TEXT NOT NULL, reviewed_at TEXT NOT NULL,
 UNIQUE(source_sha256,record_id,source_cell), CHECK(length(source_cell)>0)
);
CREATE INDEX tenant_import_record_mapping ON tenant_import_items(source_sha256,record_id);
CREATE TABLE tenant_import_changes (
 id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES tenant_import_batches(id) ON DELETE RESTRICT,
 entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, operation TEXT NOT NULL CHECK(operation IN('create','update','link')),
 before_json TEXT, after_json TEXT NOT NULL, expected_version INTEGER, actor_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
-- Exactly one tenant per source record, including contact provenance rows.
CREATE TRIGGER tenant_import_consistent_mapping BEFORE INSERT ON tenant_import_items
WHEN NEW.tenant_id IS NOT NULL AND EXISTS(SELECT 1 FROM tenant_import_items i WHERE i.source_sha256=NEW.source_sha256 AND i.record_id=NEW.record_id AND COALESCE(i.tenant_id,i.resolved_tenant_id) IS NOT NULL AND COALESCE(i.tenant_id,i.resolved_tenant_id)!=NEW.tenant_id)
BEGIN SELECT RAISE(ABORT,'source record already resolves to another tenant'); END;
CREATE TRIGGER tenant_import_consistent_mapping_update BEFORE UPDATE OF tenant_id,record_id,source_sha256 ON tenant_import_items
WHEN NEW.tenant_id IS NOT NULL AND EXISTS(SELECT 1 FROM tenant_import_items i WHERE i.id!=NEW.id AND i.source_sha256=NEW.source_sha256 AND i.record_id=NEW.record_id AND COALESCE(i.tenant_id,i.resolved_tenant_id) IS NOT NULL AND COALESCE(i.tenant_id,i.resolved_tenant_id)!=NEW.tenant_id)
BEGIN SELECT RAISE(ABORT,'source record already resolves to another tenant'); END;
CREATE TRIGGER tenant_import_contact_owner BEFORE INSERT ON tenant_import_items
WHEN NEW.contact_id IS NOT NULL AND (NEW.tenant_id IS NULL OR NOT EXISTS(SELECT 1 FROM tenant_contacts c WHERE c.id=NEW.contact_id AND c.tenant_id=NEW.tenant_id))
BEGIN SELECT RAISE(ABORT,'contact provenance owner mismatch'); END;
-- Empty outside a batch: a failed optimistic read-set assertion aborts DB.batch.
CREATE TABLE tenant_import_guards(id TEXT PRIMARY KEY, ok INTEGER NOT NULL CHECK(ok=1));
CREATE TABLE tenant_import_undo_records(
 batch_id TEXT NOT NULL REFERENCES tenant_import_batches(id) ON DELETE RESTRICT,
 record_id TEXT NOT NULL, actor_id TEXT NOT NULL, changes_json TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now')), PRIMARY KEY(batch_id,record_id)
);
CREATE TABLE tenant_import_change_records(
 batch_id TEXT NOT NULL REFERENCES tenant_import_batches(id) ON DELETE RESTRICT,
 entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,record_id TEXT NOT NULL,
 PRIMARY KEY(batch_id,entity_type,entity_id)
);

-- Historical resolved IDs are retained even when undo clears live FK pointers.
CREATE TRIGGER tenant_import_keep_resolved AFTER INSERT ON tenant_import_items
BEGIN UPDATE tenant_import_items SET resolved_tenant_id=NEW.tenant_id,resolved_unit_id=NEW.unit_id,resolved_contact_id=NEW.contact_id WHERE id=NEW.id; END;
CREATE TRIGGER tenant_import_resolved_immutable BEFORE UPDATE OF resolved_tenant_id,resolved_unit_id,resolved_contact_id ON tenant_import_items
WHEN (OLD.resolved_tenant_id IS NOT NULL AND NEW.resolved_tenant_id IS NOT OLD.resolved_tenant_id) OR (OLD.resolved_unit_id IS NOT NULL AND NEW.resolved_unit_id IS NOT OLD.resolved_unit_id) OR (OLD.resolved_contact_id IS NOT NULL AND NEW.resolved_contact_id IS NOT OLD.resolved_contact_id)
BEGIN SELECT RAISE(ABORT,'historical source mapping is immutable'); END;
CREATE TRIGGER tenant_import_no_remap BEFORE UPDATE OF tenant_id ON tenant_import_items
WHEN NEW.tenant_id IS NOT NULL AND OLD.resolved_tenant_id IS NOT NULL AND NEW.tenant_id!=OLD.resolved_tenant_id
BEGIN SELECT RAISE(ABORT,'source record already has an immutable resolved tenant'); END;
