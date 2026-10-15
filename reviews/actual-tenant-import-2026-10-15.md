# Actual tenant occupancy import — 2026-10-15

This supersedes the missing-original / zero-real-import status in earlier October 15
reports. The first validated subset is imported into **stable Teams preview**, not
main or public-company production. No application code or deployment changed.

## Source and preparation

- Received the original `2026 TENANT PHONE LIST.xlsx`; its independent SHA-256 is
  `8a6dcf40cb6f8d7d66322c0048e52f930615d266674cfbf1ecacd5e9cc024311`, exactly matching
  the review package's recorded source. All 1,510 archived source cells reconcile.
- Reconciled 407 candidates, 959 contact cells and 19 property aliases. These are
  source counts, not unique-person or occupied-apartment counts.
- Used a private values-only copy derived directly from the original (not from the
  review workbook), preserving cell values and worksheet/row coordinates while
  omitting email hyperlinks and printer metadata rejected by the strict uploader.
  Its hash and original hash are linked in a private Admin audit event.
- Fresh complete preview SQL backup downloaded, restored with clean foreign keys,
  and registered in the existing exact-database import gate. No schema changes.

## Actual committed results

- Candidates: **407**; validated/imported now: **41**; held: **366**.
- Distinct tenant records created: **41**. Current occupancy assignments: **41**.
- Properties populated: **6**. Existing apartments matched: **41**; created: **0**.
- Imported contact cells: **89**, with source provenance and audit receipts.
- Populated properties: 171 E 74th St (5), 225 E 83rd St (4), 235 W 18th St (13),
  41 W 46th St (3), 42-70 156th St (12), 71 E 110th St (4).
- No repeat group was automatically merged. Same-file reupload reopened existing
  results; retrying the committed batch retained exactly 41 occupants/assignments.
- All imported tenant logins remain disabled. No invitations, messages, lease edits,
  maintenance edits, removals, deactivations or automatic synchronization.

The prior 86-record shortlist was provisional. Current importer checks cleared 41;
contact-format/role and other unresolved flags remain held, not silently overridden.
Six property aliases still need confirmation: `1626`, combined 349/351 W 46th,
NOVITA, 3425 E Tremont Lower Level, 3421-31 E Tremont, and Bruckner Blvd. Other holds
include repeated identities, unresolved names/units, shared contacts and source roles.

## Verification

- Exact 41-record batch rehearsed successfully through the existing application and
  actual isolated local D1, with identical preview results before remote execution.
- Remote batch committed through the authenticated live Admin import button.
- All 1,930 pre-import rows across 59 application tables retained. Original fields
  remain unchanged except the intentional backup-gate hash/verification metadata;
  new upload/import/audit rows are additive. Foreign keys clean. Existing accounts,
  sessions, assignments, permissions, notes, leases and maintenance history preserved.
- Rendered all six building apartment lists and checked every imported tenant/unit;
  verified refresh persistence. Rendered all 41 apartment details and checked Current
  status plus all 89 contact cells. Desktop and mobile rendering verified, no page
  overflow on the checked mobile detail, no runtime errors during this verification.
- Private screenshots reviewed. Original workbook, copy, source reconciliation,
  SQL backup, plans, receipts and preservation/browser evidence stay outside Git.

## Review identifiers

- Properties Admin: https://teams-management-preview.pages.dev/admin/properties
- Upload: https://teams-management-preview.pages.dev/admin/tenants/import
- Batch: `manual:24819dbf7a6726554adedfc7f72f3033b5e4963d9af5d32394fc1f9fd55fb2b3:1`
- Deployed application SHA: `00f223e109f88ea85840a8151b50681172fa69e6` (unchanged).
- Stable deployment: `9ef1a7cd-5be2-4b64-838c-91b61167593b` (unchanged).

No spend, new features, automatic synchronization, production promotion or main
merge. The remaining 366 records are not claimed imported or fully resolved.
