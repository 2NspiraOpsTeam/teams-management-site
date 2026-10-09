-- Additive map metadata. Leave coordinates empty until independently verified.
ALTER TABLE buildings ADD COLUMN latitude REAL;
ALTER TABLE buildings ADD COLUMN longitude REAL;
ALTER TABLE buildings ADD COLUMN geocode_status TEXT;
ALTER TABLE buildings ADD COLUMN map_verified INTEGER NOT NULL DEFAULT 0;
