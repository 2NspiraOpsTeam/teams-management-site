# Tenant import reconciliation — 15 October 2026

## Status

Local preparation only. All **407 candidates remain review/unapproved**; zero real creates, updates, links or merges. Original workbook/baseline/source coordinates are unchanged. Staff mapping resolutions are a separate review ledger, not candidate or release approval.

## 19 property aliases — proposed, not approved

| Source sheet / section alias | Rows | Proposed canonical property / exact ID | Resolution |
|---|---:|---|---|
| 166172 LLC / 166 East 118th Street | 72 | 166 E 118th St (`real-166-e-118th-st`) | Deterministic address suggestion; staff approval pending |
| 166172 LLC / 170 East 118th Street | 34 | 170 E 118th St (`real-170-e-118th-st`) | Deterministic address suggestion; staff approval pending |
| 225 E 83RD / 225 East 83rd | 13 | 225 E 83rd St (`real-225-e-83rd-st`) | Deterministic address suggestion; staff approval pending |
| 1626 2ND / 1626 | 20 | 1626 2nd Ave (`real-1626-2nd-ave`) | Management confirmation |
| 171 E 74 / 171 E 74 Commercial | 7 | 171 E 74th St (`real-171-e-74th-st`) | Deterministic address suggestion; staff approval pending |
| 171 E 74 / 171 E 74 Residential | 9 | 171 E 74th St (`real-171-e-74th-st`) | Deterministic address suggestion; staff approval pending |
| 1365 1ST AVE / 1365 1st Avenue | 28 | 1365 1st Ave (`real-1365-1st-ave`) | Deterministic address suggestion; staff approval pending |
| PECORA 110 / 71 East 110th Street | 14 | 71 E 110th St (`build-004`) | Deterministic address suggestion; staff approval pending |
| SECONDO LLC / 235 West 18th | 23 | 235 W 18th St (`real-235-w-18th-st`) | Deterministic address suggestion; staff approval pending |
| 349351 W 46 / 349/351 West 46th Street | 13 | 349 W 46th St (`real-349-w-46th-st`); 351 W 46th St (`real-351-w-46th-st`) | Management confirmation |
| NOVITA LLC / NOVITA LLC — address unconfirmed | 17 | **Unmapped** | Management confirmation |
| PECORA REALTY / 1374 First Avenue | 30 | 1374 1st Ave (`real-1374-1st-ave`) | Deterministic address suggestion; staff approval pending |
| COLUMBUS 104 LLC / 42-70 156th St. | 38 | 42-70 156th St (`build-001`) | Deterministic address suggestion; staff approval pending |
| 2026 166172 LLC / 166 East 118th Street | 36 | 166 E 118th St (`real-166-e-118th-st`) | Deterministic address suggestion; staff approval pending |
| 2026 166172 LLC / 170 East 118th Street | 34 | 170 E 118th St (`real-170-e-118th-st`) | Deterministic address suggestion; staff approval pending |
| 41 W 46 / 41 West 46th Street | 9 | 41 W 46th St (`real-41-w-46th-st`) | Deterministic address suggestion; staff approval pending |
| PRONTO LLC / 3425 E Tremont Lower Level | 3 | 3425 East Tremont Ave (`build-002`) | Management confirmation |
| PRONTO LLC / 3421-31 E TREMONT AVE. | 5 | 3425 East Tremont Ave (`build-002`) | Management confirmation |
| PRONTO LLC / BRUCKNER BLVD. | 2 | **Unmapped** | Management confirmation |

Archived combined properties `build-003` (166–170) and `real-349-351-w-46th-st` are deliberately not proposed. Commercial/residential sections at 171 East 74th share a property, not a tenant identity. Existing unit labels remain text.

## Decisions genuinely needed

- **NOVITA:** 17 candidates. No street address is established. Teams must provide address/property ID and supporting lease/roster evidence; no match to another portfolio property is inferred.
- **349/351 West 46th:** 13 candidates under one alias. Both separate buildings exist. Teams must identify each row’s building; identical apartment labels do not identify the building. Split the property mapping per source record, not the person automatically.
- **PRONTO:** lower-level 3425 (3 rows) is a plausible `build-002` match but needs entrance/unit confirmation; the 3421–31 range (5 rows) needs confirmation against that same property; Bruckner (2 rows) has no numbered address and stays unmapped. Do not split every row blindly or create properties/units from these headings.
- **1626:** 20 candidates. The source tab supports Second Avenue as a strong suggestion, but the alias itself is only “1626”; confirm the full address and commercial/unit layout.
- **Roster authority:** 254 rows carry repeated-roster flags. The two 166/170 rosters and repeated within-sheet blocks need an explicit authoritative source/date or reviewed per-row resolution. “2026” and first occurrence are not authority.
- **People/contact semantics:** household versus business contacts, alternate/CC roles, primary selection, malformed numbers, unknown country, blank fields, vacancy markers and run-in name/unit text need evidence. Blanks never clear existing information or imply vacancy.

