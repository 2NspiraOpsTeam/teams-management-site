-- Additive retail publication controls. Presence does not imply vacancy or active leasing.
ALTER TABLE buildings ADD COLUMN has_retail INTEGER NOT NULL DEFAULT 0 CHECK(has_retail IN (0,1));
ALTER TABLE buildings ADD COLUMN retail_status TEXT NOT NULL DEFAULT 'unknown' CHECK(retail_status IN ('active','commercial_component','planned','none','unknown'));
ALTER TABLE buildings ADD COLUMN retail_notes TEXT;
ALTER TABLE buildings ADD COLUMN retail_published INTEGER NOT NULL DEFAULT 0 CHECK(retail_published IN (0,1));
UPDATE buildings SET has_retail=1,retail_status='commercial_component',retail_published=1 WHERE slug IN ('42-70-156th-st-flushing','3425-east-tremont-bronx','166-e-118th-st','170-e-118th-st','173-e-91st-st','1626-2nd-ave','225-e-83rd-st','171-e-74th-st','1374-1st-ave','1365-1st-ave','41-w-46th-st','349-351-w-46th-st','307-w-39th-st','235-w-18th-st');
UPDATE buildings SET has_retail=1,retail_status='planned',retail_published=1 WHERE slug='61-gold-st';
UPDATE buildings SET has_retail=0,retail_status='none',retail_published=0 WHERE slug='71-e-110th-st';
CREATE INDEX IF NOT EXISTS idx_buildings_retail_public ON buildings(has_retail,retail_published,retail_status);
