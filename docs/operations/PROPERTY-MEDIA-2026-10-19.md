# Property media management — 19 October 2026

## Release and source

- Website: https://teams-management-preview.pages.dev/admin/media (Admin → Media & content → Website Photos).
- Source base: `964dc9a` on `feat/website-content-20261019`, the actual serving direct-save baseline; this change does not reconcile or merge main.
- Application: `d553897` on `fix/property-media-management-20261019`.
- Private runtime: `teams-media-20261019`; active version `28ac64ec-d081-4ea5-976c-d83e0de100b9` at 100%.
- Served release: `d553897-property-media-20261019`.
- Candidate gateway: https://78e8c9fe.teams-management-preview.pages.dev .
- Stable gateway: `e97dcb11-4007-4500-bd5d-41cb9b265f24`, https://e97dcb11.teams-management-preview.pages.dev .
- Pages remains direct-upload, primary branch `preview`, Pages Production environment. This is the development preview, not client production. Existing encrypted configuration and D1 bindings were preserved. Waterbear and client-production domains were not changed.

## Diagnosis and repair

The owner-uploaded Gold Street twilight skyline image was public-eligible and deliverable, but associated with 609 Golden Gate Point, Sarasota, rather than 61 Gold Street, New York. It was selected as Sarasota's Retail cover; Sarasota has no public Retail page. No Gold Street association or gallery membership existed for that source.

Using the existing authorized Admin API, the same source was associated with 61 Gold Street, approved, and appended to its Residential and Retail galleries. Neither current Gold cover was replaced, existing gallery order was retained, no image bytes were copied, and the original Sarasota association/selection was left intact under the owner's preservation instruction.

## Admin changes

- A property/address overview shows separate Residential/Retail cover thumbnails and gallery counts, with direct section links. A property without a Retail website page is identified explicitly.
- Property pages display the full street/city/state and section navigation, plus website links.
- Each context retains independent Save/Cancel, revision conflicts, disabled in-flight actions and duplicate-click guards. Galleries support adding existing photos, replacement in place, removal without deleting the source, and reorder.
- Optional upload gallery destinations add one approved building-wide source to either/both galleries, preserving covers and previous gallery order. Repeated duplicate uploads do not duplicate membership; stale editors conflict instead of erasing the appended image. Apartment destinations cannot be added to building-wide galleries.
- Source inventory now paginates rather than silently stopping at 300 records, and identifies cover/gallery usage. Source approval is no longer described as proof of public gallery placement.
- Legacy source-order movement is hidden for building-wide photos, whose gallery order is controlled above. Apartment neighbor swaps are scoped to the same unit and saved in a D1 batch.

## Existing website-file reconciliation

The exact additive `existing-website-photos.sql` file was applied, without replaying unrelated migrations. It registers 19 existing Sarasota files and 10 existing Apartment 1B/PHA files at 71 East 110th Street. Files remain at their existing URLs, with the approved captions; no re-upload or byte duplication occurred. Apartment-only images remain unit-scoped and appear in clearly labeled apartment galleries, not cover/showcase candidates.

One-shot import markers prevent reruns from resurrecting photos an admin later removes. Sarasota's public directory/detail/featured cover and gallery now resolve through the same Admin selections, not an overriding hard-coded image list. The unrelated decorative page banners and neighborhood-attribution illustrations remain part of the approved design; this change concerns property covers, galleries, apartment photos and their existing media controls.

## Verification

