-- Private operations_properties metadata, intentionally not on buildings/public projections.
-- Optional values preserve unknowns; counts describe source property totals, not occupancy.
ALTER TABLE operations_properties ADD COLUMN year_purchased TEXT;
ALTER TABLE operations_properties ADD COLUMN tax_block TEXT;
ALTER TABLE operations_properties ADD COLUMN tax_lot TEXT;
ALTER TABLE operations_properties ADD COLUMN apartment_count INTEGER CHECK(apartment_count IS NULL OR (typeof(apartment_count)='integer' AND apartment_count BETWEEN 0 AND 100000));
ALTER TABLE operations_properties ADD COLUMN store_count INTEGER CHECK(store_count IS NULL OR (typeof(store_count)='integer' AND store_count BETWEEN 0 AND 100000));
ALTER TABLE operations_properties ADD COLUMN floor_count INTEGER CHECK(floor_count IS NULL OR (typeof(floor_count)='integer' AND floor_count BETWEEN 0 AND 1000));
ALTER TABLE operations_properties ADD COLUMN stabilization_summary TEXT;
