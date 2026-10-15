# Manual tenant Excel upload

Authorized scope: manual Admin uploads only. Existing importer/reconciliation is
reused. No Graph, external authentication, scheduler, webhook or paid integration.

- Private Admin route: `/admin/tenants/import` (Tenants → Import / Upload).
- Workbook validation/preview, new/contact-update/unchanged/held/missing categories,
  reasoned exception resolution, exact property/unit matching and reviewed missing
  apartment creation. Multiple current occupants are supported.
- SHA-based same-file reopening; exact source lineage across versions, no fuzzy
  identity merge. Missing records never delete tenants or end occupancy.
- Existing atomic D1 importer executes bounded batches with source receipts,
  immutable manifest, optimistic snapshots and private before/after audit.
- Portal identities/activation, sessions, leases, maintenance, notes, superintendent
  assignments, permissions and audit history remain outside import write scope.
- Current occupant names and contacts appear in apartment detail; tenant list
  displays contact email separately from login email.

Initial verification: 131 tests pass; canonical OpenNext build and typecheck pass.
Fresh preview SQL backup is independently restored to two isolated local D1 stores.
49 application tables / 1,924 rows preserved through failed/successful nullable
migration and directory/manual-upload additive schema. Composite tenant-name index,
triggers, references and foreign keys preserved. Private backups/evidence are not
in Git. Rendered and hosted checks are recorded in the final release disposition.

Actual source workbook remains absent: no real workbook import is claimed. The
407 original candidates stay unimported until the authoritative XLSX is uploaded.
NOVITA, Tremont/Bruckner, combined 349/351 and repeat/identity exceptions remain
held unless explicitly reviewed. Missing phone/email alone is not a blocker.
