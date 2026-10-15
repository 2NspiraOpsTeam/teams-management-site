# One-time tenant import — private preparation only

This extends existing Teams/D1 entities. It is not Excel sync and never provisions login access. The application exposes no import endpoint. Preview/production commit and undo are hard-disabled in both runners, not merely hidden in the UI.

## Files and environment

- `workbook.py`: maintained openpyxl data-only ingestion (formula cells rejected), header-name lookup, immutable baseline comparison and source-control reconciliation.
- `plan.py`: exact existing-ID inventory validation, explicit new-unit approvals, contact role/country corrections, reviewed additions, duplicate conflicts, full optimistic read sets, bounded change manifests.
- `cli.py`: default dry-run; exclusive private output creation, no real data in the repository, explicit local DB/batch/approval/backup required for synthetic execution.
- `local_commit.py`: synthetic SQLite model of resumable record batches and guarded undo.
- `src/lib/operations/tenant-import.ts`: private D1 `DB.batch` runner and resumable, reverse-record undo. This module is not registered in the application API.
- `d1-local-harness.ts`, `prepare-d1-probe.py`, `d1-probe.cjs`: localhost-only synthetic D1 integration tests; never deploy this harness.
- `browser-qa.cjs`: rendered localhost directory checks using synthetic identities.

Python dependencies are pinned in `requirements.txt`. Use an isolated venv, never the application runtime. The original workbook, baseline, inventory snapshots, source-cell review, corrections, manifests, approval evidence and backups belong outside the repository, readable only by the operator. Before/after audits contain personal data and have the same restricted retention/access requirements as the directory. No public/audit-download API is added.

## Preparation workflow

1. Verify the original source SHA when the source file is available. Intake the exact received review XLSX as immutable baseline, recording its own content hash. A metadata SHA in the review workbook alone is **not independent verification** of the original source file.
2. Clone an authorized read-only inventory snapshot locally. Inspect actual schema, indexes, triggers, foreign keys and migration ledger; do not replay imports or old migrations. Preserve IDs and timestamps. `tenant-directory-import.sql` is additive; `tenant-directory-identity-nullable.sql` is a **separate non-additive prerequisite proposal**, not authorized for remote application.
3. Dry-run reviewed edits against the immutable baseline and local inventory. Raw source fields, candidate IDs and the original archive cannot change. An unapproved row remains pending and creates no entity.
4. Review all source cells in a separate ledger and all proposed aliases/units/names/contact roles. Never approve by parser success, inferred vacancy, name/phone/email match, repeat-group order or sheet year.
5. Recalculate conflicts after edits. Produce and hash a reconciled manifest. Do not seal unresolved review decisions/source cells. Local `seal` stamps only the local synthetic operator; it is **not real staff/user import authorization**.
6. Real import approval, environment/binding identity and approved backup/export remain separate release gates. Neither current runner can commit to preview or production. Enabling that requires a subsequent explicitly authorized release, not changing a CLI environment argument.

## Private staging contract

All fields are optional until needed. Unknown top-level fields stop validation.

- `source_cell_review`: `sheet!cell` → `{decision, reviewer, reason}`. Decisions: `mapped`, `note`, `non_tenant`, `candidate_reviewed`. Every original nonempty cell requires evidence, including names/headers/unlabeled notes.
- `corrections`: `record_id:cell` → `{values:[...], label, country, is_primary, reviewer, reason}`. Values may be corrected/split only here; original raw archive remains immutable. Country is a confirmed ISO region, never a guessed phone prefix. Splits cannot automatically select primary. Email comparison is deliberately case-folded; raw spelling is retained. Source validation hints are not identity verification.
- `new_units`: `record_id` → `{floor_number: confirmed_integer}`. Existing inventory currently requires a floor; do not invent one. Prefer verified existing unit IDs. New unit status is unverified, never occupied/vacant by inference.
- `property_overrides`: `record_id` → `{property_id, reason}`. The reason must match the reviewed row note. The alias itself must be approved.
- `updates`: `record_id` → `{before: complete_existing_tenant_snapshot, display_name, reason}`. Blank values do not clear existing data; mismatches require explicit evidence.
- `distinct_repeats`: approved repeated `record_id` → distinct-entity evidence. Matching contact values never merge people.
- `additional_candidates`: `{record, customer_cell, contacts}` entries. IDs are `A-` + the first 16 characters of the canonical hash of `[source_sha256, source_sheet, customer_cell]`; original customer/contact strings and coordinates must match the source archive. Existing source contact cells cannot be reused. Reviewed additions are reported separately from the original 407 candidates.

## Commit and recovery model

