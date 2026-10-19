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
- `website_content` stores a page revision, draft, published snapshot and previous published snapshot. Approved source defaults are the initial public version. Only `published_json` is read by the public provider, once per navigation template render; drafts, actors and audit history are never included in it.
- Existing active-Admin session authorization applies to both reads and writes. Writes also require a same-origin JSON request. Authenticated responses are private/no-store.
- Compare-and-swap revisions prevent lost updates. The content write and actor-labelled audit entry use one atomic D1 batch. An operation UUID makes retries idempotent. Immutable audit events preserve earlier snapshots beyond the one-click previous-version control.
- The additive SQL is `src/lib/migrations/website-content.sql`. Do not bulk-apply legacy migrations: the default migration directory still lists an unrelated `init-schema.sql`. Apply only this scoped schema and record its name in `d1_migrations`; existing tables/records are untouched.
- Before the additive schema is installed, public rendering uses approved source copy. Unexpected database failures are not silently treated as missing content.

## Verification

Eight focused tests cover defaults/validation, private drafts, publish/restore, actor audits, stale edits, idempotent retries, approval requirements and atomic rollback on audit failure. The existing full suite passed 253 tests across 32 files. OpenNext Worker build and TypeScript checks passed.

Local built-Worker/browser checks used an isolated schema and synthetic Admin, not client records: anonymous denial, desktop/tablet/mobile editor layouts, required-field validation, cancel, save/refresh persistence, unpublished draft isolation, public publish/restore, retained text after backend failure, stale-editor conflicts, origin rejection and public rental/legal rendering. Hosted release identifiers and additional verification are recorded separately after deployment. Fresh OTP delivery is not established by reusing an existing authorized session.

Recovery: retain the previous Pages gateway/runtime pair. The additive schema is backward compatible, so a code rollback does not require rolling back client data. Keep all database exports, screenshots and QA sessions outside this public repository.
