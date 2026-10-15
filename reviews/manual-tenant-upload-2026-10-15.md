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

## Final release disposition

- Deployed application SHA: `00f223e109f88ea85840a8151b50681172fa69e6`.
- Active private RPC runtime: `teams-manual-upload-runtime-20261015-v2`, version
  `af3077b9-da1d-4cf7-b7c3-e705f2d0d3df`. Deploy using the existing manual-upload
  config with the explicit `--name teams-manual-upload-runtime-20261015-v2` override.
- Final isolated Pages deployment: `5f401709.teams-management-preview.pages.dev`.
- Stable Pages deployment: `9ef1a7cd-5be2-4b64-838c-91b61167593b`, primary branch
  `preview` in the Pages Production environment (this is the Teams preview site).
- Stable Admin upload URL: https://teams-management-preview.pages.dev/admin/tenants/import
- Application branch pushed: `feature/manual-tenant-upload-2026-10-15`. Main and
  the public company production site were not merged or released.

132 tests, typecheck and canonical OpenNext build passed. Actual local D1/browser
QA imported five synthetic occupants across two stages of one workbook, with two
exceptions held, one apartment created and one matched. Verified blank contacts,
multiple occupants, current status without portal grants, save failure/draft retry,
forced audit-insert failure atomic rollback/resume, same-file duplicate prevention,
refresh, invalid/clear/cancel controls, role denial and 1440/768/390 rendered layouts.
A newer synthetic workbook replaced its changed source-cell phone while retaining
an email whose source cell was blank. All alternate values remain unless their
specific source cells are explicitly replaced; no contact-value identity merge.

Authenticated isolated and stable preview verified XLSX intake, stored preview and
refresh, duplicate reopening, zero-validated-record import denial, anonymous and
cross-origin denial, existing Admin Properties/Tenants/Maintenance and the original
407-candidate review. One clearly labelled synthetic workbook is held in private
upload history; it created no property, unit, tenant, contact or assignment. No real
business approval was submitted for QA. Existing Admin session regression passed;
fresh emailed OTP and real-workbook import remain unverified. The first stable page
navigation observed a chunk404/client error immediately after promotion; the same
chunk subsequently returned200 and repeated normal stable navigation/rendering
passed. The precise historical cause was not established.

The approved preview nullable-login migration and additive directory/manual-upload
schema are applied, with scoped migration-ledger entries. Final verification proves
all 1,924 original rows across 49 tables retain every original field. Only three
migration-ledger rows and one synthetic-upload audit were added to original tables;
new configuration/staging tables contain only release configuration and that QA
upload. Foreign keys are clean. Existing counts: 2 tenant identities, 3 assignments,
13 tenant sessions, 8 maintenance requests, 244 apartments. Real imported items:0;
contacts imported:0. No identity, lease, history, note, superintendent or permission
mutations. Keep the nullable-compatible application after any future real import;
do not downgrade to the older NOT NULL contract or restore over later edits.

Fresh backup and full preservation/QA/deployment evidence remain restricted outside
Git. Rollback pairs retained: original review runtime/Pages06349e19 and earlier
manual runtime/Pages264f43fb, subject to the nullable-data compatibility constraint.

**Remaining input:** original `2026 TENANT PHONE LIST.xlsx`. All407 actual candidates
remain unimported, not falsely marked as newly validated. Real batch counts are0
imported,0 properties populated,0 apartments created/matched,0 new current occupants.
NOVITA, Tremont/Bruckner,349/351 allocations and repeat/identity issues remain held
pending exact review. Missing phone/email alone is not an eligibility blocker.
No automatic synchronization or paid service was configured.
