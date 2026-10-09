-- Optional commercial details. No field becomes public merely because it is populated.
CREATE TABLE IF NOT EXISTS retail_profiles (
 building_id TEXT PRIMARY KEY REFERENCES buildings(id),
 retail_summary TEXT, retail_square_feet INTEGER, retail_floor TEXT, storefront_frontage TEXT,
 ceiling_height TEXT, corner_location TEXT, street_exposure TEXT, basement_storage TEXT,
 venting TEXT, gas_available TEXT, electrical_notes TEXT, accessibility_notes TEXT,
 loading_notes TEXT, signage_notes TEXT, approved_uses TEXT, transit_notes TEXT,
 retail_availability_status TEXT, retail_contact_notes TEXT, tenant_website TEXT,
 retail_brochure_asset_id TEXT, retail_floorplan_asset_id TEXT,
 published_fields_json TEXT NOT NULL DEFAULT '[]', provenance_json TEXT NOT NULL DEFAULT '{}',
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS retail_media_approvals (
 building_id TEXT NOT NULL REFERENCES buildings(id), asset_id TEXT NOT NULL REFERENCES media_assets(id),
 kind TEXT NOT NULL CHECK(kind IN ('exterior','storefront','interior','streetscape','floorplan')),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)), order_index INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(building_id,asset_id)
);
