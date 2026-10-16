# Property / apartment / tenant integration

## Scope

Extends the deployed manual-upload source (00f223e; inherited source head 731204a) rather than replacing it with the divergent main branch. Code-only, no schema changes, imports, contact writes, assignment changes, permission changes, notifications or paid infrastructure. Existing D1 account/database binding and private Pages RPC runtime retained.

## Shared records and navigation

Admin apartment lists now expose linked existing occupants with primary directory phone/email, occupancy state and portal access state. All occupants per apartment are retained; historical and proposed links are explicitly distinguished from Current. Property tenant lists include historical/proposed associations instead of silently dropping them. Tenant residence lists link independently to the existing property and apartment. Tenant detail residence history also links to both destinations. Existing tenant detail and assignment forms remain the only editing paths; they retain existing audited, revision-checked, retry-safe mutations.

Private list enrichment is page-bounded and joins tenant_assignments → units (matching building IDs) → buildings and tenant_accounts. Contact selection matches the existing tenant directory, not authentication email. No public or tenant API is extended. Properties show total apartments, confirmed occupied apartments, distinct current occupants, open maintenance and leases expiring within 90 days. Missing assignments do not imply vacancy.

## Fresh D1 verification

All 69 imported tenant identities retain their original building/unit associations across six buildings and 69 distinct apartments. **68 are currently active; one imported assignment at 235 W 18th St / 5FE is inactive in the fresh target snapshot.** Preserve it as historical/not current; management review is needed before any reactivation. No automatic corrections made. All 163 original contact values were found, with foreign-key checks clean. Original 69-Current saved evidence is not represented as a fresh current-state result.

Imported records by building (records / current):

- 171 E 74th St: 6 / 6
- 225 E 83rd St: 7 / 7
- 235 W 18th St: 19 / 18
- 41 W 46th St: 3 / 3
- 42-70 156th St: 29 / 29
- 71 E 110th St: 5 / 5

Private snapshot, restored SQLite copy, identifiers, contacts and screenshots remain outside Git.

## Verification

134 tests pass, including contact edit propagation, several occupants, historical/proposed links, no inferred vacancy, property/unit filters, auth separation, revision/retry protection, and maintenance/lease preservation. TypeScript and canonical preview OpenNext Worker build pass. Isolated local D1 was restored from the fresh live export. Rendered all 69 imported records under Apartments and Tenants across all six properties; reload persistence and clicked property → tenant → apartment → property navigation pass at desktop/tablet/mobile widths 1440/768/390, without page errors or horizontal document overflow. Local-only labelled synthetic records exercised multiple occupants, contact change propagation, empty/clear, server error and retry. No synthetic mutations were sent to hosted D1.

Hosted anonymous Admin API denial verified. Saved hosted Admin session returns 401 and current managed browser redirects to /access; authenticated hosted rendering and edits remain unverified until renewed authorized sign-in. No authentication bypass/session creation on hosted D1.
