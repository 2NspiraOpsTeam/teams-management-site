# Authoritative Rent Roll population — 2026-10-17

## Authorized scope and live result

Management requested that the successful 1365 First Avenue reconciliation be replicated to the remaining properties in the supplied October 2026 Rent Roll, including commercial tenants in the ordinary Tenants directory and their exact suites in Apartments. Management subsequently directed that unknown floors remain empty.

- 243 remaining source entries reconciled across 14 canonical property records: 241 tenant-bearing entries and two explicit vacancies.
- Together with the previously completed 14 entries at 1365, all 257 workbook entries are represented. Source entries are not unique people or physical-apartment counts.
- 96 no-login tenant records, 101 assignments and 12 commercial unit records added. Existing entity IDs were not renamed or merged by name. Repeated exact business labels within the same property retain their multiple suite links.
- 22 superseded assignments retained as historical. Existing contacts, tenant/admin sessions, saved leases, media and maintenance history preserved; no original rows deleted. No invitations, activation, tenant communications, billing or signed-agreement changes.
- At 171 East 74th Street, all 19 source entries are represented by 16 current tenant entities, including commercial tenants and the separately listed sixth-floor office. Combined commercial-suite labels remain combined; they are not silently split.
- The existing combined 349/351 property was returned from archived to **draft**, solely for the shared commercial entry in the source block. Separate residential properties remain separate. Its public page remains unavailable; it was not published.
- Properties not represented in this workbook, including Tremont, were left unchanged.

## Preservation and execution

Fresh full exports were restored and compared before application. Populated local D1 proved floor-migration rollback and all 14 property batches' end-failure rollback, success, and duplicate-retry rejection. Wrangler file execution separately proved atomic end-failure rollback. Executable SQL, manifests and backup hashes were frozen before remote execution. Persisted batch receipts were checked after each property.

The sole schema change relaxed `units.floor_number` from NOT NULL to nullable. All unit IDs and values were staged and reinserted atomically with deferred foreign keys. All columns other than that constraint, indexes, triggers and foreign-key definitions were preserved. The migration is recorded as `units-nullable-floor.sql` in the existing ledger; the unrelated pending legacy migration was not applied.

The full post-apply export verifies every source field, each current assignment, vacancies, item/change receipts and preservation of every original row. Results: zero remaining mapped review holds, 6,079 original rows unchanged, 432 explicitly authorized original-row updates, clean foreign keys and `integrity_check=ok`. Raw private source data, approvals, backups and before/after evidence remain outside the repository and deployment assets.

## Application verification and release boundaries

- 175 tests across 23 files passed; TypeScript and the OpenNext preview build passed.
- Rendered local checks verified all 14 property rosters in both API projections, tenant/unit links, commercial tenants, blank optional floor editing, refresh persistence, anonymous denial, and desktop/tablet/mobile layouts at 1440/768/390 pixels without document overflow or page errors.
- Hosted anonymous tenant API denial and the shared draft property's public-page denial both returned 404.
- Fresh hosted authenticated browser acceptance was **not** established: the available browser reached sign-in. No authentication was bypassed and no live QA session was fabricated.
- The nullable-floor database change and population are live. Floor-editor/API compatibility changes are committed locally for the next reviewed application release; this task did not promote a new application build or change stable deployment ownership. Existing hosted reads already handle NULL as not supplied.
- The repository's lint command opened an ESLint configuration prompt rather than running a configured lint pass; no lint success is claimed.
