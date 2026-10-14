-- D1 read reduction: correlated media-library lookups by asset ID.
CREATE INDEX IF NOT EXISTS idx_media_assignments_asset_building_unit ON media_assignments(asset_id,building_id,unit_id);
CREATE INDEX IF NOT EXISTS idx_media_home_assignments_asset ON media_home_assignments(asset_id);
-- Public property galleries filter by building and unit scope.
CREATE INDEX IF NOT EXISTS idx_media_assignments_building_unit_order ON media_assignments(building_id,unit_id,order_index);
