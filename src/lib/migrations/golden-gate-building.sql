-- Building identity cleanup for the shared Teams preview only.
-- Stable ID preserves media, tenant and operational relationships. Publication state is unchanged.
-- Previous row: name='609 Golden Gate Point, Unit 402', slug='609-golden-gate-pt-unit-402',
-- street='609 Golden Gate Point, Unit 402'; description_public=NULL. City/state/ZIP are retained.
UPDATE buildings
SET name = '609 Golden Gate Pt',
    slug = '609-golden-gate-pt',
    address_json = json_set(address_json, '$.street', '609 Golden Gate Point'),
    description_public = 'The Pearl is a condominium building at 609 Golden Gate Point in Sarasota, Florida, near the waterfront and downtown Sarasota.',
    updated_at = datetime('now')
WHERE id = '7a0d4a54-1fcc-4470-a557-00e077040d1a'
  AND slug IN ('609-golden-gate-pt-unit-402', '609-golden-gate-pt');
