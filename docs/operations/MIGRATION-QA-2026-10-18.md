# Migration QA and build comparison

The corrected Waterbear migration completed on 18 October 2026 in 111 checked batches. All 63 destination tables, schema objects and sequence values match the final rehearsal, including approved destination edits. Integrity passes and foreign-key violations are zero.

## Data coverage

| Record group | Final count |
| --- | ---: |
| Real tenant identities | 272 |
| Assignment records | 278 |
| Contacts | 206 |
| Active properties | 17 |
| Rent roll source rows for active real properties | 257 |
| Inquiries | 9 |
| Non QA maintenance requests | 4 |
| Maintenance photos | 4 |
| Media assets | 207 |
| Media objects | 126 |
| Tenant import batches | 19 |
| Import items | 808 |
| Import changes | 2099 |

Counts alone were not the acceptance test. Typed row fingerprints compare all values, including stored image bodies; schema fingerprints include indexes and triggers. The original source was exported again after migration and was byte-identical to the captured source backup. Original source resources were not changed.

The destination deliberately excludes QA people, the source QA property and its associations, old login sessions, one-time codes and throttles. It preserves its own authentication history, environment settings and approved occupant edits. Archived synthetic properties retain historical units, leases and rent-roll records outside the active portfolio. A legacy source QA identity was removed during the checked migration; the final reconciliation includes that exclusion.

An interrupted migration was rehearsed and reconciled before resumption. The final export matches the complete expected result. Never reuse the historical migration batches as a generic restore or production promotion script.

## Application checks

Admin tenant directory, property directory, apartment occupants, phone list, rent roll, maintenance, inquiries and import screen rendered successfully. Portfolio images loaded. New admin sign-in email delivery was verified with its link pointing to Waterbear. Anonymous protected access is denied. Local RPC and write-freeze behavior passed. Four focused suites passed all 28 tests and the OpenNext production build completed.

A fresh tenant sign-in after the final occupant move remains an owner acceptance check. Three source rent values remain missing or nonnumeric; their totals are explicitly partial. These are source data quality issues, not rows lost by migration.

## Deployed build comparison

Both Workers expose the same two deployed modules, `entry.js` and its source map. The source maps contain the same 31 normalized component paths with no missing or extra components. They are rebuilt artifacts and are not byte-identical.

Twenty-six components match after normalizing package-install paths and the two known per-build cache identifiers. These include the D1 metering wrapper, OpenNext Worker, image adapter, durable-object queue/cache components and runtime shims. Five components still differ:

- The RPC entry adds the optional write-freeze gate.
- Cloudflare initialization embeds a new build timestamp.
- OpenNext configuration selects the explicit pnpm build command.
- Middleware and the server handler contain recompilation changes, reordered framework module identifiers and regenerated chunks, alongside the portal-origin and importer changes in the server build.

The last two bundles are not proven semantically identical by a byte comparison. The source baseline, narrow application diff, matching 103 compiled route paths and passing tests support feature continuity; this is not a claim of exhaustive equivalence for every compiled execution path. Keep the original Worker/source archives for further comparison. The current OAuth grant does not permit Pages API configuration reads, so a complete API-side Pages configuration equality claim is outside this check. The working private gateway contract and live destination behavior were verified.

## Recovery evidence

A full pre-migration 58-table backup was restored into an isolated temporary Waterbear D1 database, re-exported and compared. Every table, schema object, sequence and stored image body matched; integrity passed with no foreign-key violations. The temporary database was then deleted without binding it to the application.

The final 63-table completed-state checkpoint passed a full local restore and exact fingerprint comparison. Its Time Travel bookmark was stable across export. A restore planner verifies file checksums and environment identity before generating commands. It never executes a restore. A live in-place Time Travel rollback was not performed, and full loss-of-account/secrets recovery has not been rehearsed.