## Repeat/conflict reconciliation

- **90 exact raw-label + ordered-contact repeat groups:** 57 pairs and 33 triples; 213 source rows, 123 excess occurrences. 68 groups cross worksheets. These are not 90 confirmed duplicate people.
- **6 same-label/different-contact groups (12 rows)** require source-authority/contact review. They remain distinct unresolved source records.
- Deterministic: enumerate every original occurrence, source coordinate and contact cell; compare exact signatures across sheets; identify differences. Not deterministic: deciding whether to exclude a repeat, merge a person, or select an authoritative contact. No people are merged on name, email or phone.
- Private review bundle contains all 90 group IDs, member source-row IDs, flags and original contact cells. The sanitized report intentionally omits tenant contact values.

## Missing contacts

| Condition | Source rows |
|---|---:|
| Missing email (includes both missing) | 108 |
| Missing phone (includes both missing) | 17 |
| Both missing | 13 |
| Email only missing | 95 |
| Phone only missing | 4 |

Missing-cell detection is deterministic, not validation of remaining values. Missing contacts do not prevent a staff-only directory record after approval; no dummy email or portal identity is created. Recovering a missing value requires Teams evidence, not web lookup or inference.

## Existing assignment risks

- 153 source rows have at least one exact proposed-property/text-unit inventory suggestion; **254 have none**. These counts are candidate rows, not unique units. None has an exact-unit collision with the current assignment snapshot.
- This is **not assignment clearance**: two 41 West 46th rows have unresolved unit labels (source rows 8 and 12), while that property already has an assignment. Those rows must be resolved before claiming absence of conflict. Other unresolved labels, combined-address headings and repeated rosters may also conceal collisions.
- A read-only snapshot contains 2 tenant accounts and 3 assignments, including QA links. Existing assignments are not revoked, replaced or inferred from workbook occupancy. Exact IDs, all referenced revisions and the actual current tenant/unit/property relationships must be revalidated immediately before any future commit.
- Imported links remain proposed/inactive with unknown dates until expressly confirmed. Existing tenant IDs, sessions, maintenance IDs/statuses/assignment links and audit records are protected.

## Deterministic vs management-owned

Deterministic local work: control totals/hashes, immutable provenance, full repeat enumeration, raw missing-cell counts, exact-address/property suggestions, archived-property exclusion, exact text-unit suggestions, current-reference/staleness checks, and schema/backup restoration tests.

Teams-owned decisions: NOVITA/Bruckner addresses; range/combined-building/unit allocation; source authority; same-person/household/business identity; conflicting contact values/roles/country; vacancy interpretation; unit additions/floors; existing-tenant linking; approval/exclusion/hold decisions. Staff may approve property mappings in the local interface, but all 407 candidate decisions remain review.

## Staff review delivery

Admin → Tenants → Import review (local build only). Open the private generated JSON bundle. Review aliases, candidate issues, all repeat occurrences and append-only decision history. Download the review draft; reopen it with the same bundle to resume after refresh. The page does not upload the workbook, persist personal data in browser storage, call an import API, or provision access. Reviewers in this file-based preparation screen are self-attested; authenticated release approval is a separate gate.

Correction/split resolutions remain separate from the immutable source. The existing guarded planner must revalidate every accepted decision; a browser draft is never executable import approval.

Reconciliation is **structurally complete, semantically pending Teams decisions**. A separate conditional release plan accompanies this report; no real import package is sealed.

## Local verification

112 JavaScript and 23 Python tests passed; TypeScript and preview Worker build passed. Rendered local Admin review passed at desktop/tablet/mobile widths. A verified local D1 backup restored into a separate instance; nullable migration preserved 53 tables / 279 fixture rows, including populated sessions, assignments, lease and maintenance history, indexes, triggers and clean foreign keys. Forced migration failure rolled back completely. Hosted preview verification and shared migration/import were not performed.
