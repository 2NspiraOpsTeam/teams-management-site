-- Replace fictitious seed data with real client properties
-- These are now stable, canonical building records

DELETE FROM buildings WHERE slug LIKE '%-%' AND publication_state='published';

-- Real Property 1: 42-70 156th St, Flushing, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-flushing',
  '42-70 156th St - Flushing',
  '42-70-156th-st-flushing',
  NULL,
  '{"street":"156th","city":"Flushing","state":"NY","zip":"11358"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 2: 3425 East Tremont Ave, Bronx, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-bronx1',
  '3425 East Tremont Ave - Bronx',
  '3425-east-tremont-ave',
  NULL,
  '{"street":"East Tremont","city":"Bronx","state":"NY","zip":"10457"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 3: 166-170 E 118th St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-centralparksouth',
  '166-170 E 118th St - NYC',
  '166-170-e-118th-st',
  NULL,
  '{"street":"E 118th","city":"New York","state":"NY","zip":"10035"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 4: 71 E 110th St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-centralparksouth2',
  '71 E 110th St - NYC',
  '71-e-110th-st',
  NULL,
  '{"street":"E 110th","city":"New York","state":"NY","zip":"10029"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 5: 173 E 91st St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-gramercy',
  '173 E 91st St - NYC',
  '173-e-91st-st',
  NULL,
  '{"street":"E 91st","city":"New York","state":"NY","zip":"10028"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 6: 1626 2nd Ave, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-eastville',
  '1626 2nd Ave - NYC',
  '1626-2nd-ave',
  NULL,
  '{"street":"2nd","city":"New York","state":"NY","zip":"10075"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 7: 225 E 83rd St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-gramercy2',
  '225 E 83rd St - NYC',
  '225-e-83rd-st',
  NULL,
  '{"street":"E 83rd","city":"New York","state":"NY","zip":"10028"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 8: 171 E 74th St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-gramercy3',
  '171 E 74th St - NYC',
  '171-e-74th-st',
  NULL,
  '{"street":"E 74th","city":"New York","state":"NY","zip":"10021"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 9: 1374 1st Ave, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-rosehill',
  '1374 1st Ave - NYC',
  '1374-1st-ave',
  NULL,
  '{"street":"1st","city":"New York","state":"NY","zip":"10128"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 10: 1365 1st Ave, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-rosehill2',
  '1365 1st Ave - NYC',
  '1365-1st-ave',
  NULL,
  '{"street":"1st","city":"New York","state":"NY","zip":"10128"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 11: 41 W 46th St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-broadway',
  '41 W 46th St - NYC',
  '41-w-46th-st',
  NULL,
  '{"street":"W 46th","city":"New York","state":"NY","zip":"10036"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 12: 349-351 W 46th St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-broadway2',
  '349-351 W 46th St - NYC',
  '349-351-w-46th-st',
  NULL,
  '{"street":"W 46th","city":"New York","state":"NY","zip":"10018"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 13: 307 W 39th St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-garment',
  '307 W 39th St - NYC',
  '307-w-39th-st',
  NULL,
  '{"street":"W 39th","city":"New York","state":"NY","zip":"10018"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 14: 235 W 18th St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-westvillage',
  '235 W 18th St - NYC',
  '235-w-18th-st',
  NULL,
  '{"street":"W 18th","city":"New York","state":"NY","zip":"10011"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Real Property 15: 61 Gold St, New York, NY
INSERT OR REPLACE INTO buildings (id, name, slug, description_public, address_json, amenities_public, gallery, publication_state, created_at, updated_at)
VALUES (
  'build-financial',
  '61 Gold St - NYC',
  '61-gold-st',
  NULL,
  '{"street":"Gold","city":"New York","state":"NY","zip":"10003"}',
  '[]',
  '[]',
  'published',
  datetime('now'),
  datetime('now')
);

-- Delete units that reference non-existent buildings
DELETE FROM units WHERE building_id NOT IN (SELECT id FROM buildings);
