-- Optional Admin property ownership label; NULL retains the preserved source label.
-- Empty string explicitly clears a prior label. Property revision and audit protect edits.
ALTER TABLE operations_properties ADD COLUMN llc_name TEXT CHECK(llc_name IS NULL OR length(llc_name)<=240);
