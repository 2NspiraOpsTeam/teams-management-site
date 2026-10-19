PRAGMA defer_foreign_keys=ON;
CREATE TABLE admin_identities (email TEXT PRIMARY KEY COLLATE NOCASE, active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE admin_login_codes (id TEXT PRIMARY KEY, email TEXT NOT NULL REFERENCES admin_identities(email), code_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT, attempt_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE admin_login_throttle (key_hash TEXT PRIMARY KEY, window_start TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0);
CREATE TABLE admin_sessions (token_hash TEXT PRIMARY KEY, email TEXT NOT NULL REFERENCES admin_identities(email), expires_at TEXT NOT NULL, revoked_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE audit_log (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    record_before_json TEXT,
    record_after_json TEXT,
    user_actor TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE buildings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_public TEXT,
    address_json TEXT NOT NULL,
    amenities_public JSON,
    gallery JSON DEFAULT '[]',
    publication_state TEXT DEFAULT 'draft',
    management_context JSON,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
, latitude REAL, longitude REAL, geocode_status TEXT, map_verified INTEGER NOT NULL DEFAULT 0, has_retail INTEGER NOT NULL DEFAULT 0 CHECK(has_retail IN (0,1)), retail_status TEXT NOT NULL DEFAULT 'unknown' CHECK(retail_status IN ('active','commercial_component','planned','none','unknown')), retail_notes TEXT, retail_published INTEGER NOT NULL DEFAULT 0 CHECK(retail_published IN (0,1)));
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE dining_venue_photos (
  venue_id TEXT NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES media_assets(id),
  position INTEGER NOT NULL,
  PRIMARY KEY (venue_id, asset_id),
  UNIQUE (venue_id, position)
);
CREATE TABLE dining_venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  property_id TEXT NOT NULL REFERENCES buildings(id),
  summary TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  neighborhood TEXT,
  website_url TEXT,
  menu_url TEXT,
  reservation_url TEXT,
  ordering_url TEXT,
  phone TEXT,
  hero_media_asset_id TEXT REFERENCES media_assets(id),
  publication_state TEXT NOT NULL DEFAULT 'draft' CHECK(publication_state IN ('draft','published')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE inquiries (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_info_hash TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    routing_destination TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    notes TEXT
);
CREATE TABLE inquiry_details (
  inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  building_id TEXT REFERENCES buildings(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
, property_interest TEXT);
CREATE TABLE inquiry_notifications (inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id), state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sent','failed','unknown')), destination TEXT, attempts INTEGER NOT NULL DEFAULT 0, last_attempt_at TEXT, provider_id TEXT, error_code TEXT);
CREATE TABLE layouts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    specifications JSON DEFAULT '{}',
    dimensions_json TEXT,
    asset_version INTEGER DEFAULT 1,
    reused_by_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE media_assets (
    id TEXT PRIMARY KEY,
    storage_key TEXT UNIQUE NOT NULL,
    file_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    size_bytes INTEGER,
    checksum TEXT,
    provenance TEXT,
    visibility TEXT DEFAULT 'public',
    uploaded_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
, alt_text TEXT, caption TEXT);
CREATE TABLE media_assignments (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    building_id TEXT REFERENCES buildings(id),
    unit_id TEXT REFERENCES units(id),
    is_cover BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    alt_text TEXT,
    caption TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE media_home_assignments (id TEXT PRIMARY KEY, asset_id TEXT NOT NULL REFERENCES media_assets(id), slot TEXT NOT NULL CHECK(slot IN ('hero','featured','supporting')), order_index INTEGER NOT NULL DEFAULT 0, alt_text TEXT, caption TEXT, published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE media_objects (storage_key TEXT PRIMARY KEY, body_base64 TEXT NOT NULL);
CREATE TABLE media_presentation_gallery (
 building_id TEXT NOT NULL,
 context TEXT NOT NULL,
 asset_id TEXT NOT NULL REFERENCES media_assets(id),
 order_index INTEGER NOT NULL CHECK(order_index>=0),
 kind TEXT NOT NULL DEFAULT 'exterior' CHECK(kind IN ('exterior','storefront','interior','streetscape','floorplan')),
 PRIMARY KEY(building_id,context,asset_id),
 FOREIGN KEY(building_id,context) REFERENCES media_presentation_settings(building_id,context)
);
CREATE TABLE media_presentation_settings (
 building_id TEXT NOT NULL REFERENCES buildings(id),
 context TEXT NOT NULL CHECK(context IN ('residential','retail')),
 cover_asset_id TEXT REFERENCES media_assets(id),
 fallback_to_property_cover INTEGER NOT NULL DEFAULT 0 CHECK(fallback_to_property_cover IN (0,1)),
 revision INTEGER NOT NULL DEFAULT 0,
 mutation_token TEXT NOT NULL DEFAULT '',
 PRIMARY KEY(building_id,context)
);
CREATE TABLE media_publications (assignment_id TEXT PRIMARY KEY REFERENCES media_assignments(id), published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)));
CREATE TABLE operations_assignment_profiles (
 assignment_id TEXT PRIMARY KEY REFERENCES tenant_assignments(id), occupant_role TEXT NOT NULL DEFAULT 'authorized_occupant' CHECK(occupant_role IN('primary_leaseholder','leaseholder','authorized_occupant')), move_in_date TEXT, move_out_date TEXT, revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
, relationship_type TEXT NOT NULL DEFAULT 'unknown' CHECK(relationship_type IN('occupant','business','contact','unknown')), assignment_status TEXT NOT NULL DEFAULT 'unknown' CHECK(assignment_status IN('proposed','current','historical','unknown')));
CREATE TABLE operations_lease_documents (
 id TEXT PRIMARY KEY, lease_id TEXT NOT NULL REFERENCES operations_leases(id), storage_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, size_bytes INTEGER NOT NULL CHECK(size_bytes>0), sha256 TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN(0,1)), created_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE operations_leaseholders (
 lease_id TEXT NOT NULL REFERENCES operations_leases(id), tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), holder_role TEXT NOT NULL CHECK(holder_role IN('primary_leaseholder','leaseholder','authorized_occupant')), active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1)), can_view_document INTEGER NOT NULL DEFAULT 0 CHECK(can_view_document IN(0,1)), show_rent INTEGER NOT NULL DEFAULT 0 CHECK(show_rent IN(0,1)), PRIMARY KEY(lease_id,tenant_id)
);
CREATE TABLE operations_leases (
 id TEXT PRIMARY KEY, unit_id TEXT NOT NULL REFERENCES units(id), lease_start TEXT NOT NULL, lease_end TEXT NOT NULL CHECK(lease_end>=lease_start), monthly_rent_cents INTEGER NOT NULL CHECK(monthly_rent_cents>=0), security_deposit_cents INTEGER CHECK(security_deposit_cents>=0), status TEXT NOT NULL CHECK(status IN('active','expiring','expired','renewed','terminated')), renewal_status TEXT NOT NULL DEFAULT 'not_started' CHECK(renewal_status IN('not_started','under_review','offered','renewed','not_renewing')), predecessor_id TEXT REFERENCES operations_leases(id), internal_notes TEXT NOT NULL DEFAULT '', portal_published INTEGER NOT NULL DEFAULT 0 CHECK(portal_published IN(0,1)), revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0), created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE operations_mutation_receipts (
 id TEXT PRIMARY KEY, actor TEXT NOT NULL, fingerprint TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE operations_properties (
 building_id TEXT PRIMARY KEY REFERENCES buildings(id), property_type TEXT NOT NULL DEFAULT 'unverified', internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
, llc_name TEXT CHECK(llc_name IS NULL OR length(llc_name)<=240));
CREATE TABLE operations_renewal_settings (
 id TEXT PRIMARY KEY CHECK(id='default'), settings_json TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE TABLE operations_renewal_tracking (
 lease_id TEXT PRIMARY KEY REFERENCES operations_leases(id),
 status TEXT NOT NULL DEFAULT 'not_started',
 staff_email TEXT REFERENCES admin_identities(email), last_contact_date TEXT, follow_up_date TEXT,
 internal_notes TEXT NOT NULL DEFAULT '', completed_at TEXT,
 revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0), updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE operations_rent_roll_source (
 unit_id TEXT PRIMARY KEY NOT NULL REFERENCES units(id),
 source_sha256 TEXT NOT NULL, source_sheet TEXT NOT NULL, source_row INTEGER NOT NULL CHECK(source_row>0),
 source_period TEXT NOT NULL, tenant_name TEXT, status_code TEXT, square_footage TEXT, bedrooms TEXT,
 lease_expiration TEXT, security TEXT, legal_rent TEXT, rent TEXT,
 source_values_json TEXT NOT NULL,
 imported_by TEXT NOT NULL, imported_at TEXT NOT NULL DEFAULT(datetime('now')), move_in_date TEXT, rentredi TEXT, utility_reimbursement TEXT, additional_notes TEXT,
 UNIQUE(source_sha256,source_sheet,source_row)
);
CREATE TABLE operations_superintendent_properties (
 superintendent_id TEXT NOT NULL REFERENCES operations_superintendents(id), building_id TEXT NOT NULL REFERENCES buildings(id), active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1)), tenant_contact_approved INTEGER NOT NULL DEFAULT 0 CHECK(tenant_contact_approved IN(0,1)), PRIMARY KEY(superintendent_id,building_id)
);
CREATE TABLE operations_superintendents (
 id TEXT PRIMARY KEY, full_name TEXT NOT NULL, mobile_phone TEXT NOT NULL DEFAULT '', work_phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', languages TEXT NOT NULL DEFAULT '', contact_status TEXT NOT NULL DEFAULT 'active' CHECK(contact_status IN('active','inactive')), internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0), created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE operations_tenants (
 tenant_id TEXT PRIMARY KEY REFERENCES tenant_accounts(id), phone TEXT NOT NULL DEFAULT '', preferred_contact TEXT NOT NULL DEFAULT 'email' CHECK(preferred_contact IN('email','phone')), preferred_language TEXT NOT NULL DEFAULT '', internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
, directory_status TEXT NOT NULL DEFAULT 'active' CHECK(directory_status IN('active','inactive','unknown')), updated_at TEXT, first_name TEXT, last_name TEXT);
CREATE TABLE operations_units (
 unit_id TEXT PRIMARY KEY REFERENCES units(id), bedrooms REAL CHECK(bedrooms>=0 AND bedrooms<=30), bathrooms REAL CHECK(bathrooms>=0 AND bathrooms<=30), square_feet INTEGER CHECK(square_feet>0 AND square_feet<=100000), vacancy_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(vacancy_confirmed IN(0,1)), internal_notes TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
, unit_type TEXT NOT NULL DEFAULT 'unknown' CHECK(unit_type IN('residential','commercial','unknown')));
CREATE TABLE operations_work_order_profiles (
 request_id TEXT PRIMARY KEY REFERENCES tenant_maintenance_requests(id), workflow_status TEXT CHECK(workflow_status IN('submitted','in_review','scheduled','in_progress','completed','closed','cancelled')), superintendent_id TEXT REFERENCES operations_superintendents(id), staff_email TEXT REFERENCES admin_identities(email), revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0)
);
CREATE TABLE page_showcase_assignments (id TEXT PRIMARY KEY, page TEXT NOT NULL CHECK(page IN ('home','about','properties','retail','rent-with-us','gallery','contact','tenant-services')), property_id TEXT NOT NULL REFERENCES buildings(id), media_asset_id TEXT NOT NULL REFERENCES media_assets(id), caption TEXT, order_index INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE portfolio_imports (key TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE property_videos (
 id TEXT PRIMARY KEY,
 building_id TEXT NOT NULL REFERENCES buildings(id),
 unit_id TEXT REFERENCES units(id),
 source_url TEXT NOT NULL,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 transcript TEXT NOT NULL DEFAULT '',
 poster_asset_id TEXT REFERENCES media_assets(id),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 public_access_verified INTEGER NOT NULL DEFAULT 0 CHECK(public_access_verified IN (0,1)),
 order_index INTEGER NOT NULL DEFAULT 0 CHECK(order_index>=0),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(building_id,source_url)
);
CREATE TABLE rental_handoff_settings (
  id TEXT PRIMARY KEY CHECK(id = 'primary'),
  kind TEXT NOT NULL DEFAULT 'none' CHECK(kind IN ('none','url','email','phone')),
  label TEXT,
  destination TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
CREATE TABLE retail_media_approvals (
 building_id TEXT NOT NULL REFERENCES buildings(id), asset_id TEXT NOT NULL REFERENCES media_assets(id),
 kind TEXT NOT NULL CHECK(kind IN ('exterior','storefront','interior','streetscape','floorplan')),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)), order_index INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(building_id,asset_id)
);
CREATE TABLE retail_profiles (
 building_id TEXT PRIMARY KEY REFERENCES buildings(id),
 retail_summary TEXT, retail_square_feet INTEGER, retail_floor TEXT, storefront_frontage TEXT,
 ceiling_height TEXT, corner_location TEXT, street_exposure TEXT, basement_storage TEXT,
 venting TEXT, gas_available TEXT, electrical_notes TEXT, accessibility_notes TEXT,
 loading_notes TEXT, signage_notes TEXT, approved_uses TEXT, transit_notes TEXT,
 retail_availability_status TEXT, retail_contact_notes TEXT, tenant_website TEXT,
 retail_brochure_asset_id TEXT, retail_floorplan_asset_id TEXT,
 published_fields_json TEXT NOT NULL DEFAULT '[]', provenance_json TEXT NOT NULL DEFAULT '{}',
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE "tenant_accounts" (
 id TEXT PRIMARY KEY, email TEXT UNIQUE COLLATE NOCASE, display_name TEXT,
 active INTEGER NOT NULL DEFAULT 0 CHECK(active IN(0,1)),
 created_at TEXT NOT NULL DEFAULT(datetime('now')),
 CHECK(active=0 OR (email IS NOT NULL AND length(trim(email))>0))
);
CREATE TABLE tenant_assignments (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), building_id TEXT NOT NULL REFERENCES buildings(id), unit_id TEXT NOT NULL REFERENCES units(id), active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE(tenant_id,unit_id));
CREATE TABLE tenant_contact_requests (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), assignment_id TEXT NOT NULL REFERENCES tenant_assignments(id), subject TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'submitted', staff_notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
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
CREATE TABLE tenant_documents (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), assignment_id TEXT REFERENCES tenant_assignments(id), title TEXT NOT NULL, document_type TEXT NOT NULL, private_storage_key TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE tenant_import_batches (
 id TEXT PRIMARY KEY, source_sha256 TEXT NOT NULL, approved_package_sha256 TEXT NOT NULL,
 parser_version TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN('validated','committing','committed','failed','undone')),
 requested_by TEXT NOT NULL, approved_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now')), committed_at TEXT, counts_json TEXT NOT NULL,
 UNIQUE(source_sha256,approved_package_sha256,parser_version)
);
CREATE TABLE tenant_import_change_records(
 batch_id TEXT NOT NULL REFERENCES tenant_import_batches(id) ON DELETE RESTRICT,
 entity_type TEXT NOT NULL,entity_id TEXT NOT NULL,record_id TEXT NOT NULL,
 PRIMARY KEY(batch_id,entity_type,entity_id)
);
CREATE TABLE tenant_import_changes (
 id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES tenant_import_batches(id) ON DELETE RESTRICT,
 entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, operation TEXT NOT NULL CHECK(operation IN('create','update','link')),
 before_json TEXT, after_json TEXT NOT NULL, expected_version INTEGER, actor_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE tenant_import_guards(id TEXT PRIMARY KEY, ok INTEGER NOT NULL CHECK(ok=1));
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
CREATE TABLE tenant_import_undo_records(
 batch_id TEXT NOT NULL REFERENCES tenant_import_batches(id) ON DELETE RESTRICT,
 record_id TEXT NOT NULL, actor_id TEXT NOT NULL, changes_json TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now')), PRIMARY KEY(batch_id,record_id)
);
CREATE TABLE tenant_login_codes (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), code_hash TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT, attempt_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE tenant_login_throttle (key_hash TEXT PRIMARY KEY, window_start TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0);
CREATE TABLE tenant_maintenance_requests (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), assignment_id TEXT NOT NULL REFERENCES tenant_assignments(id), category TEXT NOT NULL, description TEXT NOT NULL, urgency TEXT NOT NULL CHECK(urgency IN ('routine','urgent')), preferred_contact TEXT NOT NULL CHECK(preferred_contact IN ('email','phone')), status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted','in_review','scheduled','completed','closed')), staff_notes TEXT, submitted_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE tenant_sessions (token_hash TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id), expires_at TEXT NOT NULL, revoked_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE tenant_upload_configuration (
 id TEXT PRIMARY KEY CHECK(id='teams-preview'), database_id TEXT NOT NULL,
 backup_sha256 TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN(0,1)),
 verified_at TEXT NOT NULL, verified_by TEXT NOT NULL
);
CREATE TABLE tenant_upload_identity_links (
 id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL REFERENCES tenant_accounts(id) ON DELETE RESTRICT,
 source_sheet TEXT NOT NULL, source_row INTEGER NOT NULL, building_id TEXT NOT NULL REFERENCES buildings(id),
 unit_id TEXT NOT NULL REFERENCES units(id), source_name TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE tenant_uploads (
 id TEXT PRIMARY KEY, file_name TEXT NOT NULL, parser_version TEXT NOT NULL,
 rows_json TEXT NOT NULL, resolutions_json TEXT NOT NULL DEFAULT '{}', preview_json TEXT NOT NULL,
 plan_json TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
 created_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT(datetime('now')),
 updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);
CREATE TABLE "units" (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_identifier TEXT NOT NULL,
    floor_number INTEGER,
    layout_id TEXT REFERENCES layouts(id),
    status TEXT DEFAULT 'available_internal',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE work_order_details (
 number INTEGER PRIMARY KEY AUTOINCREMENT,
 request_id TEXT NOT NULL UNIQUE REFERENCES tenant_maintenance_requests(id),
 permission_to_enter INTEGER CHECK(permission_to_enter IN (0,1)),
 access_instructions TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>=1),
 payload_hash TEXT NOT NULL DEFAULT '',
 completed_at TEXT
);
CREATE TABLE work_order_events (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL REFERENCES tenant_maintenance_requests(id),
 kind TEXT NOT NULL CHECK(kind IN ('submitted','status','update','internal')),
 visibility TEXT NOT NULL CHECK(visibility IN ('tenant','internal')),
 status TEXT,
 body TEXT NOT NULL DEFAULT '',
 payload_hash TEXT,
 actor_type TEXT NOT NULL CHECK(actor_type IN ('tenant','admin','system')),
 actor_id TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE work_order_notifications (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL REFERENCES tenant_maintenance_requests(id),
 event_id TEXT NOT NULL REFERENCES work_order_events(id),
 audience TEXT NOT NULL CHECK(audience IN ('management','tenant')),
 channel TEXT NOT NULL DEFAULT 'email' CHECK(channel='email'),
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','sent','failed','unknown')),
 attempts INTEGER NOT NULL DEFAULT 0,
 provider_id TEXT,
 error_code TEXT,
 last_attempt_at TEXT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(event_id,audience,channel)
);
CREATE TABLE work_order_photos (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL REFERENCES tenant_maintenance_requests(id),
 event_id TEXT NOT NULL REFERENCES work_order_events(id),
 mime TEXT NOT NULL CHECK(mime IN ('image/jpeg','image/png','image/webp')),
 bytes INTEGER NOT NULL CHECK(bytes BETWEEN 12 AND 650000),
 content_base64 TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX directory_assignments_unit ON tenant_assignments(unit_id,active,tenant_id);
CREATE INDEX idx_admin_login_codes_email ON admin_login_codes(email, created_at);
CREATE INDEX idx_admin_sessions_email ON admin_sessions(email, expires_at);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_buildings_public_state ON buildings(publication_state);
CREATE INDEX idx_buildings_retail_public ON buildings(has_retail,retail_published,retail_status);
CREATE INDEX idx_buildings_state ON buildings(publication_state);
CREATE INDEX idx_dining_property ON dining_venues(property_id,publication_state);
CREATE INDEX idx_dining_public ON dining_venues(publication_state,display_order);
CREATE INDEX idx_dining_venue_photos_order ON dining_venue_photos(venue_id, position);
CREATE INDEX idx_inquiries_source_contact_created ON inquiries(source, contact_info_hash, created_at);
CREATE INDEX idx_inquiries_status_created ON inquiries(status, created_at);
CREATE INDEX idx_inquiry_details_building ON inquiry_details(building_id);
CREATE INDEX idx_media_assets_storage ON media_assets(storage_key);
CREATE INDEX idx_media_assignments_asset_building_unit ON media_assignments(asset_id,building_id,unit_id);
CREATE INDEX idx_media_assignments_building_unit_order ON media_assignments(building_id,unit_id,order_index);
CREATE UNIQUE INDEX idx_media_checksum ON media_assets(checksum) WHERE checksum IS NOT NULL;
CREATE UNIQUE INDEX idx_media_cover ON media_assignments(building_id) WHERE is_cover=1 AND building_id IS NOT NULL;
CREATE INDEX idx_media_home_assignments_asset ON media_home_assignments(asset_id);
CREATE UNIQUE INDEX idx_media_home_hero ON media_home_assignments(slot) WHERE slot='hero';
CREATE INDEX idx_media_storage ON media_assets(storage_key);
CREATE INDEX idx_page_showcase_page ON page_showcase_assignments(page,published,order_index);
CREATE INDEX idx_tenant_assignments_tenant ON tenant_assignments(tenant_id,active);
CREATE INDEX idx_tenant_login_codes_tenant ON tenant_login_codes(tenant_id,created_at);
CREATE INDEX idx_tenant_requests_tenant ON tenant_maintenance_requests(tenant_id,submitted_at);
CREATE INDEX idx_tenant_sessions_tenant ON tenant_sessions(tenant_id,expires_at);
CREATE INDEX idx_units_building_status ON units(building_id, status);
CREATE INDEX idx_units_status ON units(building_id, status);
CREATE INDEX idx_work_order_events_request ON work_order_events(request_id,created_at);
CREATE INDEX idx_work_order_notifications_state ON work_order_notifications(state,created_at);
CREATE INDEX idx_work_order_photos_request ON work_order_photos(request_id);
CREATE INDEX operations_assignments_building ON tenant_assignments(building_id,active,unit_id);
CREATE INDEX operations_assignments_unit ON tenant_assignments(unit_id,active,tenant_id);
CREATE INDEX operations_audit_entity ON audit_log(entity_type,entity_id,created_at DESC);
CREATE INDEX operations_audit_recent ON audit_log(created_at DESC,id DESC,entity_type);
CREATE INDEX operations_audit_source_chunks ON audit_log(entity_type,action,entity_id);
CREATE INDEX operations_contact_pick ON tenant_contacts(tenant_id,contact_type,archived,is_primary DESC,id);
CREATE INDEX operations_document_lease ON operations_lease_documents(lease_id,archived,created_at DESC);
CREATE INDEX operations_holder_tenant ON operations_leaseholders(tenant_id,active,lease_id);
CREATE INDEX operations_import_unit_review ON tenant_import_items(unit_id,source_cell,outcome,record_id);
CREATE INDEX operations_lease_current_unit ON operations_leases(unit_id,status,lease_start,lease_end DESC,id);
CREATE INDEX operations_lease_expiration ON operations_leases(lease_end,status,unit_id);
CREATE INDEX operations_lease_unit ON operations_leases(unit_id,lease_end DESC,id);
CREATE INDEX operations_open_requests ON tenant_maintenance_requests(assignment_id,submitted_at DESC,id) WHERE status NOT IN('completed','closed');
CREATE INDEX operations_property_name ON buildings(name COLLATE NOCASE,id);
CREATE INDEX operations_renewal_followup ON operations_renewal_tracking(follow_up_date,status,lease_id);
CREATE INDEX operations_renewal_successor ON operations_leases(predecessor_id,status,lease_start,lease_end);
CREATE INDEX operations_request_assignment ON tenant_maintenance_requests(assignment_id,submitted_at DESC,id);
CREATE INDEX operations_request_status ON tenant_maintenance_requests(status,submitted_at DESC,id);
CREATE INDEX operations_sup_property ON operations_superintendent_properties(building_id,active,superintendent_id);
CREATE INDEX operations_superintendent_name ON operations_superintendents(full_name COLLATE NOCASE,id);
CREATE INDEX operations_tenant_name ON tenant_accounts(display_name COLLATE NOCASE,id);
CREATE UNIQUE INDEX operations_unit_identifier_unique ON units(building_id,upper(trim(unit_identifier)));
CREATE INDEX operations_unit_lookup ON units(building_id,unit_identifier COLLATE NOCASE,id);
CREATE INDEX operations_unit_name ON units(unit_identifier COLLATE NOCASE,id);
CREATE INDEX property_videos_building_public ON property_videos(building_id,published,order_index);
CREATE UNIQUE INDEX tenant_contacts_exact ON tenant_contacts(tenant_id,contact_type,value_raw) WHERE archived=0;
CREATE INDEX tenant_contacts_owner ON tenant_contacts(tenant_id,contact_type,archived);
CREATE UNIQUE INDEX tenant_contacts_primary ON tenant_contacts(tenant_id,contact_type) WHERE is_primary=1 AND archived=0;
CREATE INDEX tenant_import_record_mapping ON tenant_import_items(source_sha256,record_id);
CREATE TRIGGER operations_rent_roll_source_audit AFTER INSERT ON operations_rent_roll_source BEGIN
 INSERT INTO audit_log(id,action,entity_type,entity_id,record_after_json,user_actor) VALUES(
 'rentroll-source:'||NEW.source_sha256||':'||NEW.source_sheet||':'||NEW.source_row,
 'imported','operations_rent_roll_source',NEW.unit_id,
 json_object('source_sha256',NEW.source_sha256,'source_sheet',NEW.source_sheet,'source_row',NEW.source_row,'source_period',NEW.source_period,'tenant_name',NEW.tenant_name,'status',NEW.status_code,'square_footage',NEW.square_footage,'bedrooms',NEW.bedrooms,'lease_expiration',NEW.lease_expiration,'security',NEW.security,'legal_rent',NEW.legal_rent,'rent',NEW.rent),NEW.imported_by);
END;
CREATE TRIGGER tenant_import_consistent_mapping BEFORE INSERT ON tenant_import_items
WHEN NEW.tenant_id IS NOT NULL AND EXISTS(SELECT 1 FROM tenant_import_items i WHERE i.source_sha256=NEW.source_sha256 AND i.record_id=NEW.record_id AND COALESCE(i.tenant_id,i.resolved_tenant_id) IS NOT NULL AND COALESCE(i.tenant_id,i.resolved_tenant_id)!=NEW.tenant_id)
BEGIN SELECT RAISE(ABORT,'source record already resolves to another tenant'); END;
CREATE TRIGGER tenant_import_consistent_mapping_update BEFORE UPDATE OF tenant_id,record_id,source_sha256 ON tenant_import_items
WHEN NEW.tenant_id IS NOT NULL AND EXISTS(SELECT 1 FROM tenant_import_items i WHERE i.id!=NEW.id AND i.source_sha256=NEW.source_sha256 AND i.record_id=NEW.record_id AND COALESCE(i.tenant_id,i.resolved_tenant_id) IS NOT NULL AND COALESCE(i.tenant_id,i.resolved_tenant_id)!=NEW.tenant_id)
BEGIN SELECT RAISE(ABORT,'source record already resolves to another tenant'); END;
CREATE TRIGGER tenant_import_contact_owner BEFORE INSERT ON tenant_import_items
WHEN NEW.contact_id IS NOT NULL AND (NEW.tenant_id IS NULL OR NOT EXISTS(SELECT 1 FROM tenant_contacts c WHERE c.id=NEW.contact_id AND c.tenant_id=NEW.tenant_id))
BEGIN SELECT RAISE(ABORT,'contact provenance owner mismatch'); END;
CREATE TRIGGER tenant_import_keep_resolved AFTER INSERT ON tenant_import_items
BEGIN UPDATE tenant_import_items SET resolved_tenant_id=NEW.tenant_id,resolved_unit_id=NEW.unit_id,resolved_contact_id=NEW.contact_id WHERE id=NEW.id; END;
CREATE TRIGGER tenant_import_no_remap BEFORE UPDATE OF tenant_id ON tenant_import_items
WHEN NEW.tenant_id IS NOT NULL AND OLD.resolved_tenant_id IS NOT NULL AND NEW.tenant_id!=OLD.resolved_tenant_id
BEGIN SELECT RAISE(ABORT,'source record already has an immutable resolved tenant'); END;
CREATE TRIGGER tenant_import_resolved_immutable BEFORE UPDATE OF resolved_tenant_id,resolved_unit_id,resolved_contact_id ON tenant_import_items
WHEN (OLD.resolved_tenant_id IS NOT NULL AND NEW.resolved_tenant_id IS NOT OLD.resolved_tenant_id) OR (OLD.resolved_unit_id IS NOT NULL AND NEW.resolved_unit_id IS NOT OLD.resolved_unit_id) OR (OLD.resolved_contact_id IS NOT NULL AND NEW.resolved_contact_id IS NOT OLD.resolved_contact_id)
BEGIN SELECT RAISE(ABORT,'historical source mapping is immutable'); END;
CREATE TRIGGER work_order_request_created AFTER INSERT ON tenant_maintenance_requests BEGIN
 INSERT INTO work_order_details(request_id) VALUES (NEW.id);
 INSERT INTO work_order_events(id,request_id,kind,visibility,status,body,actor_type,actor_id,created_at)
 VALUES ('submitted-'||NEW.id,NEW.id,'submitted','tenant','submitted','','tenant',NEW.tenant_id,NEW.submitted_at);
END;
