# Admin reconciliation review — isolated deployment

## Release scope

Code commit: `0d055305311bff27aa432ade93102770360f000e`.

Review-only branch is based on the stable preview's observed `d60293ec72a3664761c93b3774ac398ffd852589`. The tenant-import runner, nullable-login changes, contact-directory changes and migration files from the preparation branch are deliberately excluded. Existing property operations flags are preserved.

The existing private Pages-to-Worker service binding is retained. A separate review runtime serves the isolated branch. Stable production-environment binding remains `teams-preview-runtime-d60293e` and has not been promoted.

## Management workflow

Admin → Tenants → Import Review loads the private immutable review bundle through an authenticated, no-store Admin API. Five queues: Property Mapping (19 aliases), Duplicate/Repeat Review (90 groups), Missing Contact Information (112 rows), Tenant/Unit Assignment Conflicts, Source Authority (one workbook authority decision). NOVITA, combined 349/351 W 46th and Tremont/Bruckner sort first.

Staff can inspect original row cells and proposed mapping. Shared decisions are attributed server-side to the authenticated Admin, not a typed reviewer. Append-only events retain before/after decisions. Global sequence/unique primary key prevents concurrent reviewers overwriting one another; stale saves require reload. No candidate approval or import action exists.

Comparison data is stored as private review-bundle audit records in the existing audit log, not as tenants, assignments or public assets. The source workbook's authenticity still requires management confirmation. This is review staging, not a tenant import.

## Verification

- 114 application tests, typecheck, canonical preview Worker build passed.
- Local synthetic browser QA: shared load/save/refresh; evidence/property validation; double-click handling; stale-write conflict; cross-origin denial; anonymous/tenant-only denial; five queues; desktop/tablet/mobile without overflow or JavaScript errors.
- Rendered mobile screen inspected.
- Isolated hosted checks: anonymous Admin-page redirects, protected API/read/write denial, and public home/properties/retail responses.
- Protected before/after row hashes match for nine existing identity, assignment, operations, lease, maintenance and Admin-identity tables. Existing counts include 2 tenant accounts, 3 assignments, 0 leases and 8 maintenance requests.
- Shared history reload uses bounded audit-key comparisons rather than LIKE: D1 rejected a 64-character hash LIKE pattern in local QA; regression fixed and tested.
- Live authenticated staff/tenant checks and existing Admin workflows remain NOT VERIFIED: retained sessions expired. Stable promotion is gated on fresh authorized sign-in and successful live checks.

## Remaining management decisions

1. Confirm NOVITA's exact address (17 rows), Tremont/Bruckner's canonical properties and addresses.
2. Allocate the 13 combined 349/351 W 46th rows to the correct building and exact unit.
3. Select the authoritative original OneDrive/SharePoint workbook, owner and current repeated rosters; confirm field ownership.
4. Resolve repeat/identity/contact-role conflicts without assuming repeated rows mean duplicate people.
5. Confirm unresolved unit labels and existing identity/assignment links. Missing email alone does not prevent a contact-only tenant; Portal access remains a separate decision.

Graph tooling remains prepared offline/read-only and inactive. No sync scheduler, Microsoft authorization, tenant import, account activation, non-additive migration, lease/history edits or paid integration was enabled.

## Promotion and rollback

After fresh Admin authentication, verify shared review loading, protected original-row rendering, queues and history against the hosted runtime. Use mocked synthetic review responses for write-path browser QA so real property mappings remain undecided; do not create business decisions for QA. Verify existing Admin property/tenant reads, invalid-session and tenant-only denial, and no protected-data change. Only then change the stable Pages service binding to this tested runtime and direct-upload the gateway on branch `preview`; verify the release header and routes again.

Retain stable Pages deployment `cd4be0fe-89a6-4162-9b4f-4174f6c97346` and its runtime `teams-preview-runtime-d60293e` for rollback. No migration rollback is required; review audit history must be preserved.
