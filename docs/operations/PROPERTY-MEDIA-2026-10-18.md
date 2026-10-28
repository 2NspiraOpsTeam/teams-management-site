# Property source media and video curation — 18 October 2026

## Scope

Website media only. No lease, tenant, billing, storage-service activation, or production changes.

- Added 110 unique photos from the owner-supplied 307 W 39th Street source archive (115 image files before exact duplicate removal) through the authenticated media-upload API. Originals remain unchanged. Apartment folders are matched to existing unit records. Unresolved floor-only / neighborhood / edited material remains marked for review.
- Added three owner-supplied 225 E 83rd Street entrance/front photos from Downloads, including the supplied edited entrance option. All new photos are internal with unpublished assignments; existing covers and publication selections are preserved.
- Video originals stay in the owner's existing Google Drive. The new video library stores links, titles, descriptions, apartment associations, optional posters, optional transcripts, order and explicit publication selection. It does not copy large videos into D1 or change Drive sharing permissions. No new paid hosting provider.
- Source inventory contains 18 video files / 16 distinct byte contents. Exact duplicates are retained in the private source manifest rather than duplicated in the curated library.

## Controls and publication

Property Admin → Media / Gallery → Review video tours. Add/edit/clear/cancel are explicit; new entries are private. Save is guarded against duplicate activation, and a unique per-property source link protects retries. Google Drive file URLs are normalized and allowlisted; arbitrary iframe URLs are rejected. Unit and poster associations must belong to the selected property and apartment. A published poster also needs public eligibility and an approved assignment. Changing a source link clears playback confirmation and publication selection.

Before selecting a video for the website, check its playback signed out of Google; the app never changes Drive permissions. For narrated tours, provide captions in Drive and a transcript in the library. Selected tours appear in a separate Video tours section, with apartment labels, optional posters, click-to-load player, close/unload, and an external Drive fallback. Only one video is mounted at a time. No autoplay or background audio. Draft videos never enter the public projection, and private/unapproved posters are withheld.

The property-page video query uses the canonical D1 building ID, not the preview fixture ID. The existing page-level property publication/preview gate is retained. Photo covers, galleries and apartment sections are unchanged. Admin photo thumbnails now lazy-load to avoid loading the entire imported library at once.

## Schema and recovery

Additive `src/lib/migrations/property-videos.sql` creates `property_videos` and its index. A fresh export after the source-photo uploads was fully restored locally: 63 pre-change tables, exact schema/content match, integrity `ok`, zero foreign-key violations. The existing pending `init-schema.sql` was not bulk-applied. Only the new video statements were scoped to Waterbear development, recorded as `property-videos.sql` in the existing ledger. Existing building / asset / assignment counts were preserved by the schema change.

Private originals, source manifests, database export and QA evidence are outside this public repository. The prior Worker version remains the code rollback point; the additive table is compatible with the previous application. Local restore verification is not off-device disaster recovery.

## Validation

- 239 tests in 30 suites passed, including video URL restrictions, anonymous/origin denial, cross-property unit/poster rejection, duplicate retry handling, publication/unpublication, private-poster withholding and oversized requests.
- Typecheck and Next/OpenNext builds are checked separately from rendered behavior.
- New-photo assignment counts, internal visibility and unpublished states were reread from development. Authenticated preview retrieval returned JPEG; anonymous retrieval of draft samples returned 404.
- Rendered and release evidence is recorded in the final verification update; test-only video selection occurs only in an isolated local database, never on the development property's public page.
