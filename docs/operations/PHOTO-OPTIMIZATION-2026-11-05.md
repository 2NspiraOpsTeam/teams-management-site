# Property photo optimization — November 5, 2026

## Verified live cleanup

Audited 365 media records and all application table text references (excluding historical audit snapshots), property/unit assignments, context covers/galleries, home/page showcases, dining, retail and video posters, plus source references. Removed 13 public, entirely unreferenced assets and their 13 stored objects. Private libraries, unpublished assigned photos and security fixtures were retained.

Original bytes, metadata, before/after SQL and exact SQLite restoration rehearsal are retained privately outside Git. Deletion was rehearsed with FK enforcement; the remote operation rechecked all discovered reference surfaces and unchanged asset identity. D1 requires balanced boolean trees for these cross-table checks (maximum expression depth is lower than desktop SQLite). An initial depth-limit rejection left the database unchanged; persisted state was checked before the corrected operation.

Removed payload: 4,291,763 bytes; removed encoded D1 text: 5,722,372 bytes. Allocated database shrinking and billing reductions are not established. Fresh export has 352 assets and 242 objects, intact schema, integrity OK and no FK violations. All tables match the rehearsed cleanup except concurrent owner gallery/settings changes and their audit records; those owner changes were preserved, never overwritten. No assignments or publication rows were deleted by cleanup.

Scoped live browser checks passed on Properties desktop, Gold Street mobile, and Retail tablet, with visible photos decoded and no page errors. Authenticated Admin media rendering and a complete portfolio sweep are not verified.

## Prepared release (not published)

The existing responsive delivery already covers earlier published photography. Added 120 checksum-verified WebP renditions for 24 newly published public photos, with no upscaling, no content edits and unchanged original bytes, media IDs, source checksums, assignments, selected covers, captions or gallery order. Reuses existing authorization/version checks and blocked derivative namespace. No dependencies or paid services added.

New-source total: 17,246,236 bytes. The 960px rendition set totals 7,887,744 bytes (54.3% smaller). This is a size comparison, not measured page speed or billing. Display copies use quality-90 WebP encoding; they are not mathematically lossless. Four side-by-side rendered samples were visually reviewed with no visible loss at the inspected website size. Full-quality originals remain available unchanged. All 120 new renditions decoded locally.

Archived 134 generated files absent from the authoritative rendition manifest and other source/static references (9,780,930 bytes). These removals affect the next source/build, not existing immutable deployments. New renditions add artifact bytes; do not claim a net deployment-size reduction from the archived-file subtotal.

Lossless JPEG/PNG candidates were also evaluated locally: 122 retained sources could save 1,973,619 bytes with exact decoded pixels. Their live original bytes were deliberately not replaced, avoiding checksum/version invalidation and retaining original provenance. These experimental savings are not claimed as live savings.

Production build passed the 1,466-rendition staging/checksum gate. Full test suite: 548 tests passed. Production publication remains separate and requires concrete owner release approval under repository AGENTS.md.

## Recovery limits

Exact source SQL restored locally, then independently copied and compared using typed per-table/schema fingerprints with clean integrity/FK checks. The generic bounded restore generator cannot concatenate a long CHECK(json_valid(...)) field through invalid intermediate JSON; its failed rehearsal is not used as recovery proof. Original export plus verified exact local database backup are retained. Cloud restoration and off-device recovery are not established.
