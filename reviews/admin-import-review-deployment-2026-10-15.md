# Admin reconciliation review — stable preview deployed

## Release scope

Code commit: `0d055305311bff27aa432ade93102770360f000e`.

Review-only branch is based on the stable preview's observed `d60293ec72a3664761c93b3774ac398ffd852589`. The tenant-import runner, nullable-login changes, contact-directory changes and migration files from the preparation branch are deliberately excluded. Existing property operations flags are preserved.

The existing private Pages-to-Worker service binding is retained. A separate review runtime serves the isolated branch. After isolated QA passed with a fresh authorized Admin session, the stable preview binding was promoted to `teams-review-runtime-20261015`. Public company production and main remain unchanged.

Admin review URL: https://teams-management-preview.pages.dev/admin/tenants/import-review

Stable Pages deployment: `06349e19-73a1-4239-b610-924f778629d1` / https://06349e19.teams-management-preview.pages.dev

Isolated deployment: https://6c4968dc.teams-management-preview.pages.dev

Worker version: `e3aa6dce-dafd-42cb-be96-d5d3ee4c2ee5`. Pages metadata and live release header both match the code commit above.

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
- Fresh Admin authentication confirmed working. Isolated and stable hosted QA passed: private bundle (407 unapproved; zero decisions), all five queues, prioritized mapping, original-row comparison, three responsive layouts, existing Properties/Tenants/Maintenance screens, CSRF rejection and stale-request rejection. No real mapping decision was written for QA.
- Valid tenant-only denial and successful shared decision writes were verified locally with synthetic records. Fresh tenant login/inbox delivery and a real management mapping approval were not exercised on the hosted preview.
- Final protected-record hashes still match the pre-release baseline. Stable deployment serves the expected release header. Initial checks during alias propagation were rerun after the new release became active.

## Remaining management decisions

1. Confirm NOVITA's exact address (17 rows), Tremont/Bruckner's canonical properties and addresses.
2. Allocate the 13 combined 349/351 W 46th rows to the correct building and exact unit.
3. Select the authoritative original OneDrive/SharePoint workbook, owner and current repeated rosters; confirm field ownership.
4. Resolve repeat/identity/contact-role conflicts without assuming repeated rows mean duplicate people.
5. Confirm unresolved unit labels and existing identity/assignment links. Missing email alone does not prevent a contact-only tenant; Portal access remains a separate decision.

Graph tooling remains prepared offline/read-only and inactive. No sync scheduler, Microsoft authorization, tenant import, account activation, non-additive migration, lease/history edits or paid integration was enabled.

## Promotion and rollback

Promotion completed after successful isolated QA, then authenticated stable verification. No schema migration or tenant import was executed. All 407 candidates remain unapproved; Graph remains inactive.

Retain stable Pages deployment `cd4be0fe-89a6-4162-9b4f-4174f6c97346` and its runtime `teams-preview-runtime-d60293e` for rollback. No migration rollback is required; review audit history must be preserved.
