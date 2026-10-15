-- Additive operations foundation. No tenant identities, assignments, units or request history are replaced.
CREATE TABLE IF NOT EXISTS operations_properties (
 building_id TEXT PRIMARY KEY REFERENCES buildings(id), property_type TEXT NOT NULL DEFAULT 'unverified', internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE TABLE IF NOT EXISTS operations_units (
 unit_id TEXT PRIMARY KEY REFERENCES units(id), bedrooms REAL CHECK(bedrooms>=0 AND bedrooms<=30), bathrooms REAL CHECK(bathrooms>=0 AND bathrooms<=30), square_feet INTEGER CHECK(square_feet>0 AND square_feet<=100000), vacancy_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(vacancy_confirmed IN(0,1)), internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE UNIQUE INDEX IF NOT EXISTS operations_unit_identifier_unique ON units(building_id,upper(trim(unit_identifier)));
CREATE TABLE IF NOT EXISTS operations_tenants (
 tenant_id TEXT PRIMARY KEY REFERENCES tenant_accounts(id), phone TEXT NOT NULL DEFAULT '', preferred_contact TEXT NOT NULL DEFAULT 'email' CHECK(preferred_contact IN('email','phone')), preferred_language TEXT NOT NULL DEFAULT '', internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE INDEX IF NOT EXISTS operations_tenant_name ON tenant_accounts(display_name COLLATE NOCASE,id);
CREATE TABLE IF NOT EXISTS operations_assignment_profiles (
 assignment_id TEXT PRIMARY KEY REFERENCES tenant_assignments(id), occupant_role TEXT NOT NULL DEFAULT 'authorized_occupant' CHECK(occupant_role IN('primary_leaseholder','leaseholder','authorized_occupant')), move_in_date TEXT, move_out_date TEXT, revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE INDEX IF NOT EXISTS operations_assignments_unit ON tenant_assignments(unit_id,active,tenant_id);
CREATE INDEX IF NOT EXISTS operations_assignments_building ON tenant_assignments(building_id,active,unit_id);
CREATE TABLE IF NOT EXISTS operations_superintendents (
 id TEXT PRIMARY KEY, full_name TEXT NOT NULL, mobile_phone TEXT NOT NULL DEFAULT '', work_phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', languages TEXT NOT NULL DEFAULT '', contact_status TEXT NOT NULL DEFAULT 'active' CHECK(contact_status IN('active','inactive')), internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0), created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS operations_superintendent_name ON operations_superintendents(full_name COLLATE NOCASE,id);
CREATE TABLE IF NOT EXISTS operations_superintendent_properties (
 superintendent_id TEXT NOT NULL REFERENCES operations_superintendents(id), building_id TEXT NOT NULL REFERENCES buildings(id), active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1)), tenant_contact_approved INTEGER NOT NULL DEFAULT 0 CHECK(tenant_contact_approved IN(0,1)), PRIMARY KEY(superintendent_id,building_id)
);
CREATE INDEX IF NOT EXISTS operations_sup_property ON operations_superintendent_properties(building_id,active,superintendent_id);
CREATE TABLE IF NOT EXISTS operations_leases (
 id TEXT PRIMARY KEY, unit_id TEXT NOT NULL REFERENCES units(id), lease_start TEXT NOT NULL, lease_end TEXT NOT NULL CHECK(lease_end>=lease_start), monthly_rent_cents INTEGER NOT NULL CHECK(monthly_rent_cents>=0), security_deposit_cents INTEGER CHECK(security_deposit_cents>=0), status TEXT NOT NULL CHECK(status IN('active','expiring','expired','renewed','terminated')), renewal_status TEXT NOT NULL DEFAULT 'not_started' CHECK(renewal_status IN('not_started','under_review','offered','renewed','not_renewing')), predecessor_id TEXT REFERENCES operations_leases(id), internal_notes TEXT NOT NULL DEFAULT '', portal_published INTEGER NOT NULL DEFAULT 0 CHECK(portal_published IN(0,1)), revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0), created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS operations_lease_unit ON operations_leases(unit_id,lease_end DESC,id);
CREATE INDEX IF NOT EXISTS operations_lease_expiration ON operations_leases(lease_end,status,unit_id);
CREATE TABLE IF NOT EXISTS operations_leaseholders (
 lease_id TEXT NOT NULL REFERENCES operations_leases(id), tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), holder_role TEXT NOT NULL CHECK(holder_role IN('primary_leaseholder','leaseholder','authorized_occupant')), active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1)), can_view_document INTEGER NOT NULL DEFAULT 0 CHECK(can_view_document IN(0,1)), show_rent INTEGER NOT NULL DEFAULT 0 CHECK(show_rent IN(0,1)), PRIMARY KEY(lease_id,tenant_id)
);
CREATE INDEX IF NOT EXISTS operations_holder_tenant ON operations_leaseholders(tenant_id,active,lease_id);
CREATE TABLE IF NOT EXISTS operations_lease_documents (
 id TEXT PRIMARY KEY, lease_id TEXT NOT NULL REFERENCES operations_leases(id), storage_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, size_bytes INTEGER NOT NULL CHECK(size_bytes>0), sha256 TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN(0,1)), created_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS operations_document_lease ON operations_lease_documents(lease_id,archived,created_at DESC);
CREATE TABLE IF NOT EXISTS operations_work_order_profiles (
 request_id TEXT PRIMARY KEY REFERENCES tenant_maintenance_requests(id), workflow_status TEXT CHECK(workflow_status IN('submitted','in_review','scheduled','in_progress','completed','closed','cancelled')), superintendent_id TEXT REFERENCES operations_superintendents(id), staff_email TEXT REFERENCES admin_identities(email), revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE TABLE IF NOT EXISTS operations_mutation_receipts (
 id TEXT PRIMARY KEY, actor TEXT NOT NULL, fingerprint TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE INDEX IF NOT EXISTS operations_request_assignment ON tenant_maintenance_requests(assignment_id,submitted_at DESC,id);
CREATE INDEX IF NOT EXISTS operations_request_status ON tenant_maintenance_requests(status,submitted_at DESC,id);

CREATE INDEX IF NOT EXISTS operations_audit_entity ON audit_log(entity_type,entity_id,created_at DESC);

CREATE INDEX IF NOT EXISTS operations_unit_lookup ON units(building_id,unit_identifier COLLATE NOCASE,id);
CREATE INDEX IF NOT EXISTS operations_unit_name ON units(unit_identifier COLLATE NOCASE,id);
CREATE INDEX IF NOT EXISTS operations_open_requests ON tenant_maintenance_requests(assignment_id,submitted_at DESC,id) WHERE status NOT IN('completed','closed');
