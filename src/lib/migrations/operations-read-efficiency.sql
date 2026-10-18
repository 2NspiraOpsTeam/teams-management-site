-- Additive, non-unique read indexes only. Apply remotely only after quota recovery,
-- matched schema inspection, and a verified backup/restoration rehearsal.
CREATE INDEX IF NOT EXISTS operations_import_unit_review ON tenant_import_items(unit_id,source_cell,outcome,record_id);
CREATE INDEX IF NOT EXISTS operations_audit_recent ON audit_log(created_at DESC,id DESC,entity_type);
CREATE INDEX IF NOT EXISTS operations_lease_current_unit ON operations_leases(unit_id,status,lease_start,lease_end DESC,id);
CREATE INDEX IF NOT EXISTS operations_contact_pick ON tenant_contacts(tenant_id,contact_type,archived,is_primary DESC,id);
CREATE INDEX IF NOT EXISTS operations_property_name ON buildings(name COLLATE NOCASE,id);
CREATE INDEX IF NOT EXISTS operations_audit_source_chunks ON audit_log(entity_type,action,entity_id);
