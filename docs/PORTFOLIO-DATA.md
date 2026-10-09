# Phase 1 portfolio source of truth

The fifteen addresses supplied by Jeffrey on 2026-10-08 are canonical. Stable D1 IDs and slugs are recorded in `src/lib/migrations/seed-data.sql`. `canonical-portfolio-phase1.sql` reconciles the earlier development database once, preserving those IDs; re-running it does not duplicate records or overwrite subsequent editorial changes. The older draft migrations are intentionally inert because they contained unverified details.

Only address and portfolio membership are verified. ZIP, neighborhood, description, amenities, unit counts/status, ownership, history, service claims, and media are not supplied. All fifteen records remain Draft until content and media are reviewed. The previous `build-005` QA record is archived and excluded from the default Admin list. Sample units, layouts, and media assignments from the original development seed were removed from preview D1.

The public API lists only published records. Admin building search defaults to non-archived records; `include_archived=1` exposes archived QA records to authorized Admins. Publication is server-blocked until approved content and media are available. No production dataset or site was changed.
