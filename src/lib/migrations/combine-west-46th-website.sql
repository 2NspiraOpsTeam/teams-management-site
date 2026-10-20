-- Scoped, additive website consolidation requested 2026-10-19.
-- Apply only to the approved preview database after saving the three source records.
-- No tenant/unit identities, source assignments, assets or archived records are removed.
-- Preserve the combined record's existing cover and gallery order; append approved split photos.
INSERT OR IGNORE INTO media_assignments(id,asset_id,building_id,unit_id,is_cover,order_index,alt_text,caption)
SELECT 'combine-west46-'||m.id,m.asset_id,'real-349-351-w-46th-st',NULL,0,
  1000+ROW_NUMBER() OVER (ORDER BY m.building_id,m.order_index,m.created_at,m.id),m.alt_text,m.caption
FROM media_assignments m JOIN media_assets a ON a.id=m.asset_id
JOIN media_publications p ON p.assignment_id=m.id AND p.published=1
WHERE m.building_id IN ('real-349-w-46th-st','real-351-w-46th-st')
AND m.unit_id IS NULL AND a.visibility='public' AND a.file_type LIKE 'image/%'
AND EXISTS(SELECT 1 FROM buildings WHERE id='real-349-351-w-46th-st' AND publication_state!='archived')
AND NOT EXISTS(SELECT 1 FROM media_assignments target WHERE target.building_id='real-349-351-w-46th-st' AND target.asset_id=m.asset_id AND target.unit_id IS NULL);

INSERT OR IGNORE INTO media_publications(assignment_id,published)
SELECT id,1 FROM media_assignments WHERE building_id='real-349-351-w-46th-st' AND id LIKE 'combine-west46-%';

INSERT OR IGNORE INTO media_presentation_gallery(building_id,context,asset_id,order_index,kind)
SELECT m.building_id,'residential',m.asset_id,m.order_index,'interior'
FROM media_assignments m WHERE m.building_id='real-349-351-w-46th-st' AND m.id LIKE 'combine-west46-%';

UPDATE media_presentation_settings SET revision=revision+1,mutation_token='combine-west46-20261019'
WHERE building_id='real-349-351-w-46th-st' AND context='residential' AND mutation_token!='combine-west46-20261019';

UPDATE buildings SET retail_published=1,updated_at=datetime('now')
WHERE id='real-349-351-w-46th-st' AND has_retail=1 AND publication_state!='archived' AND retail_published=0;
