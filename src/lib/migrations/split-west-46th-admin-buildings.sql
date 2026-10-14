-- Split the Admin destinations without guessing ownership of the combined record's media or units.
-- The former record remains archived with its existing assignments for later review.
INSERT OR IGNORE INTO buildings (id,name,slug,address_json,amenities_public,gallery,publication_state,has_retail,retail_status,retail_published)
VALUES ('real-349-w-46th-st','349 W 46th St','349-w-46th-st','{"street":"349 W 46th St","city":"New York","state":"NY","zip":"10036"}','[]','[]','draft',1,'commercial_component',0);
INSERT OR IGNORE INTO buildings (id,name,slug,address_json,amenities_public,gallery,publication_state,has_retail,retail_status,retail_published)
VALUES ('real-351-w-46th-st','351 W 46th St','351-w-46th-st','{"street":"351 W 46th St","city":"New York","state":"NY","zip":"10036"}','[]','[]','draft',1,'commercial_component',0);
UPDATE buildings SET publication_state='archived',retail_published=0,updated_at=datetime('now')
WHERE id='real-349-351-w-46th-st' AND slug='349-351-w-46th-st'
  AND EXISTS (SELECT 1 FROM buildings WHERE id='real-349-w-46th-st' AND slug='349-w-46th-st')
  AND EXISTS (SELECT 1 FROM buildings WHERE id='real-351-w-46th-st' AND slug='351-w-46th-st');
