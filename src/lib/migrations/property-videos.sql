-- PropertyVideoRow in property-videos.ts. Additive, separate from photo covers/galleries.
-- Originals remain in owner-managed Google Drive; never store videos in D1 BLOBs.
CREATE TABLE IF NOT EXISTS property_videos (
 id TEXT PRIMARY KEY,
 building_id TEXT NOT NULL REFERENCES buildings(id),
 unit_id TEXT REFERENCES units(id),
 source_url TEXT NOT NULL,
 title TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 transcript TEXT NOT NULL DEFAULT '',
 poster_asset_id TEXT REFERENCES media_assets(id),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
 public_access_verified INTEGER NOT NULL DEFAULT 0 CHECK(public_access_verified IN (0,1)),
 order_index INTEGER NOT NULL DEFAULT 0 CHECK(order_index>=0),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(building_id,source_url)
);
CREATE INDEX IF NOT EXISTS property_videos_building_public ON property_videos(building_id,published,order_index);
