-- Query teams-database-dev to verify actual D1 records

-- 1. Total buildings by publication state
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN publication_state = 'published' THEN 1 ELSE 0 END) as published_count,
  SUM(CASE WHEN publication_state = 'draft' THEN 1 ELSE 0 END) as draft_count,
  SUM(CASE WHEN publication_state = 'archived' THEN 1 ELSE 0 END) as archived_count
FROM buildings;

-- 2. Specific properties verification
SELECT id, name, slug, address_json, latitude, longitude, geocode_status, gallery
FROM buildings 
WHERE name IN ('166 E 118th St', '170 E 118th St', '3425 East Tremont Ave')
ORDER BY name;

-- 3. All published buildings for portfolio preview
SELECT id, name, slug, address_json, latitude, longitude, geocode_status
FROM buildings 
WHERE publication_state = 'published'
ORDER BY name;
