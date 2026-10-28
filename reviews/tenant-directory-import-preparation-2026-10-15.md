# Teams tenant directory / one-time import preparation

## Continuation

Jeffrey subsequently accepted this local milestone and approved contact/login identity separation as the target architecture. Shared migration and real import remain gated. See [reconciliation](tenant-import-reconciliation-2026-10-15.md) and the separate [release/rollback plan](tenant-import-release-plan-2026-10-15.md) for current scope and evidence. The original results below are retained as preparation history.

## Status

**Implemented and tested locally; not deployed or imported remotely.** Real data remains in restricted local staging. No Microsoft Graph, OAuth, scheduled sync, paid service or storage plan was added. No invitations, mail, SMS or notifications were sent. Production and the stable preview are unchanged.

Branch: `feature/tenant-directory-import-2026-10-15` (local review branch; not merged or published).

## Reconciliation and dry-run

- Received review-workbook SHA-256: `d9ee12561b2f0d77cf6882716cc1fb4e9e3794e7710c048f6d9634ffa9716a3b`.
- Source SHA declared by the handoff: `8a6dcf40cb6f8d7d66322c0048e52f930615d266674cfbf1ecacd5e9cc024311`.
- **407 original candidates**, all `review`; not unique people/occupied units.
- **959 original mapped contact cells**, all `review`, each accounted for once.
- **1,510 source cells** retained and indexed in a private source-cell review ledger. Of these, 551 are outside mapped contact cells; this includes names, headers and other original content, not 551 missing tenants. Semantic/source-role review remains pending for all 1,510 cells.
- **19 property aliases**, all `review`; not 19 confirmed properties.
- Recalculated **90 repeat groups / 123 excess occurrences**, across sheets, matching the handoff. No first-row authority or within-sheet-only count is used.
- Current eligible manifest: **0 creates, 0 updates, 0 links**. All 407 candidates and 959 contacts are unresolved review work (1,366 explicit pending provenance outcomes), not approved exclusions. No approved immutable import package has been issued.
- The original `2026 TENANT PHONE LIST.xlsx` file was not located. The raw source archive/declared hash is preserved, but independent hashing of that original file remains **not verified**. No claim is made about independently inspecting its hidden empty sheet.

## Existing schema inspected

Read-only preview D1 preflight verified the actual `buildings`, `units`, `tenant_accounts`, `tenant_assignments`, `operations_tenants`, `operations_units` and assignment-profile schema/indexes; reference counts and foreign-key checks were inspected. The snapshot contained 21 stored building rows (including archived/test/history rows), 244 units, 2 existing tenant accounts, 3 assignments, 0 leases and 8 maintenance requests. Counts do not approve any property alias or identify tenant matches. The legacy migration ledger has one entry; existing tables are not assumed missing, and no bulk replay of historical migrations is proposed.

Read-only inventory is staged privately for exact-ID validation. Existing tenant, account, property, unit, lease and maintenance IDs/relationships remain untouched remotely.

## Migration files and schema decisions

1. `src/lib/migrations/tenant-directory-import.sql` — additive contact model, directory/unit/assignment metadata, restricted import batches/items/audits, optimistic guard table, explicit change ownership and resumable undo receipts. Includes restrictive references, per-tenant primary/contact indexes, non-null source locators and consistent source/contact-owner mapping constraints.
2. `src/lib/migrations/tenant-directory-identity-nullable.sql` — **separate compatibility proposal, not additive and not authorized remotely**. The existing tenant table requires a unique, non-null login email. SQLite cannot relax that constraint with an additive column migration. The tested proposal preserves every tenant ID, login value, timestamp and child reference while allowing NULL login email for staff-managed records. It requires explicit schema-exception approval, an approved export, current schema/index verification and atomic migration gates before any real application. No fabricated login addresses or parallel directory were introduced.

Existing entities are reused. New staff-managed tenants have a required display name, optional contacts and disabled portal access. Contact emails are independent of the existing login identity; editing them does not change activation, sessions or credentials. Shared phone/email values do not merge people. Confirmed normalization/verification survives role-only edits; changed raw contact text becomes unreviewed again. Removed contacts are archived with private audit evidence.

Units retain text identifiers and the established case/edge-whitespace unique key; `001A`, `1A`, prefixes and commercial labels are not numerically collapsed. New units require explicit inventory/floor confirmation because the current schema requires a floor. No floor, dates, occupancy, leases or vacancy are invented.

