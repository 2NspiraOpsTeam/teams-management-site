# Tenant reconciliation — second actual import, 2026-10-15

Supersedes the cumulative counts in `actual-tenant-import-2026-10-15.md`.
This is the existing authorized **Teams preview**, not public production.

## Actual results

- 407 original candidate rows reconciled; these are not unique-person counts.
- Added 28 reviewed tenant records and current assignments: 21 contact-only holds
  and seven source unit/name boundary recoveries against exact existing units.
- Cumulative: **69 tenant records, 69 current assignments, 69 existing apartments,
  six properties; zero apartments or buildings created.**
- Properties: 171 E 74th (6), 225 E 83rd (7), 235 W 18th (19), 41 W 46th (3),
  42-70 156th (29), 71 E 110th (5).
- 338 candidate/source rows remain held. They consolidate into **215 exact-source
  review groups**, with 123 redundant source entries grouped for presentation only.
  Grouping neither merges identities nor authorizes assignments.
- No inferred unit equivalences, floors, surnames, identity merges, credential
  changes, invitations, removals or deactivations.

## Reconciliation evidence

All 28 additions were checked against the original source, existing property/unit
IDs, no active apartment occupant and no existing same-name account. Contact values
and source coordinates were retained verbatim, including relative/third-party
annotations; these are unverified roster contacts, not verified ownership or login
identities. Seven original labels explicitly contain inventory unit tokens followed
by the complete remaining source name; reviewed boundaries recover those values
without inventing unit equivalences. Business/church entities remain verbatim.

Fresh remote SQL backup restored cleanly. The exact stage was rehearsed in isolated
local D1, then the authenticated remote review matched the successful rehearsal.
A transient review request failed after earlier saves; persisted revision was read,
completed resolutions reconciled, and only unsaved resolutions resumed. Stage 29
committed 28 records through the existing guarded importer.

## TM handoff

Private `TM-Tenant-Reconciliation.xlsx` contains eight building/topic questions,
215 grouped exception entries, all 407 source locators, all 959 original mapped
contact cells, the current property/unit inventory and 40 additional source parsing
suggestions. Editable TM fields cover exact property/unit, full occupant names,
current status, contact ownership, reviewer and evidence. Proposals are not approvals.

Primary review-group categories (mutually exclusive):

- Exact unit mapping / floor confirmation: 93
- Building mapping confirmation: 55
- Separate full occupant identities: 31
- Repeat/current identity confirmation: 29
- Vacancy marker: 3
- Non-tenant/context review: 3
- Source name/unit clarification: 1

The remaining workload is above 10%; no artificial completion target was applied.
TM confirmation of A/B-prefixed unit conventions, repeated blocks and property
aliases could resolve many source rows together. Vacancy and non-tenant source rows
must not be counted as missing occupants. No TM outreach was sent.

## Verified layers

- Local D1: exact 28-record stage; all 2,947 pre-stage rows across 59 tables
  preserved except intentional saved-review fields; foreign keys clean.
- Remote D1: same preservation result, allowing intentional backup-gate/review
  metadata, plus 69 current assignments and 163 source contact values verified.
- Browser: rendered all 28 new apartment details and 74 contact cells across five
  affected buildings; Current status, list rows and refresh persistence checked.
  Mobile screenshot inspected; no page overflow or runtime errors. The original
  41 records already had complete rendered verification; their rows remain preserved.
- Same-file reupload and committed-stage retry retained exactly 69 records without
  duplicate apartments, occupants or assignments.
- All imported accounts have NULL login email and remain inactive.
- No application code/deployment changed; no production promotion.

## Identifiers

- Admin: https://teams-management-preview.pages.dev/admin/properties
- Stage: `manual:24819dbf7a6726554adedfc7f72f3033b5e4963d9af5d32394fc1f9fd55fb2b3:29`
- Deployed SHA: `00f223e109f88ea85840a8151b50681172fa69e6` (unchanged).

Private source, backups, resolutions, workbook and rendered evidence remain outside
Git. Unrelated tracked local Wrangler SQLite/state changes were left untouched.
