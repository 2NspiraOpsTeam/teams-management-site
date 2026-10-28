-- Add a distinct licensed editorial image to the existing Dining Media Library model.
-- Daniel (@unsplashbydan), free Unsplash License, 8 May 2022:
-- https://unsplash.com/photos/pizzas-on-plates-on-a-table-JcTGyFY6lWk
INSERT OR IGNORE INTO media_assets (id,storage_key,file_type,checksum,provenance,visibility,uploaded_by,alt_text,caption)
VALUES ('dining-lifestyle-table-02','/dining/pizzas-on-table-unsplash.jpg','image/jpeg','unsplash-daniel-JcTGyFY6lWk','unsplash-license-free-daniel','public','migration','Pizzas arranged on a table','Illustrative dining photography');
UPDATE dining_venues SET hero_media_asset_id='dining-lifestyle-table-02',updated_at=datetime('now')
WHERE id='dining-delizia-73' AND hero_media_asset_id='dining-lifestyle-pizza-01';