Existing tenant–unit links and operational history are retained. Imported links are proposed/inactive, with unknown dates/relationship type. Several tenants may share a unit and a tenant may have several historical/current unit links. The legacy lifetime tenant–unit pair key is preserved; repeated staff changes retain prior date/role snapshots in the existing audit log and the Admin assignment-history view, rather than replacing operational IDs or losing earlier intervals.

## Implemented workflows

- Admin tenant create/edit/search; optional phone/email; alternate/CC contacts, deliberate primary selection, verification and portal-access status.
- Staff-only contact/detail queries; anonymous and tenant-only Admin reads denied. No public API exposes the contact directory.
- Private header-driven XLSX loader; formula/macro/external-link rejection; immutable raw-source/ID validation; unexpected fields/columns and duplicate source locators rejected.
- Exact property/unit/tenant IDs, approved combined-address overrides, conservative matching, reviewed omitted-candidate additions and private before/after correction/split staging.
- Recomputed duplicate/conflict/read-set checks, content-hashed manifests and stale-record protection.
- Guarded local CLI and private D1 commit/undo module. No application import endpoint. **Preview/production execution is hard-disabled**, even when an environment argument is supplied.

## Local verification

- **106 JavaScript tests passed** across 14 files.
- **19 Python synthetic import tests passed**.
- Typecheck and OpenNext preview Worker build passed (Next.js 15.5.28; OpenNext 1.20.11; Wrangler 4.151.0).
- Actual local D1: populated prerequisite migration preserved IDs/links; foreign keys enabled and `foreign_key_check` clean.
- Actual local D1 import: bounded entity/audit/provenance batches; committed first record survived forced interruption; resume reconciled persisted work; identical rerun produced zero duplicate writes.
- Actual local D1 undo: forced interruption resumed by persisted reverse-record receipts; commit was blocked after undo started; later staff edits blocked undo without overwriting those edits.
- Forced D1 audit-insert failure rolled back its entity batch; recovery/resume and subsequent undo passed.
- Rendered browser QA passed at 1440 / 768 / 390 pixels, without page errors or horizontal overflow: contactless creation, multiple contacts, validation, primary selection, double-click suppression, success, server failure/draft retention/retry, stale edits, cancel, empty/search/clear, loading/backend-load retry, save/refresh persistence and actual D1 contact-email edits leaving login identity/active sessions unchanged.
- Real tenant semantic review, approved real commit/backup/rollback, hosted preview verification of this branch and production verification: **not performed**. All writes/tests were synthetic and local.

## Pending business/data decisions

- Select authoritative duplicated rosters, especially the two 166/170 East 118th blocks. A 2026 tab is not authority.
- Approve exact existing property IDs for all aliases; confirm NOVITA's actual address; resolve the 1626 shorthand; split 349/351 West 46th and Tremont/Bruckner references per reviewed row where needed.
- Verify every unit label/new unit against inventory, including run-in labels, leading zeros and commercial/store references.
- Confirm display names and household/business treatment; choose candidate/contact decisions, roles, primary contacts, country and any corrections/splits.
- Review all source cells for unlabeled notes/roles and genuinely omitted candidates; retain documented original coordinates.
- Approve the concrete nullable-login schema exception before any real schema change. The strictly additive-only requirement cannot alone support the current table's mandatory unique login email.

## Proposed controlled execution / rollback

Adam will regenerate the concrete report after staff decisions, independently verify the source file when available, reconcile all 407/959 originals plus reviewed additions, and produce an immutable package/manifest with hashes and exact existing-record snapshots. Review/hold/exclusion totals remain explicit. Authenticated approver identity is mandatory; workbook reviewer text alone does not authorize a commit.

Only after explicit approval of that concrete report, schema prerequisite and target environment/binding will Adam take/verify an approved export and prepare the separate authorized release enabling that target. The present code cannot execute a real import. Commit uses small, bounded atomic D1 record batches: guarded snapshots, entity writes, ownership, audit and non-null source mappings persist together. Resume reads persisted receipts; it never assumes a failed request wrote nothing or regenerates a new plan. A batch is complete only when manifest counts and foreign keys reconcile exactly.

Undo uses the backup plus the same batch manifest/change ownership, in reverse dependency/record order. It checks exact post-import rows, later operational use and references; it deletes only unused batch-created entities and restores only that batch's explicit changes. Revision numbers advance on restoration. Interrupted undo resumes from persisted receipts and blocks further commit. Any later edit/use stops the affected undo for review; unrelated/pre-existing records, leases, work orders, credentials and audit history are not overwritten or deleted.
