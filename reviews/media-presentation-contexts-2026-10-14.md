# Independent property media presentations

## Scope
- Reuse existing media assets and property-level publication approvals; no file copying or duplicate uploads.
- Independent Residential and Retail settings: explicit cover, ordered gallery, gallery image type.
- Retail fallback to the existing approved property cover is visible, configurable and enabled for legacy properties. A designated but revoked cover is hidden, not silently replaced.
- Unit-scoped, private, unpublished, archived and undeliverable images cannot be selected. Revoked approvals are rechecked on public reads.
- Source approvals remain separate from presentation membership; uploads do not silently enter a gallery.

## Persistence and migration
- Additive `media_presentation_settings` and `media_presentation_gallery`, keyed by property/context.
- Existing Residential cover/gallery and approved Retail galleries seeded without changing original assets/assignments/publications.
- Scoped migration file applied alone. Do not replay pending legacy `init-schema.sql`; its existing schema is already present and the remote migration ledger was absent before inspection.
- Pre/post migration counts: 20 buildings, 203 assets, 185 source assignments, 184 publication records; unchanged. 40 context settings and 173 initial context/gallery rows created. Foreign-key checks empty.
- Optimistic per-context revisions and atomic D1 batches prevent stale or duplicate writes from partially replacing a gallery.
- A source-assignment restore snapshot was saved outside the repository with owner-only permissions. No credentials were added to source.

## Verification
- 56 automated tests passed, including 10 SQLite-backed context tests for migration idempotence, cover and order isolation, reuse, explicit fallback, revoked approval filtering, atomic rollback and stale writes.
- Typecheck and Pages build passed.
- Local Pages rendered QA: desktop 1440px, tablet 768px, mobile 390px; no overflow or page errors.
- Authenticated isolated fixture: independent Retail cover/gallery/order, same asset reuse, refresh, cancel, failure preserving draft, safe retry, double-click protection, malformed/unapproved selection rejection, anonymous and origin guards.
- Public local fixture: designated cover, Residential route, empty Retail gallery and fallback disabled without random cover selection.
- Candidate and stable deployment verification recorded in the completion update below.

## Compatibility
- Property Media contains the presentation editor; the Retail admin editor links to the same portal.
- Old Retail gallery write endpoint rejects stale clients with a reload instruction, rather than silently modifying an unused legacy gallery.
- Prior Times Square anchor and fixed East Tremont Retail feature are preserved.
- No auth/mail/DNS configuration changes and no production/custom-domain rollout.

Residential detail pages preserve stored gallery membership/order independently of the cover. A different cover is displayed separately; a cover already first in the gallery retains the existing compact single-gallery layout.

## Completed preview release
- Candidate: https://75785566.teams-management-preview.pages.dev
- Stable: https://teams-management-preview.pages.dev
- Stable deployment: `41946bd5-be19-4a44-8c15-40a25caf2244`, primary Pages branch `preview`, source `0f4d9ca01234cfebdb663f2eed08737ed20d08f7`, clean tracked source metadata.
- Live Admin QA passed at 1440/768/390px: both contexts saved independently; reuse, order, refresh, cancel, simulated failed-save/retry, consumed revision/double-click and approval rejection verified on a hidden fixture.
- Local rendered positive case confirmed a cover-only photo stays outside the Residential gallery; gallery membership and next-photo order matched saved selections at all three widths.
- All 17 residence detail routes passed candidate regression, with desktop/tablet/mobile card navigation, slideshow controls, preserved building history and no page errors. Home/About copy and existing Admin/Tenant sessions with cross-role denial also passed candidate regression. No fresh OTP email was requested for this release.
- Stable Retail feature/Times Square directions and existing role sessions passed. Empty approved-image/gallery states and disabled controls passed on stable.
- Hidden QA fixture and its presentation/source assignments/publications removed. Source assets were reused, never copied or deleted.
- Final remote counts: 20 buildings, 204 assets, 186 source assignments, 185 publications, 40 context settings, 174 presentation/gallery rows; foreign-key check empty. The +1 asset/assignment/publication/gallery relative to the pre-migration baseline is a concurrent approved 225 E 83rd St update (asset created 15:31:47 UTC; Retail context revision 1), not this test fixture. It was preserved, not reverted.
- Test runtime: Node 26; SQLite-backed tests use the built-in `node:sqlite` module.
- Repository review branch: `review/media-contexts-2026-10-14`; no main merge or production/custom-domain release.
