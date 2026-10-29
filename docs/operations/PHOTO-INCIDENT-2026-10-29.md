# Preview photo delivery incident — 29 October 2026

## Cause and recovery

The shared-login application build referenced the prepared-image manifest but its
uploaded OpenNext asset directory omitted both generated photo namespaces. Public
HTML and authentication checks passed while guarded photo requests returned HTTP
503, `Image temporarily unavailable`. This was a packaging regression, not lost
photo selections or deleted database images. The prior release gate sampled JS/CSS,
not actual photographs; the monitor checked HTML and invocation errors, so handled
503 photo responses were not independently detected.

Restaged all 1,336 renditions from the retained generated sources, checking every
checksum, and uploaded the matched existing application/artifact to the same private
preview runtime. Application SHA stays `56bfee21d676788d65323a2facccf59e7b0bba06`;
repaired Worker version is `77fb3c01-2600-4bf4-954b-fb5d6f8470d0`. Pages gateway
`76358df1` and its service binding remain unchanged. The previous Worker version
`cfd5e4b8-0b97-42db-8e6e-d9fb9fb41c89` is the incomplete artifact, NOT an image-safe
rollback target. No database, sender credentials, photo assignments or company
production deployment changed.

## Mandatory prevention gates

1. Use `npm run build:preview:worker`, not a plain OpenNext build, for this preview.
   It stages generated renditions and verifies the complete artifact.
2. Run `npm run verify:photos:artifact` immediately before **every** preview Worker
   upload, including runtime-only fixes. Review/candidate Wrangler configurations
   enforce this check as a build hook. Any generated private release config must
   retain an equivalent hook; do not bypass it with `--no-build`.
3. Gateway staging now rejects incomplete prepared-image artifacts as well. Do not
   copy `_photo-variants` into Pages: guarded photos must retain live publication
   and source-checksum authorization.
4. Run `node scripts/images/live-gate.cjs <origin> <application-sha>` against the
   candidate and stable preview. It checks all 269 prepared source responses,
   content types and exact bytes. Guarded API responses require release attribution;
   public edge-served static photos are attributed by exact content hashes.
5. `check_release.py` additionally checks actual rendered homepage photo URLs.
   HTML, JS and CSS success alone is not a release pass. Browser QA must decode
   photos on Home, directory, retail, dining and a property detail, across widths.
6. The existing half-hourly integrity job now runs this checkout's monitor with
   three bounded public-photo checksum probes. It preserves its schedule, state
   and delivery settings. A photo failure is an immediate incident condition;
   unchanged incidents are deduplicated. This is sampling, not continuous coverage
   or a guarantee against every future outage. The scheduled invocation succeeded
   after the update; healthy checks remain silent.

## Verification

- All 1,336 local renditions fully decoded and checksum-verified.
- All 269 prepared source responses checked on stable: exact expected bytes.
- Browser decoded every mounted image on Home (43), directory (46), retail (45),
  dining (4), and a representative property detail (106, including map/nearby assets).
  Lazy images were explicitly loaded before asserting no failures.
- 539 automated tests across 61 files and TypeScript check passed; seven Python
  release-gate tests passed. Hosted release gate passed 26 requests/five pages,
  including actual homepage photos and anonymous auth boundaries.
- Private evidence and exact deployment/settings snapshots are outside Git.
- Company production, fresh emailed-code login and every property-detail visual
  are not claimed verified by this image-only recovery.