- 32 test files / 255 tests passed, TypeScript passed, OpenNext preview Worker build passed.
- Local D1/browser: save/cancel/refresh; independently changed covers; reorder/replace/remove; both-direction context isolation; source reuse; duplicate Save click; authenticated upload to both galleries with automatic editor refresh; public image decoding; invalid foreign-property selection; clear/empty public state; backend failure retaining edits; failed load/Retry; stale-editor conflict; origin and anonymous denial.
- Candidate: intended release and authenticated editor/overview, prefilled selections, desktop/tablet/mobile overflow/screenshots, no page errors, Website Content direct-save regression.
- Stable: Gold image decoded on Residential and Retail public routes and in both Admin galleries after refresh; all 19 Sarasota photos editable and publicly retained; both apartment sets visible and unit-scoped; inventory Load more returned additional unique assets; desktop/tablet/mobile editor and overview; no page errors; Website Content preserved.
- Hosted repair exercised the real authenticated assignment/approval and section-save APIs. Broader destructive/reorder/clear/error mutation QA used isolated local fixtures, not other real properties. Fresh emailed OTP was not repeated; the existing authorized Admin session was reused.
- Exact before/after comparison: all 312 original asset rows, 296 original assignment rows, 186 original publications, 175 original gallery rows/order and existing cover selections were preserved. Final totals: 341 assets, 326 assignments, 216 publications, 42 settings, 196 gallery entries. No original image object was deleted or modified.

## Recovery

The prior gateway/runtime pair remains available: Pages `59ba3e0c-980b-4ce4-9ca1-a36633b25277`, runtime `teams-content-simple-20261019`, version `1a0ae67c-b80c-44a8-9055-572e89ddd535`. Private metadata snapshots, source evidence, release configuration and rendered evidence are retained outside public Git.

Do not restore an entire database to undo this additive change or erase later Admin edits. The old application still supplies static Sarasota/apartment arrays: before rolling its runtime back, selectively unpublish only unchanged newly imported file associations (identified by `website-import` / `existing-approved-website-photo`) to avoid duplicate old-array plus database rendering; retain their files and metadata. Preserve the separately authorized Gold correction and any later owner edits. Restore the matching known-good gateway/runtime pair, then verify public imagery and authenticated media controls. Candidate/stable gateway URLs reference mutable service runtimes; record the runtime version as well as the gateway ID.

## Visual gallery / cover checkboxes — follow-up

- Application `30802ce` replaces the building-wide approval-plus-dropdown workflow with actual photo cards. Each card has independent **Residential**, **Residential Cover**, **Retail**, and **Retail Cover** checkboxes. A cover checkbox replaces that section's previous cover; cover-only selections remain independent of gallery membership. Existing fallback covers are shown checked. Gallery order remains editable with thumbnail rows.
- A single sticky **Save Changes** action saves both sections atomically with a joint revision check. Selection is the explicit publication action: chosen sources become public-eligible and their building-wide associations are published in the same transaction. Merely opening the inventory does not publish anything. Unchecking removes only the selected presentation use, never the file or other section. Unselected private sources and apartment assignments remain untouched.
- Admin selection inventory includes associated, non-archived, deliverable building-wide photos without requiring prior approval. Apartment, foreign-property, archived and undeliverable sources are excluded from this selector. The legacy authenticated save contract and public publication gates remain intact. Saving photo details without a visibility change preserves the current visibility, including after a gallery save.
- Upload destinations now use Residential / Retail checkboxes directly without a separate approval checkbox. Apartment upload controls remain scoped to the selected apartment. Existing covers/order are retained on upload. No schema migration or hosted data repair was needed for this release.
- Private runtime: `teams-photo-checks-20261019`, version `841e6ad0-41d2-4119-9e95-433eef7a109e`, verified at 100%; release fingerprint `30802ce-photo-checkboxes-20261019`.
- Candidate gateway: `23603062-fc6a-46c7-ac86-3cf6a0c51636`, https://23603062.teams-management-preview.pages.dev .
- Stable gateway: `6ed19871-db18-418a-9eca-e8e53de2447d`, https://6ed19871.teams-management-preview.pages.dev ; canonical https://teams-management-preview.pages.dev . Pages primary branch remains `preview`; variables, write-only secrets and D1 bindings were preserved through selective service-binding changes. Client production and Waterbear were not changed.
- Verification: 259 tests / 32 files, TypeScript, OpenNext preview Worker build, local rendered desktop/tablet/mobile checks, local synthetic save/publication round-trips, exclusive/independent covers, cancel, refresh, gallery reorder/removal, empty state, double-click suppression, backend failure/retry, load recovery, stale revision conflict, origin/foreign-property/duplicate-context denial, upload to both galleries, metadata save retaining publication, and decoded public Residential/Retail images. Candidate and stable rendered checks verified 37 available 307 property-photo cards with four checkboxes, saved selections, change/cancel, normal refresh, responsive layout, overview and Website Content regression; stable 307 Residential and Gold Residential/Retail images decoded with no browser errors. Both immutable gateways returned the intended fingerprint. Hosted real-photo mutations were not used for QA; fresh OTP was not repeated.
- Exact remote metadata comparison before/after release: all 341 assets, 326 assignments, 238 publications, 42 settings and 196 gallery entries unchanged. New approval-free selection did not bulk-publish any sources. Private evidence is stored outside Git under the existing media-management evidence directory, `checkbox-*` files.
- Recovery pair: prior gateway `e97dcb11-4007-4500-bd5d-41cb9b265f24` and untouched runtime `teams-media-20261019`, version `28ac64ec-d081-4ea5-976c-d83e0de100b9`. This code-only follow-up requires no database restoration; preserve all later admin edits. Its schema-compatible selections can be read by the preceding runtime.
- Video library behavior was inspected separately: property-page videos are rendered in **Video tours**, not the photo slideshow. A read-only live check found all 16 existing 307 videos private/unverified. No videos were published and signed-out playback was not verified in this follow-up.

