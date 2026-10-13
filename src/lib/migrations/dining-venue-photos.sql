-- Ordered, reusable public media for each dining destination.
CREATE TABLE IF NOT EXISTS dining_venue_photos (
  venue_id TEXT NOT NULL REFERENCES dining_venues(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES media_assets(id),
  position INTEGER NOT NULL,
  PRIMARY KEY (venue_id, asset_id),
  UNIQUE (venue_id, position)
);
CREATE INDEX IF NOT EXISTS idx_dining_venue_photos_order ON dining_venue_photos(venue_id, position);

-- Preserve the existing featured image as the first slide; add Jeffrey's supplied interior.
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by,alt_text,caption)
VALUES ('dining-delizia-client-interior-04','/dining/delizia-73-interior-client.jpg','image/jpeg','client-delizia-interior-2026-10-12','client-supplied-jeffrey-2026-10-12','public','migration','Guests and staff inside Delizia 73',NULL);
INSERT OR IGNORE INTO dining_venue_photos (venue_id,asset_id,position)
SELECT id,hero_media_asset_id,0 FROM dining_venues WHERE hero_media_asset_id IS NOT NULL;
INSERT OR IGNORE INTO dining_venue_photos (venue_id,asset_id,position)
SELECT id,'dining-delizia-client-interior-04',1 FROM dining_venues WHERE id='dining-delizia-73';
