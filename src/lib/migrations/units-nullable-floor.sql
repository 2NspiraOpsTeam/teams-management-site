-- Preserve all apartment IDs, references, rows and indexes while allowing unknown floors.
-- Requires a verified backup and validated atomic D1 execution with deferred FKs.
PRAGMA defer_foreign_keys=ON;
CREATE TABLE units_floor_preserved AS SELECT * FROM units;
CREATE TABLE units_nullable_floor (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_identifier TEXT NOT NULL,
    floor_number INTEGER,
    layout_id TEXT REFERENCES layouts(id),
    status TEXT DEFAULT 'available_internal',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
DROP TABLE units;
ALTER TABLE units_nullable_floor RENAME TO units;
INSERT INTO units SELECT * FROM units_floor_preserved;
DROP TABLE units_floor_preserved;
CREATE INDEX idx_units_building_status ON units(building_id, status);
CREATE INDEX idx_units_status ON units(building_id, status);
CREATE UNIQUE INDEX operations_unit_identifier_unique ON units(building_id,upper(trim(unit_identifier)));
CREATE INDEX operations_unit_lookup ON units(building_id,unit_identifier COLLATE NOCASE,id);
CREATE INDEX operations_unit_name ON units(unit_identifier COLLATE NOCASE,id);
