-- Teams Management Seed Data (Development Environment)
-- Isolated from 2Nspira - representative non-sensitive data

-- Insert buildings (real addresses from client, development descriptions)
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, management_context, created_at, updated_at) VALUES
('build-001', '42-70 156th St. Flushing', '42-70-156th-st-flushing', 'Elegant property in Flushing with convenient amenities.', '{"street":"42-70 156th St.","city":"Flushing","state":"NY","zip":"11355"}', '[{"id":"amen-001","name":"Doorman","category":"concierge"}]', '[]', 'published', '{"team_name":"Queens District Team"}', datetime('now'), datetime('now')),
('build-002', '3425 East Tremont Ave. Bronx', '3425-east-tremont-bronx', 'Modern Bronx residence with excellent transport.', '{"street":"3425 East Tremont Ave.","city":"Bronx","state":"NY","zip":"10467"}', '[{"id":"amen-002","name":"Gym","category":"lifestyle"}]', '[]', 'published', '{"team_name":"Bronx Team"}', datetime('now'), datetime('now')),
('build-003', '166-170 E 118th St.', '166-170-e-118th-st', 'Charming property in East Harlem.', '{"street":"166-170 E 118th St.","city":"New York","state":"NY","zip":"10035"}', '[{"id":"amen-003","name":"Rooftop Deck","category":"lifestyle"}]', '[]', 'published', '{"team_name":"East Harlem Team"}', datetime('now'), datetime('now')),
('build-004', '71 E 110th St.', '71-e-110th-st', 'Stylish East Harlem residence with period details.', '{"street":"71 E 110th St.","city":"New York","state":"NY","zip":"10029"}', '[{"id":"amen-004","name":"Package Room","category":"concierge"}]', '[]', 'published', '{"team_name":"East Harlem Team"}', datetime('now'), datetime('now'));

-- Insert units
INSERT OR REPLACE INTO units (id, building_id, unit_identifier, floor_number, layout_id, status, created_at, updated_at) VALUES
('unit-001', 'build-001', '3A', 3, NULL, 'available_internal', datetime('now'), datetime('now')),
('unit-002', 'build-001', '3B', 3, NULL, 'available_internal', datetime('now'), datetime('now')),
('unit-003', 'build-002', '5A', 5, NULL, 'occupied', datetime('now'), datetime('now'));

-- Insert layouts (representative templates)
INSERT OR REPLACE INTO layouts (id, name, description, specifications, dimensions_json, asset_version, reused_by_count, created_at, updated_at) VALUES
('layout-001', 'Compact Studio', 'Efficient studio layout for urban living.', '{}', '{"width_feet":28,"depth_feet":24}', 1, 0, datetime('now'), datetime('now')),
('layout-002', 'Spacious Studio', 'Generous studio with separate area.', '{}', '{"width_feet":32,"depth_feet":28}', 1, 0, datetime('now'), datetime('now'));

-- Insert media assets (R2 references - placeholder paths)
INSERT OR REPLACE INTO media_assets (id, storage_key, file_type, width, height, size_bytes, checksum, provenance, visibility, uploaded_by, created_at) VALUES
('media-001', 'buildings/42-70-156th/exterior-day.jpg', 'image/jpeg', 2048, 1365, 425000, 'sha256-placeholder-build001', 'Professional photography - licensed', 'public', 'admin-user', datetime('now'));

-- Insert media assignments
INSERT OR REPLACE INTO media_assignments (id, asset_id, building_id, is_cover, order_index, alt_text, caption, created_at) VALUES
('assign-001', 'media-001', 'build-001', 1, 0, '42-70 156th St Flushing exterior', 'Elegant property in Flushing with convenient amenities', datetime('now'));

-- Insert inquiries (development data)
INSERT OR REPLACE INTO inquiries (id, source, category, contact_info_hash, status, routing_destination, created_at, notes) VALUES
('inquiry-001', 'web', 'general', 'hash-placeholder-001', 'submitted', 'leasing@2nspira.com', datetime('now'), NULL);
