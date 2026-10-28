# Tenant directory migration/import — conditional release and rollback plan

## Authorization boundary

Jeffrey accepted preparation QA and approved separation of tenant contacts from authenticated identities. Local nullable-login migration preparation/testing may continue. **This is not an authorization to apply a shared schema migration, approve any of the 407 candidates, or import/change real tenant records.** No shared migration or deployment is included in this delivery. Cost remains $0 in added services/infrastructure; existing local D1 tooling only.

This plan is provisional until Teams resolves the reconciliation report. It is not an executable or approved import manifest. Schema rollout and data import are separate releases and separate approvals.

## Gate 1 — finish reconciliation without modifying source

- Preserve received XLSX, immutable baseline, 1,510 source cells and their coordinates, 959 original contact cells, all 407 original candidate IDs, corrections/splits, review exports, and content hashes in restricted private staging. Do not commit those artifacts or backups.
- Obtain the original source XLSX and independently verify its declared SHA-256. The review-workbook metadata is not sufficient.
- Teams confirms exact property IDs, NOVITA/Bruckner addresses, combined-address allocations, roster authority, unit inventory/floors, contact semantics and existing-tenant/assignment links. Do not merge people from names/phones/emails.
- Review-screen history is preparation evidence only. File reviewer names are self-attested; authenticated staff/release approval is required separately. Revalidate any draft against its exact baseline/inventory hash and original provenance. Never pass a browser draft directly to the commit runner.
- All 407 candidates remain `review` in this scope. A later expressly authorized review must supply candidate/contact/source-cell decisions. Report approve/hold/exclude/review separately; no unresolved row silently becomes an exclusion.

## Gate 2 — concrete shared schema release proposal

Before asking to apply the non-additive prerequisite, prepare these reviewable artifacts for the exact shared target:

1. Record exact account, binding, database ID, deployed SHA and compatible rollback SHA. Inspect actual schema, every referencing FK, indexes, triggers, migration ledger and current revisions. Compare with the migration's fixed five-column table definition; any additional column/index/trigger blocks it until accounted for. Never bulk-apply historical migrations.
2. Take a current complete authorized export/backup; record hash, timestamp and recovery point. Use the existing provider recovery capability only if available on the existing plan—no paid plan upgrade. Test restoration into an isolated local D1 target and compare all protected IDs, values, tenant sessions/revocation, assignments, leases, maintenance requests/events/notes/statuses, audit records, indexes/triggers and foreign keys.
3. Replay the proposed prerequisite on the restored populated dependency graph. The repeatable local rehearsal reconstructs the prior NOT NULL table on a private inventory copy and adds labelled synthetic session/maintenance/lease history. It does not claim that the old inventory is a fresh full shared backup. A fresh actual-target backup/restore test is still required before shared execution.
4. Validate the nullable-login migration using an atomic D1 batch with deferred foreign keys. Preserve every existing ID, email, activation flag and creation timestamp. Assert schema fingerprints and all reference counts/digests immediately before execution. Include a forced-failure atomicity proof. Do not run individual rebuild statements independently against a shared database.
5. Order: nullable-login compatibility prerequisite → additive directory/import tables → compatible application. Do not open contact-only creation until the database supports NULL login and the compatible app is verified. New directory records have no fabricated login and portal access disabled. Contact edits do not change identity or sessions.
6. Coordinate a short write hold or equivalent validated staleness barrier for the actual rebuild and verification. Stop if concurrent data/schema changes invalidate the snapshot. Retain existing secrets, bindings and the current stable release. No email/invitations are part of this change.
7. Present exact migration checksums, backup/restoration evidence, target identity, code SHA, zero-real-import verification and rollback instructions for explicit release approval. Do not execute the shared migration before these gates and approval are satisfied.

## Gate 3 — separate real-data import release

Only after reconciliation and explicit approval of the concrete import package:

- Generate an immutable manifest bound to original source/package hashes, parser version, reviewed corrections, exact existing IDs/revisions, approval identity, target and a verified current backup.
- Report exact creates, explicit updates, proposed/inactive links, held/excluded/review records, all 407 original provenance outcomes, all 959 contact cells and reviewed additions separately. Do not fabricate occupancy, dates, floors, leases or access rights.
- The present SQLite and D1 runners **reject preview/production**. Real execution requires a separate narrowly scoped, reviewed release; selecting an environment or editing a browser draft does not enable it.
- Commit bounded logical records with optimistic assertions, entity mutations, explicit change ownership, private before/after audit and source crosswalks in the same D1 atomic batch. Keep approval receipts immutable. Reconcile persisted receipts after uncertain requests; resume the original batch and do not regenerate a replacement plan.
- Verify totals, referenced IDs, public/tenant denial, unchanged sessions/login, maintenance history and foreign keys. No invitation, email or notification path is called. Stop on any unexplained delta.

## Rollback — schema and data are distinct

**Before import / schema-only failure:** pause affected writes. Retain the current application or restore the verified compatible release. If the atomic prerequisite fails, confirm rollback using schema and protected-row fingerprints. If recovery requires restoring a database backup, do so only under an approved write hold and after confirming no later legitimate writes would be lost. Never blanket-restore over subsequent operational changes.

**After contact-only records exist:** do not blindly restore the old NOT NULL schema or old application. NULL-login records cannot satisfy it. Keep the compatible nullable schema/application or prepare an explicitly reviewed forward repair. Do not fabricate logins or delete directory records to force downgrade.

**Imported data undo:** use the original batch manifest and persisted ownership snapshots, in reverse dependency/record order. Restore only explicitly changed fields; delete only unused batch-created entities. Check exact post-import revisions and later references/use. Preserve source mappings/history, advance revisions and retain audit evidence. Any later staff edit, session, assignment, lease or maintenance use stops that record's undo for review. Interrupted undo resumes its persisted receipts and blocks forward commit. Unrelated/pre-existing data is never replaced by a bulk snapshot.

**Recovery closeout:** reconcile expected and observed counts, hashes, FK/index checks, retained audit history and blocked records. Run tenant/Admin auth/contact/maintenance verification separately. Document the exact recovered application and database state. No real rollback is executed during preparation.

## Current local evidence

- 112 JavaScript tests, 23 Python tests; TypeScript and preview Worker build pass.
- Synthetic rendered Admin review QA: anonymous/tenant denial; malformed/tampered bundles; required reviewer/evidence/exact property; double-click safety; draft download/reopen after refresh; wrong-bundle draft rejection; filter/empty/clear/cancel; candidate approval absent; 1440/768/390 widths with no overflow/page errors.
- Prior local D1 commit/undo tests cover interruption/resume, duplicate reruns, audit failure atomicity, stale edits and later-use preservation.
- Local D1 backup restoration and nullable migration preserved **53 tables / 279 fixture rows**, including populated session, assignment, lease and maintenance/event/notification history. Indexes, triggers and FKs were preserved. An intentionally failing rebuild rolled back completely. Evidence and the verified backup remain restricted locally. Shared-target backup freshness/restoration, hosted review deployment and any real schema/import execution remain **not verified/not performed**.
