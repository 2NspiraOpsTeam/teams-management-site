# Operational Admin usability

## Implementation

Extends the accepted unified operations release, using the existing D1 graph, forms and security. No migrations, imports, hosted fixtures, new database, or synchronization layer.

- Superintendent editor retains full name, mobile/work phone, email, languages, active status and multiple property assignments. Assigned active staff automatically appear in each property's existing overview. Empty property states link directly to staff entry. No real staff information invented.
- Tenant lease creation preselects the existing tenant as a leaseholder, with private document and rent sharing off. Apartment lease creation retains its property/unit context. Required verified dates/rent, status, leaseholders, existing audit history and immutable original renewal links remain supported.
- Historical former-leaseholder agreements remain visible in Admin tenant lease lists. Lease detail links to both predecessor and renewal agreements. Tenant Services authorization is unchanged.
- Lease creates and edits refuse duplicate apartment/start/end records. Same-receipt retries remain safe; transactional insertion/update guards reject competing identical date-range writes without schema changes.
- Property metric links lead to applicable sections; overview displays open-maintenance and upcoming-expiration lists alongside apartment/current-occupant counts and superintendent contacts. Apartment search accepts occupant names and preserved contacts, scoped to the property; search, clear, pagination and sorting retained.
- Private lease document uploads and publication remain gated and disabled on the existing runtime.

## Local verification

140 tests across 18 files. Canonical OpenNext preview build, TypeScript and diff checks.

Controlled rendered browser QA uses only the isolated populated D1 copy: superintendent languages and two-property assignment, save/reload and cancel; tenant-prefilled lease entry, required-field rejection, retained draft on backend failure and safe retry; renewal property/unit/holder prefill; apartment occupant search; desktop 1440, tablet 768, mobile 390 with no overflow or page errors. Anonymous APIs fail closed (middleware 404), foreign-origin writes return 401. Tenant-to-Admin denial and private maintenance-note suppression pass. All 69 imported records render across six properties and both property rosters; all eight original maintenance records remain related consistently.

Fresh hosted read-only snapshot confirms 69 imported associations unchanged (68 current, one historical), no foreign-key violations. Existing indexes support unit/holder/property-assignment reads; page size remains capped at 50 with one batched roster enrichment, no per-record requests. Renewal lookup is unit-scoped to reuse the existing lease index. No new index or schema modification needed.

## Hosted gate

Existing browser session lands on legitimate /access one-time-code sign-in. No session injection or security weakening. Authorized Admin email requested for login. Signed-in hosted workflows and stable promotion remain pending until legitimate authentication is available. Stable accepted release must be preserved while candidate QA is blocked.
