# Canonical mailing-address data completion

Read-only remote D1 audit, 2026-10-14. No rows changed; no ZIP codes guessed.

The public/retail canonical query returned 14 records: only `1374-1st-ave` has a ZIP (`10021`). Additional preview records checked: `349-w-46th-st` and `351-w-46th-st` have `10036`; `71-e-110th-st` has no ZIP. Sarasota Unit 402 has no D1 row and retains its approved preview fixture address/ZIP (`34236`).

## Missing canonical ZIP codes

- `1365-1st-ave`
- `1626-2nd-ave`
- `166-e-118th-st`
- `170-e-118th-st`
- `171-e-74th-st`
- `173-e-91st-st`
- `225-e-83rd-st`
- `235-w-18th-st`
- `307-w-39th-st`
- `3425-east-tremont-bronx`
- `41-w-46th-st`
- `42-70-156th-st-flushing`
- `61-gold-st`
- `71-e-110th-st`

Existing `src/lib/nyc-living-facts.ts` documents exact-address/parcel NYC PLUTO 26v2 checks dated 2026-10-11 and provides candidate ZIPs for these properties. Those are evidence for a reviewed data-completion change, not silently substituted display values. Reconfirm/import into `buildings.address_json` centrally; all updated public displays, links and metadata then inherit the canonical ZIP without page-specific overrides.

## Implementation

One `addressLabel` formats stored street/city/state/ZIP as `street, city, state ZIP`; missing values are omitted, never invented. Home, directories, details, shared rotating/featured components, dining cross-links and retail map address display use it. Preview fixtures hydrate their addresses from non-archived canonical D1 rows by slug while preserving preview publication scope. Structured `Place` / `PostalAddress` data uses stored ZIP only. Sarasota navigation strips Unit 402 solely for building navigation, retaining its stored city/state/ZIP and unit-specific display. Removed the 1626 ZIP suppression and Gold Street directions ZIP override.

## Verification

Typecheck and all 46 tests (8 files) pass, including preferred display format, borough preservation, no fabricated ZIP, metadata, map/directions address consistency and Sarasota unit navigation. No preview deployment performed in this isolated branch; final rendered QA belongs to integrated deployment. Missing canonical ZIP completion remains a data blocker to claiming every displayed address is complete.

## Existing authoritative-source candidates (not applied)

Evidence location: `src/lib/nyc-living-facts.ts:1`; source annotation: “NYC Planning PLUTO 26v2, queried 2026-10-11 by exact address and parcel. Parcel-wide or ambiguous multi-address matches are intentionally omitted.” These are existing repository evidence, not a fresh live source verification in this change.

| Canonical street | City | Candidate ZIP | Recorded BBL |
| --- | --- | --- | --- |
| 42-70 156th St | Flushing | 11355 | 4053860020 |
| 3425 East Tremont Ave | Bronx | 10465 | not recorded |
| 166 E 118th St | New York | 10035 | 1016450044 |
| 170 E 118th St | New York | 10035 | 1016450041 |
| 71 E 110th St | New York | 10029 | 1016160030 |
| 173 E 91st St | New York | 10128 | 1015200034 |
| 1626 2nd Ave | New York | 10028 | 1015470002 |
| 225 E 83rd St | New York | 10028 | 1015290014 |
| 171 E 74th St | New York | 10021 | 1014090031 |
| 1365 1st Ave | New York | 10021 | 1014480025 |
| 41 W 46th St | New York | 10036 | 1012620018 |
| 307 W 39th St | New York | 10018 | 1007630031 |
| 235 W 18th St | New York | 10011 | 1007680017 |
| 61 Gold St | New York | 10038 | not recorded |

Public property/retail directories and detail headers explicitly flag missing canonical ZIP as pending verification; no page silently substitutes PLUTO values.
