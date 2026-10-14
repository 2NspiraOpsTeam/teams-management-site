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
- 55 automated tests passed, including 9 SQLite-backed context tests for migration idempotence, cover and order isolation, reuse, explicit fallback, revoked approval filtering, atomic rollback and stale writes.
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
