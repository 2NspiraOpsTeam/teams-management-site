#!/usr/bin/env bash
set -euo pipefail
qa_state_dir="$(mktemp -d /tmp/teams-d1-qa.XXXXXX)"
media_schema_file="$qa_state_dir/media-schema-only.sql"
# media-management.sql contains preview data inserts; local QA starts with schema only.
sed '/^INSERT /,$d' src/lib/migrations/media-management.sql > "$media_schema_file"
for schema_file in src/lib/migrations/schema.sql "$media_schema_file" src/lib/migrations/tenant-portal.sql src/lib/migrations/media-read-indexes.sql; do
  npx wrangler d1 execute teams-database-dev --local --persist-to "$qa_state_dir" --file "$schema_file" >/dev/null
done
printf 'Isolated local D1 ready: %s\n' "$qa_state_dir"
printf 'Use --local --persist-to %s for repeatable QA; never --remote.\n' "$qa_state_dir"
