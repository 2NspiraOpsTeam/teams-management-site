# Authorized occupancy import — source verification gate

> **Superseded status:** Original received and first 41 real tenants imported into six
> stable-preview buildings. See [actual import results](actual-tenant-import-2026-10-15.md).
> Earlier missing-file and zero-import statements below are historical.

Jeffrey authorized staged preview import of confidently identified occupants from
`2026 TENANT PHONE LIST.xlsx`, designated that workbook authoritative, and approved
Current occupancy. Missing contact information is not a blocker. Portal access,
automatic Graph sync, ambiguous identities/mappings and destructive reconciliation
remain excluded. This supersedes the preparation-only authorization in older reports.

## Completed preflight

- Confirmed the configured Cloudflare account and intended `teams-database-dev`
  preview database, distinct from the other Teams database.
- Downloaded a complete fresh remote SQL export into restricted private storage.
  SHA-256: `1a281c57eac9c96b3d82093e4c2bc4c189e5c3d2dbd37948e1edbd35252d00f4`.
- Restored that export to SQLite, then used a consistent SQLite backup into an
  isolated local D1 candidate. SQL replay into local D1 was unsuitable because of
  dependency ordering and oversized hosted-review statements; the backup route
  preserves those rows without dropping them.
- Compared 49 application tables / 1,924 rows, columns, indexes, triggers and
  foreign keys. Restored fingerprints match; foreign-key checks are clean.
- Exercised failing and successful nullable-login migration in actual local D1.
  Forced failure rolled back fully. Successful migration preserved all existing
  IDs, values, references, indexes (including the composite tenant-name index),
  triggers, sessions and operational history. Only email nullability changed.
- Live backup baseline includes 2 tenants, 3 assignments, 13 tenant sessions,
  4 Admin identities, 244 units and 8 maintenance requests. No existing lease or
  leaseholder rows occur in this fresh target; prior synthetic rehearsal covers
  those populated relationships separately.

## Selection preflight, not an import manifest

Of 407 candidates, 86 across 6 properties have one existing exact-unit proposal
and no conservative source/identity flags or active assignment conflict. These
cover 86 existing apartments. Another 319 have source/identity/mapping review flags;
2 have unresolved exact units. This is an initial shortlist, not final validation
or a declaration that the remaining records can never be imported. Missing email
or phone alone was not used as a selection blocker. No repeat group was merged.

## Blocking dependency and remaining work

The available inbound file is the derived import-review workbook. The original
`2026 TENANT PHONE LIST.xlsx` is absent from available workbook files. Its declared
hash in the review package is not independent verification. The original was
requested from Jeffrey; authority is resolved, original-file integrity is not.

Before any remote migration/import: verify original source against the immutable
package; finish row/contact/context validation and approved batch manifest; make
Current occupancy and confirmation provenance explicit; adapt the currently
synthetic-only runner with exact-target/backup/approval gates; rehearse that batch;
complete the requested apartment/contact view and candidate deployment QA; refresh
the backup if the target has changed. Retain the nullable-compatible application
after imports; never downgrade to NOT NULL or blanket-restore over later edits.

Remote schema changes: **0**. Imported tenants: **0**. Current assignments created:
**0**. Apartments created: **0**. Repeat groups reconciled: **0**. All 407 candidates
remain unimported pending verification; 86 are shortlisted, not finally approved.
Existing records remain untouched. Graph and portal invitations remain inactive.
No paid service was added. No production deployment was performed.
