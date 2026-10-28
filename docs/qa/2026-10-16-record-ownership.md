# Apartment, tenancy and lease ownership

## Existing system of record

The existing D1 relational model already provides the required structure; reuse it rather than introduce a parallel schema or Rent Roll database.

- `buildings.id` identifies the property and owns its address.
- `units.id` identifies the apartment, with `building_id` referencing its property. The exact `unit_identifier` is retained. The existing unique index prevents duplicate normalized identifiers within the same property, not across properties.
- `operations_units` extends physical characteristics and operational condition; no independent tenant, financial or renewal fields are added.
- `tenant_assignments` owns current and historical occupancy. Only active assignments establish current occupancy. Historical assignments, agreements, and raw workbook names cannot keep an apartment occupied after move-out. Absence of an assignment is not proof of vacancy: explicitly confirmed vacancy remains separate from occupancy needing review.
- `operations_leases.unit_id` references the apartment. The property is resolved through that apartment, never free-text matching. The save path rejects a mismatched supplied property and prevents moving historical agreements between units.
- `operations_leaseholders` references existing tenants and supports multiple holders. Renewal predecessor links retain agreement history.
- `tenant_contacts` owns live contact data. Lease views read it through tenant IDs; contact edits do not rewrite contract rows or document content.
- `operations_lease_documents` retains private document metadata and links to existing private object storage. Upload remains disabled when storage is unavailable; this change does not provision storage or enable tenant publication.
- `operations_rent_roll_source` is preserved import provenance, not another operational Rent Roll. All original status, square footage, bedroom descriptions, expiration, security, legal rent, rent and names remain intact. Unknown codes are not interpreted.
- The Rent Roll is a live join. Verified physical corrections and lease financial values take precedence for operational display. Raw source evidence remains inspectable and separately identified in exports.

## Navigation and refresh

Apartment detail shows linked current occupants, a compact current/historical agreement list, View Leases, and existing maintenance history. Leases provide View Apartment. The full apartment lease list is scoped by stable property and unit IDs. Currently applicable agreements have an explicit indicator; overlapping current agreements require review. Tenant details retain their lease and assignment navigation.

Lease saves refresh the agreement list and its recorded-source panel together. Rent Roll reads are uncached and refresh when the window regains focus. No tenant, apartment or agreement is created implicitly by viewing data.

## Verification

- 172 tests across 23 files passed, including stable identifiers, property mismatch rejection, duplicate/retry guards, multiple historical agreements and holders, immediate financial read-through, source preservation, live contact resolution, and move-out preserving maintenance/lease history.
- Typecheck and canonical OpenNext preview Worker build passed.
- Isolated local D1 + rendered Chromium QA at 1440, 768 and 390 pixels: current occupants, two holders, historical leases, both navigation directions, physical edit cancel and refresh, lease save reflected in Rent Roll, simulated server failure preserving draft and safe retry, no page errors or page-level overflow.
- Read-only shared-preview integrity audit: zero orphan units, leases or leaseholders; zero duplicate property/unit identifiers or lease terms; zero assignment/property mismatches. No shared data mutation or schema migration was performed.
- Hosted authenticated QA requires an ordinary authorized Admin session. Both available managed profiles currently redirect to sign-in. A candidate can be uploaded and anonymously checked, but stable promotion remains gated on hosted authenticated workflows. No synthetic hosted session, session transfer or authentication bypass is used.
