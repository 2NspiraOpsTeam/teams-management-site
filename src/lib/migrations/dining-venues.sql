-- Additive Dining model for the existing Teams D1 database.
CREATE TABLE IF NOT EXISTS dining_venues (
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
CREATE INDEX IF NOT EXISTS idx_dining_public ON dining_venues(publication_state,display_order);
CREATE INDEX IF NOT EXISTS idx_dining_property ON dining_venues(property_id,publication_state);

-- Postal code is confirmed by the restaurant's official address.
UPDATE buildings SET address_json=json_set(address_json,'$.zip','10021') WHERE slug='1374-1st-ave';

-- Free-use Unsplash License, Vitaly Gariev, 24 July 2025; illustrative, NOT Delizia photography.
-- https://unsplash.com/photos/friends-enjoy-pizza-and-conversation-at-a-restaurant-LFZT-UlvWVg
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by,alt_text,caption)
VALUES ('dining-lifestyle-pizza-01','/dining/people-sharing-pizza-unsplash.jpg','image/jpeg','unsplash-vitaly-gariev-LFZT-UlvWVg','unsplash-license-free-vitaly-gariev','public','migration','Friends sharing pizza at a restaurant','Illustrative dining photography');

INSERT OR IGNORE INTO dining_venues (id,name,slug,property_id,summary,category,neighborhood,website_url,menu_url,reservation_url,ordering_url,phone,hero_media_asset_id,publication_state,display_order)
SELECT 'dining-delizia-73','Delizia 73','delizia-73',id,
  'Italian favorites, from pizza and pasta to relaxed dinners, at a neighborhood address on First Avenue.',
  'Italian restaurant','Upper East Side','https://delizia73.com/','https://delizia73.com/food-menu','https://delizia73.com/reservations','https://www.delizia73togo.com/ny1374/menu.php','(212) 517-8888','dining-lifestyle-pizza-01','published',0
FROM buildings WHERE slug='1374-1st-ave';
