-- Preview-only durable media object storage until R2 is enabled. Additive; never deletes source assets.
ALTER TABLE media_assets ADD COLUMN alt_text TEXT;
ALTER TABLE media_assets ADD COLUMN caption TEXT;
CREATE TABLE IF NOT EXISTS media_objects (storage_key TEXT PRIMARY KEY, body_base64 TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS media_publications (assignment_id TEXT PRIMARY KEY REFERENCES media_assignments(id), published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)));
CREATE TABLE IF NOT EXISTS media_home_assignments (id TEXT PRIMARY KEY, asset_id TEXT NOT NULL REFERENCES media_assets(id), slot TEXT NOT NULL CHECK(slot IN ('hero','featured','supporting')), order_index INTEGER NOT NULL DEFAULT 0, alt_text TEXT, caption TEXT, published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)), created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_checksum ON media_assets(checksum) WHERE checksum IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_cover ON media_assignments(building_id) WHERE is_cover=1 AND building_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_home_hero ON media_home_assignments(slot) WHERE slot='hero';
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-01','/preview-properties/61-gold-st/input-IMG_1540---8fb1ca65-a1a8-4978-b538-0e29844bd4e8.jpg','image/jpeg','legacy-gold-preview-01','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-01','gold-preview-01','real-61-gold-st',1,0,'61 Gold St approved property image 1');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-01',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-02','/preview-properties/61-gold-st/input-IMG_1621---5b1701de-49f5-465f-afeb-0d6d7f05dfd5.jpg','image/jpeg','legacy-gold-preview-02','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-02','gold-preview-02','real-61-gold-st',0,1,'61 Gold St approved property image 2');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-02',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-03','/preview-properties/61-gold-st/input-IMG_1768---aee1973b-f300-46c7-95fa-e60c1c3205c7.jpg','image/jpeg','legacy-gold-preview-03','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-03','gold-preview-03','real-61-gold-st',0,2,'61 Gold St approved property image 3');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-03',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-04','/preview-properties/61-gold-st/input-IMG_1767---4fd2b4cc-d24d-480a-84c3-fcbc244e515b.jpg','image/jpeg','legacy-gold-preview-04','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-04','gold-preview-04','real-61-gold-st',0,3,'61 Gold St approved property image 4');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-04',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-05','/preview-properties/61-gold-st/input-IMG_1622---13fe8f18-9eff-4772-9462-c883aadf1958.jpg','image/jpeg','legacy-gold-preview-05','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-05','gold-preview-05','real-61-gold-st',0,4,'61 Gold St approved property image 5');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-05',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-06','/preview-properties/61-gold-st/input-IMG_1519---1dc9bbce-eba4-4a7b-a16a-9b751e51006c.jpg','image/jpeg','legacy-gold-preview-06','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-06','gold-preview-06','real-61-gold-st',0,5,'61 Gold St approved property image 6');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-06',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-07','/preview-properties/61-gold-st/input-brooklyn_bridge---26ecca4c-d9fd-4d83-840c-315d9018e018.png','image/png','legacy-gold-preview-07','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-07','gold-preview-07','real-61-gold-st',0,6,'61 Gold St approved property image 7');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-07',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-08','/preview-properties/61-gold-st/input-IMG_1517---d432685b-dd66-4e50-9446-fde47ea8585f.jpg','image/jpeg','legacy-gold-preview-08','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-08','gold-preview-08','real-61-gold-st',0,7,'61 Gold St approved property image 8');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-08',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-09','/preview-properties/61-gold-st/input-IMG_1520---436992c6-0073-4f96-86d9-708fb2a6b23f.jpg','image/jpeg','legacy-gold-preview-09','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-09','gold-preview-09','real-61-gold-st',0,8,'61 Gold St approved property image 9');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-09',1);
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('gold-preview-10','/preview-properties/61-gold-st/input-IMG_5284---88aaeaac-e28b-4bd6-a193-2f0c0d9bab21.jpg','image/jpeg','legacy-gold-preview-10','approved-preview-gold-street','public','migration');
INSERT OR IGNORE INTO media_assignments (id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('gold-assignment-10','gold-preview-10','real-61-gold-st',0,9,'61 Gold St approved property image 10');
INSERT OR IGNORE INTO media_publications (assignment_id,published) VALUES ('gold-assignment-10',1);

-- Existing approved preview covers and curated Gold Street homepage images.
INSERT OR IGNORE INTO media_assets(id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('preview-cover-flushing','/preview-properties/42-70-156th-street.jpg','image/jpeg','legacy-preview-cover-flushing','approved-preview-cover','public','migration');
INSERT OR IGNORE INTO media_assets(id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('preview-cover-tremont','/preview-properties/3425-east-tremont-ave.jpg','image/jpeg','legacy-preview-cover-tremont','approved-preview-cover','public','migration');
INSERT OR IGNORE INTO media_assets(id,storage_key,file_type,checksum,provenance,visibility,uploaded_by) VALUES ('preview-cover-118','/preview-properties/166-e-118th-street.jpg','image/jpeg','legacy-preview-cover-118','approved-preview-cover','public','migration');
INSERT OR IGNORE INTO buildings(id,name,slug,address_json,amenities_public,gallery,publication_state) VALUES ('real-166-e-118th-st','166 E 118th St','166-e-118th-st','{"street":"166 E 118th St","city":"New York","state":"NY"}','[]','[]','draft'),('real-170-e-118th-st','170 E 118th St','170-e-118th-st','{"street":"170 E 118th St","city":"New York","state":"NY"}','[]','[]','draft');
INSERT OR IGNORE INTO media_assignments(id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('preview-assignment-flushing','preview-cover-flushing','build-001',1,0,'Approved property image for 42-70 156th St');
INSERT OR IGNORE INTO media_assignments(id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('preview-assignment-tremont','preview-cover-tremont','build-002',1,0,'Approved property image for 3425 East Tremont Ave');
INSERT OR IGNORE INTO media_assignments(id,asset_id,building_id,is_cover,order_index,alt_text) VALUES ('preview-assignment-118','preview-cover-118','real-166-e-118th-st',1,0,'Approved property image for 166 E 118th St');
INSERT OR IGNORE INTO media_publications(assignment_id,published) VALUES ('preview-assignment-flushing',1),('preview-assignment-tremont',1),('preview-assignment-118',1);
INSERT OR IGNORE INTO media_home_assignments(id,asset_id,slot,order_index,alt_text,published) VALUES ('preview-home-gold-1','gold-preview-01','featured',0,'Portfolio visual showcase from Gold Street property',1),('preview-home-gold-4','gold-preview-04','featured',1,'Portfolio visual showcase from Gold Street property',1);

-- Reconcile preview property identity with the approved separate 166 and 170 addresses.
INSERT OR IGNORE INTO buildings(id,name,slug,address_json,amenities_public,gallery,publication_state) VALUES ('real-166-e-118th-st','166 E 118th St','166-e-118th-st','{"street":"166 E 118th St","city":"New York","state":"NY"}','[]','[]','draft'),('real-170-e-118th-st','170 E 118th St','170-e-118th-st','{"street":"170 E 118th St","city":"New York","state":"NY"}','[]','[]','draft');
UPDATE buildings SET publication_state='archived' WHERE id='build-003' AND slug='166-170-e-118th-st';