The default CLI action is dry-run. Explicit local-synthetic environment, `DB` binding, batch ID, immutable manifest, matching approval and backup path are required to execute the SQLite model. The D1 runner additionally checks active staff identity, synthetic-only database marker and approved backup hash. Actual preview/production environments are rejected before writes.

Each source record has one bounded D1 atomic batch (maximum 80 statements): optimistic read-set guards, creates/explicit updates, change ownership, private before/after audit and non-null provenance mappings commit together. The parent mapping cannot resolve to a different tenant than its contact mappings. Contacts may share a value across tenants. New assignments are proposed/inactive with unknown dates; login email and account activation are untouched. No notification/invitation paths are called.

Resume uses persisted source-item status and change snapshots. Do not regenerate a plan after interruption and do not assume a failed request wrote nothing. Completed source-record batches are reconciled and skipped. Same approved batch reruns create zero duplicates; a modified manifest/package is rejected. Existing source crosswalks block creating a replacement plan. Complete status requires exact item/change totals and a clean foreign-key check; held rows remain explicit pending provenance.

D1 undo reverses source-record order using explicit change ownership and persisted undo receipts. It compares current rows with exact post-import snapshots, rejects later operational use/edits, and uses foreign keys to block deletion of later-used entities. It removes only unused batch-created entities, restores only explicitly updated pre-existing fields, advances revisions rather than reviving stale versions, and retains audit/source provenance. Partial undo blocks commit; undo resumes from receipts. Very large individual records stop for reviewed splitting instead of unbounded writes. Restore the backup only as a separately reviewed recovery operation; never overwrite unrelated subsequent work.

## Verified test layers

- Existing JS suite plus directory regressions: no-email tenants, shared contacts, primary limits, ownership, stale saves, auth denial, normalization/verification changes and preserved login/session identity.
- Python synthetic suite: source/header/formula/ID tampering, commercial/leading-zero labels, repeats, omissions, contacts/country/splits, optimistic versions, exclusions, reruns, interrupted records and protected undo.
- Actual local D1: populated ID-preserving prerequisite migration, foreign-key enforcement, bounded atomic commit, interrupted commit/undo recovery, rerun idempotency, audit-failure rollback, later-edit rejection and disabled remote execution.
- Rendered browser: desktop/tablet/mobile; loading/empty/success/validation/backend failures; draft retention/retry, double-click, cancel/clear/refresh and unchanged active login/session on contact-email edits.


## Reconciliation / staff review continuation (local preparation only)

`reconcile.py` reads the immutable baseline and a **read-only** inventory copy. It produces a restricted JSON review bundle outside the repository: all 19 proposed property crosswalks, 407 unchanged candidates, contact gaps, exact text-unit suggestions, current assignment signals, all 90 repeat groups and original source archive. It rejects approved candidates or stale proposed property IDs. No people are merged and source data is unchanged.

Admin → Tenants → Import review opens that bundle locally in the browser. Staff can record mapping-only approvals, holds, per-record property proposals, separation/distinctness evidence and confirmation requests. Every change appends before/after review history; original candidate decisions remain `review`. The page has no import endpoint, does not upload files, and does not persist personal data in browser storage. Download the preparation draft and reopen it with its exact bundle after refresh. Unsaved work gets a navigation warning. Malformed/changed bundles and mismatched or inconsistent draft histories are rejected. File reviewer identities are self-attested preparation evidence, not authenticated release authorization. Hashes provide consistency checks, not digital signatures; a file draft must never authorize an import.

`rehearse-migration.py` accepts only a local inventory and fresh private output directory. It copies the inventory, recreates the old NOT NULL constraint, adds labelled local session/lease/maintenance/event history, seeds isolated local D1, takes a consistent SQLite backup of that D1 instance, restores it into a second isolated D1 instance and compares protected rows/schema/indexes/triggers/FKs. It verifies a forced failing migration leaves the baseline unchanged, then verifies successful nullable migration preserves all IDs/values/history. Wrangler commands are hardcoded `--local`; there is no remote option. The old inventory rehearsal is not a fresh shared-database backup. Never apply the shared prerequisite until the actual-target backup/restore, preservation and explicit release gates are satisfied.

`review-browser-qa.cjs` uses synthetic bundles only. `test_reconcile.py` verifies immutable totals, no candidate approvals, existing-assignment signals, stale inventory rejection, and preservation of leading zeros/internal whitespace in text unit labels. Sanitized reports are in `reviews/tenant-import-reconciliation-2026-10-15.md` and `reviews/tenant-import-release-plan-2026-10-15.md`. Private bundles, source values, reviewer corrections, backups and evidence must remain outside source control and deployment.
