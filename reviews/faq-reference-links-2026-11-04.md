# FAQ government reference link removal

## Request and reproduction

Jeffrey supplied Website Content / Rent with Us screenshots showing government
link-label fields emptied and native required-field validation blocking Save.
Labels alone could not remove hard-coded destinations; blank labels would also
leave inaccessible empty anchors or fall back to defaults.

## Change

- Remove all 11 government-reference anchors from the resident FAQ, including
  NYC agencies, NYS HCR, NY law, Attorney General and security-deposit references.
- Remove their obsolete required label slots from Website Content. Keep all 13
  questions, answer text, existing content keys, property links, and forms intact.
- Project saved draft/public/previous snapshots onto the current text catalog so
  retired keys cannot prevent saving or recovery. Preserve staff wording and
  fall back to approved defaults only for missing current keys.
- Older stored JSON and audit records remain untouched until an ordinary save;
  no migration, production content mutation, or tenant/contact change.
- An already-open pre-release editor must reload after publication. Stale editor
  requests remain rejected, rather than silently discarding unsaved input.

Scope is FAQ reference links, not removal of geographic wording from answers or
elsewhere on the website. This change is independent of Phone List PR #50.

## Verification

- 548 Vitest tests / 64 suites passed. Regression coverage exercises old saved
  link keys, preserving custom question wording, save/readback and restoration.
- Production-mode Next build and typecheck passed.
- Canonical `build:preview:worker` passed, including staging and checksum checks
  for all 1,346 photo renditions. No deployment performed.
- Python recovery 6/6 and integrity 7/7 passed.
- npm full/production and pnpm high-severity audits found no vulnerabilities.
- Actual WebsiteContentEditor and exact FAQ JSX rendered locally with compiled
  application CSS at 1440, 768, and 390 pixels, synthetic API fixtures, and a
  Next Link adapter. Save/cancel, required answer validation, refresh persistence,
  duplicate save, backend failure/retry, conflict draft retention, and recovery
  passed. Separate SQLite tests verify actual persistence handlers.
- All 13 FAQ items render with zero anchors; keyboard opening works. Six scoped
  axe scans (FAQ/editor at each width) passed, with no browser exceptions or
  document overflow. Desktop/tablet/mobile screenshots inspected.
- Hosted authenticated save, hosted preview and production are not verified.

## Release boundary

Base: `0adcc65a518828e03167f4ca873db59405e61d5c`, production preparation branch.
No merge/deploy: repository AGENTS.md requires explicit owner approval of the
concrete production release. Preserve production credentials, data and rollback.
