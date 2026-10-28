# All-property source alignment — 2026-10-16

## Authorized scope

Jeffrey authorized reconciliation for every property, aligned apartment/tenant/lease
views and both dashboard levels. Population precedes Teams Management verification;
integrity, source evidence and existing history must be preserved.

## Implementation

- Reuse the existing D1 identities, assignments, source Rent Roll and bounded-import
  provenance tables. No schema migration, public tenant data, login enablement,
  invitation, fabricated contract/start date or property/unit renumbering.
- Every supplied Phone List source row/contact remains available in authenticated
  Tenants and Phone List views, independent of business verification. These are
  explicitly source rows, not unique-person or confirmed-occupancy counts.
- Immutable private audit chunks retain the original source archive. An exact
  SHA-256 check fails closed before the source-read API returns records. Literal
  unit IDs are matched only within their exact property; unresolved tokens remain
  source evidence, never coerced into another apartment.
- Rent Roll reconciliation receipts link matching tenant identities and recorded
  lease terms. Conflicting names remain visible without replacing existing people
  or merging parties by name. Tenant agreement views include recorded unit terms;
  a source expiration is attributed to a tenant only through its exact receipt.
- Property expiration totals use recorded Rent Roll dates and the same New York
  business date as the main expiration worklist. Their drilldown opens that exact
  property/window. Both dashboards distinguish source-row totals, linked occupants
  and source conflicts.

## Source accounting and isolated rehearsal

- 243 Rent Roll rows across 14 properties: 100 new nonconflicting tenant/assignment
  candidates, 48 existing exact links, 93 preserved conflict/identity cases, and two
  vacancy markers excluded from tenant creation. All 20 non-QA property records
  were checked; the QA property remains separate.
- All 407 Phone List source rows, 959 contact cells and 1,510 original nonempty
  source cells are accounted for. Repeated rows are not merged into people.
- 40 new literal, unverified, non-primary contacts are eligible on exact
  property/unit/name matches, with every contributing source-cell locator retained.
- A complete current-target SQL export restored cleanly. The exact manifest ran in
  isolated D1; a forced failure after the writes rolled back the whole batch.
  All 4,235 preexisting rows across 62 application tables remained intact.
- Isolated successful execution preserved all original rows and clean foreign keys.
  No prior tenant/login/session/lease/maintenance values were replaced.

## Verification status

174 tests across 23 files, typecheck and OpenNext build passed. Rendered local
Chromium checks passed at 1440/768/390, including all operational-property API/list
counts, all source rows/contacts, desktop/tablet/mobile Tenants, recorded Leases,
property/main dashboards, refresh and source-load error/retry. No page errors or
page overflow were observed. Mobile screenshots were inspected.

Shared apply and candidate/stable deployment evidence are recorded separately in
restricted operational evidence; preparation/local results alone are not hosted
verification or promotion. Management source conflicts remain visible for later
business review, not hidden as missing information.

## Shared apply / review deployment

The authorized reconciliation was applied to `teams-database-dev` in one guarded,
atomic import. A fresh post-apply export verified every one of the original 4,235
rows is unchanged. Exact outcomes: 100 new tenants and current assignments, 48
existing source links, 40 new source contacts, 93 explicit source conflicts, two
vacancy markers excluded. Zero FK violations, duplicate unit keys or mismatched
property/unit assignments. All 243 source receipts match the immutable manifest;
all Phone List source evidence matches the staged bytes exactly. A resumed check
recognizes the committed receipt and performs zero replayed writes.

Application commit: `e008c86577ed00d5663c05aa613ad8e942c5dff6`.
Review: https://ad00b673.teams-management-preview.pages.dev
Runtime: `teams-alignment-runtime-e008c86`, version
`6f4054f7-1d95-4a89-b028-78c632135b34`.
Nine anonymous hosted route/asset/fingerprint checks passed. Stable deployment
`f45f2617-c0fc-437f-bd76-0ce1263a84bd` remains unchanged; the shared-data additions
are visible through existing stable directory views. The new source panels and
dashboard refinements are on the review candidate, not yet promoted.

Hosted authenticated acceptance requires ordinary Admin sign-in. A code was
requested through the normal candidate UI; receipt/verification is not yet proven.
No authentication bypass or synthetic hosted session was used. The configured
mailbox OAuth grant was expired, so automated inbox retrieval is unavailable.
