-- Additive presentation assignments. Source assets, property approvals and unit scope remain unchanged.
-- Legacy migrations are not replayed; apply this file alone after schema inspection.
CREATE TABLE IF NOT EXISTS media_presentation_settings (
 building_id TEXT NOT NULL REFERENCES buildings(id),
 context TEXT NOT NULL CHECK(context IN ('residential','retail')),
 cover_asset_id TEXT REFERENCES media_assets(id),
 fallback_to_property_cover INTEGER NOT NULL DEFAULT 0 CHECK(fallback_to_property_cover IN (0,1)),
 revision INTEGER NOT NULL DEFAULT 0,
 mutation_token TEXT NOT NULL DEFAULT '',
 PRIMARY KEY(building_id,context)
);
CREATE TABLE IF NOT EXISTS media_presentation_gallery (
 building_id TEXT NOT NULL,
 context TEXT NOT NULL,
 asset_id TEXT NOT NULL REFERENCES media_assets(id),
 order_index INTEGER NOT NULL CHECK(order_index>=0),
 kind TEXT NOT NULL DEFAULT 'exterior' CHECK(kind IN ('exterior','storefront','interior','streetscape','floorplan')),
 PRIMARY KEY(building_id,context,asset_id),
 FOREIGN KEY(building_id,context) REFERENCES media_presentation_settings(building_id,context)
);
-- Preserve current public presentation; do not copy bytes or change existing approvals.
INSERT OR IGNORE INTO media_presentation_settings(building_id,context,cover_asset_id,mutation_token)
 SELECT b.id,'residential',(SELECT m.asset_id FROM media_assignments m WHERE m.building_id=b.id AND m.unit_id IS NULL AND m.is_cover=1 LIMIT 1),'legacy-seed' FROM buildings b;
INSERT OR IGNORE INTO media_presentation_settings(building_id,context,fallback_to_property_cover,mutation_token)
 SELECT id,'retail',1,'legacy-seed' FROM buildings;
INSERT OR IGNORE INTO media_presentation_gallery(building_id,context,asset_id,order_index)
 SELECT m.building_id,'residential',m.asset_id,m.order_index FROM media_assignments m
 JOIN media_publications p ON p.assignment_id=m.id AND p.published=1
 JOIN media_assets a ON a.id=m.asset_id AND a.visibility='public' AND a.file_type LIKE 'image/%'
 JOIN media_presentation_settings s ON s.building_id=m.building_id AND s.context='residential' AND s.mutation_token='legacy-seed'
 WHERE m.unit_id IS NULL;
INSERT OR IGNORE INTO media_presentation_gallery(building_id,context,asset_id,order_index,kind)
 SELECT r.building_id,'retail',r.asset_id,r.order_index,r.kind FROM retail_media_approvals r
 JOIN media_presentation_settings s ON s.building_id=r.building_id AND s.context='retail' AND s.mutation_token='legacy-seed' WHERE r.published=1;
UPDATE media_presentation_settings SET mutation_token='seeded' WHERE mutation_token='legacy-seed';