## Retail slideshow follow-up — 19 October 2026

- Application `2f71387d910d86c4a5233fce8212e31a0e09cae0` reuses the existing Residential `PropertyGallery` on Retail detail pages. Ordered Retail gallery photos now rotate in the main property presentation every four seconds; the duplicate static photo grid is removed. Floorplans remain separate. The independently selected Retail Cover remains available in the property-fit section and cover-only showcases, and is the hero fallback only when the gallery is empty. No photo metadata, selections, publication flags, order or storage was changed.
- Includes thumbnails, Previous/Next, photo count, Pause/Play, keyboard-focus pause, reduced-motion default with explicit Play, and offscreen/background inactivity. One image stays static; no eligible photo uses the existing branded placeholder. Inquiry and portfolio navigation remain available beneath the gallery. No new dependency or schema change.
- 259 tests / 32 files passed; TypeScript and OpenNext preview build passed. Candidate browser QA observed actual four-second changes across successive intervals, pointer-over-hero rotation, Pause/Play and arrows without blur workarounds, keyboard pause/focus-exit resume, reduced-motion static default and Play opt-in, refresh reset, decoded photos/no overflow at 1440/768/390, single-photo static behavior at 225 East 83rd, and Gold's separate Retail gallery. Candidate had no browser runtime errors. Existing authorized Admin session, four photo checkboxes and anonymous API denial were verified without writes; fresh OTP was not repeated.
- Runtime `teams-retail-rotate-20261019`, version `087af990-5794-4b56-85b6-29286565d63d`, observed at 100%; fingerprint `2f71387-retail-rotation-20261019`. Candidate gateway `59a74913-e516-4391-8e60-31b578c63ce7` (https://59a74913.teams-management-preview.pages.dev). Stable preview gateway `4b987546-5618-4b68-95d9-05e2fd81233b` (https://4b987546.teams-management-preview.pages.dev), primary branch `preview`. Only service-binding keys changed; environment variables, secrets and D1 bindings preserved.
- Recovery pair: gateway `6ed19871-db18-418a-9eca-e8e53de2447d` plus untouched `teams-photo-checks-20261019`, version `841e6ad0-41d2-4119-9e95-433eef7a109e`. This is code-only: no database restoration needed; preserve newer Admin edits. Client production, Waterbear, DNS and main unchanged. Private configurations, release metadata, screenshots and browser evidence remain outside Git.
- Canonical stable URL repeated the candidate's timed/interactivity/reduced-motion/refresh/single-photo/Gold checks successfully, with decoded images and no overflow at desktop/tablet/mobile, no browser errors, correct application fingerprint, and working existing-session Admin photo controls/anonymous denial. No hosted media writes were performed for this follow-up.
