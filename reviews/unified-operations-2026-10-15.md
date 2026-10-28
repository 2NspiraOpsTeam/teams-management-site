# Unified property operations audit and integration

## Scope and architecture

Code-only extension of the existing deployed 394f525 source. No new modules, schema, import, data synchronization service, or duplicated operational entities. D1 teams-database-dev remains authoritative. Retains manual-upload-only import behavior and tenant lease publication/storage feature gates. Public company site unchanged.

The stable relationship graph is buildings.id → units.building_id; tenant_accounts.id → tenant_assignments.tenant_id → units.id with matching building_id; operations_leases.unit_id and operations_leaseholders.tenant_id; tenant_maintenance_requests.assignment_id and tenant_id; operations_superintendent_properties links staff IDs to building IDs. Maintenance stays attached to its original assignment when residence changes; leases stay attached to their original apartment. These are related branches of the graph, not a requirement that every maintenance request have a lease.

## Corrections

- Tenant detail now includes its own maintenance history, queried by tenant ID; never another occupant's requests.
- Property, apartment, tenant, Admin maintenance and Tenant Services maintenance use the same work-order join and effective status projection. Admin status filtering now matches displayed Scheduled, In Progress and Cancelled states instead of filtering legacy storage values.
- Shared maintenance reads enforce request tenant/assignment and assignment unit/property consistency. Admin-only staff assignment fields remain absent from tenant API responses.
- Maintenance detail links back to its tenant, apartment and property; lease detail links back to its apartment and named property. Operations navigation includes Tenants and Maintenance.
- Existing audited, revision-checked and retry-protected contact, assignment, lease, maintenance and superintendent mutations retained.

## Fresh read-only D1 audit

21 properties, 244 units, 71 tenant accounts, 72 assignments, 8 maintenance requests. All 69 imported occupants retain exact existing property/unit links across six buildings and 69 apartments; 68 active and one inactive/historical (235 W 18th / 5FE). No automatic reactivation or vacancy inference. No unmatched imported associations. No foreign-key errors, property/unit assignment mismatches, maintenance tenant/assignment mismatches, duplicate normalized unit keys or duplicate tenant/unit assignments. Unresolved spreadsheet records remain separate and untouched.

Live operational leases, leaseholders, superintendents and superintendent/property assignments are all empty: relationships are implemented and verified using isolated controlled fixtures, not claimed as populated real records. Private document storage / tenant lease publication remain disabled; no invented leases or staff assignments added.

## QA evidence and limits

136 tests pass across 18 test files. Canonical build:preview:worker and TypeScript pass. No standalone lint runner exists for Next 15; the canonical build performs configured lint/type validation.

Fresh live export restored into an isolated local D1 copy. Rendered all 69 imported occupants under both property Apartments and Tenants; links and reload pass across six buildings at 1440/768/390 widths, without page errors or document overflow. All 8 existing maintenance records match property/unit/tenant/dashboard IDs and statuses on the isolated copy.

Local-only labeled fixtures exercised property → apartment → tenant; browser contact edit → reflected property tenant/apartment rows; lease end update → tenant/unit/property reads; lease/apartment navigation; superintendent → property navigation; tenant-submitted request → same request under tenant/unit/property/dashboard; same-receipt maintenance retry; browser Admin status update → tenant-visible history; private internal-note suppression; anonymous and tenant-to-Admin denial. Existing automated tests also cover reassignment history retention, session revocation, multiple occupants, stale edits, transactional rollback, foreign-origin denial, leaseholder permissions, and document access scoping. No hosted real-data edits, account provisioning or notifications performed.

Hosted signed-in QA is blocked by the expired authorized Admin session. Anonymous guard checks and deployment fingerprint are verified separately; local synthetic authentication is never inserted into hosted D1. Real lease/superintendent population and private document delivery are not represented as verified.
