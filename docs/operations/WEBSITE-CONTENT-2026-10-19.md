# Website Content

Admin → Website Content (`/admin/website-content`) edits approved public wording without changing layouts, markup, images, link destinations or application logic. The former Public Content landing page redirects here.

## Editing workflow

1. Choose the familiar page name. Fields are grouped in website order and labelled by their role/current approved wording.
2. Edit plain text and **Save draft**. Cancel returns to the saved draft. Refresh keeps the selected page and reloads saved work, not unsaved edits.
3. **Review & publish** shows currently published and proposed text for every changed field. **Publish approved wording** is the explicit approval action.
4. **Restore previous published version** previews the previous wording, then asks for confirmation. Restoration replaces both the published text and saved draft. The replaced published version becomes the next restore point.

Unsaved changes prevent page selection without a discard confirmation and warn on browser refresh/close. The editor reports validation, loading, success, server failures and revision conflicts. A conflict does not overwrite the admin's unsaved text; reload is explicit. Repeated clicks are locked; lost-response retries reuse the operation ID.

Property names, addresses, facts, availability, descriptions and media remain in their existing data sources and Admin controls. Dining venue records and rental routing also stay separate. Public template copy, rental guidance/FAQs, navigation, footer and legal wording are editable; SEO metadata, private portals, operational messages and property-specific facts are not duplicated here.

## Storage and security

- Existing D1 is sufficient; no external CMS, subscription, rich-text renderer or new dependency is required.
- `website-content-catalog.json` is an explicit allowlist of approved text slots and defaults. React text nodes preserve markup/layout and escape text; no HTML or arbitrary schema keys are accepted.
- `website_content` stores a page revision, draft, published snapshot and previous published snapshot. Approved source defaults are the initial public version. Only `published_json` is read by the public provider, once per public page render; drafts, actors and audit history are never included in it.
- Existing active-Admin session authorization applies to both reads and writes. Writes also require a same-origin JSON request. Authenticated responses are private/no-store.
- Compare-and-swap revisions prevent lost updates. The content write and actor-labelled audit entry use one atomic D1 batch. An operation UUID makes retries idempotent. Immutable audit events preserve earlier snapshots beyond the one-click previous-version control.
- The additive SQL is `src/lib/migrations/website-content.sql`. Do not bulk-apply legacy migrations: the default migration directory still lists an unrelated `init-schema.sql`. Apply only this scoped schema and record its name in `d1_migrations`; existing tables/records are untouched.
- Before the additive schema is installed, public rendering uses approved source copy. Unexpected database failures are not silently treated as missing content.

## Verification

Eight focused tests cover defaults/validation, private drafts, publish/restore, actor audits, stale edits, idempotent retries, approval requirements and atomic rollback on audit failure. The existing full suite passed 253 tests across 32 files. OpenNext Worker build and TypeScript checks passed.

Local built-Worker/browser checks used an isolated schema and synthetic Admin, not client records: anonymous denial, desktop/tablet/mobile editor layouts, required-field validation, cancel, save/refresh persistence, unpublished draft isolation, public publish/restore, retained text after backend failure, stale-editor conflicts, origin rejection and public rental/legal rendering. Hosted release identifiers and additional verification are recorded separately after deployment. Fresh OTP delivery is not established by reusing an existing authorized session.

Recovery: retain the previous Pages gateway/runtime pair. The additive schema is backward compatible, so a code rollback does not require rolling back client data. Keep all database exports, screenshots and QA sessions outside this public repository.

## Verified preview release

- Application source: `c48e413b43693f06dc53a84df07da2a49fa89a5d`.
- Canonical editor: https://teams-management-preview.pages.dev/admin/website-content
- Runtime `teams-content-024aa79`, active version `c8ef193c-3609-4d3b-989c-1e269d6b04ed`; served release `c48e413-website-content-20261019`.
- Restricted candidate gateway: `ac25b71e.teams-management-preview.pages.dev`. The candidate's service runtime was updated during QA; this gateway ID alone is not an immutable application revision.
- Canonical Pages deployment: `c996fe61-c751-4dac-9a50-1c54973f5013`, branch `preview`, direct-upload mode. Pages calls this the project's production environment; it is the development preview, not the client's production domain.
- The additive migration is recorded as `website-content.sql`. Protected record totals and existing database/credential bindings were preserved. Existing source-approved wording was not changed by hosted QA. A whitespace-only Services draft tested save/refresh and double-click protection, then was reset exactly to its approved published wording. No hosted publication was performed for testing.
- Candidate and canonical authenticated editor checks passed at desktop/tablet/mobile widths. All 17 page choices loaded their expected labelled fields on canonical. Home, About and Services retained approved headings and decoded visible images; the old Public Content link redirects correctly. No browser runtime errors were observed.
- Publish/restore, cross-page navigation freshness, stale-editor conflict handling, backend failures, and validation were exercised against the final local built Worker with a synthetic Admin. Fresh emailed OTP login was not repeated; hosted checks reused an existing authorized Admin session. Production and Waterbear were not changed.
- Rollback pair retained: Pages `97d2b90e-b156-4ee9-b75d-b29787c40444` with runtime `teams-usage-runtime-195cc75`. Do not restore the entire database to roll back this additive feature.
