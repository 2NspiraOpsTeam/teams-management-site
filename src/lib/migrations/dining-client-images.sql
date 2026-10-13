-- Use the two images Jeffrey supplied for the Dining preview on 2026-10-12.
-- The hero is a static page asset; the featured venue image remains Admin-manageable.
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by,alt_text,caption)
VALUES ('dining-delizia-client-pizza-03','/dining/delizia-73-pizza-client.jpg','image/jpeg','ec293951e26fa3bdfd64e17159817dfaf82a50ada13cdf084354d0a8f72bcce1','client-supplied-jeffrey-2026-10-12','public','migration','Pizza and other dishes on display',NULL);

UPDATE dining_venues SET hero_media_asset_id='dining-delizia-client-pizza-03',updated_at=datetime('now')
WHERE id='dining-delizia-73' AND hero_media_asset_id='dining-lifestyle-table-02';
