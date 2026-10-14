#!/usr/bin/env bash
set -euo pipefail
qa_state_dir="$(mktemp -d /tmp/teams-d1-qa.XXXXXX)"
media_schema_file="$qa_state_dir/media-schema-only.sql"
# media-management.sql contains preview data inserts; local QA starts with schema only.
sed '/^INSERT /,$d' src/lib/migrations/media-management.sql > "$media_schema_file"
for schema_file in \
  src/lib/migrations/schema.sql \
  "$media_schema_file" \
  src/lib/migrations/tenant-portal.sql \
  src/lib/migrations/work-orders-mvp.sql \
  src/lib/migrations/media-read-indexes.sql \
  src/lib/migrations/add-inquiry-details.sql \
  src/lib/migrations/rental-inquiry-handoff.sql \
  src/lib/migrations/retail-management.sql \
  src/lib/migrations/retail-profiles.sql \
  src/lib/migrations/page-showcase.sql \
  src/lib/migrations/add-building-map-fields.sql \
  src/lib/migrations/dining-venues.sql \
  src/lib/migrations/dining-card-image.sql \
  src/lib/migrations/dining-client-images.sql \
  src/lib/migrations/dining-venue-photos.sql \
  src/lib/migrations/media-presentation-contexts.sql; do
  npx wrangler d1 execute teams-database-dev --local --persist-to "$qa_state_dir" --file "$schema_file" >/dev/null
done
printf 'Isolated local D1 ready: %s\n' "$qa_state_dir"
printf 'Use --local --persist-to %s for repeatable QA; never --remote.\n' "$qa_state_dir"
