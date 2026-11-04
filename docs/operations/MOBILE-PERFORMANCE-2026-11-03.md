# Mobile performance launch pass — 2026-11-03

## Scope and baseline

Baseline live application: `e69b5804f7fbb3b97dcc2c121f1fb51b006786b5`. Cloudflare Pages `teams-management-coming-soon` is direct-upload; `main` is its primary branch. The current private runtime is `teams-readiness-runtime-20261102`. Default Git main is not the deployed release baseline. Production remains unchanged during candidate preparation.

Read-only mobile Lighthouse checks covered all 48 sitemap URLs plus `/access` and `/tenant/login`. The additional `/rent-with-us/apply` path deliberately returns 404 and remains retired. Scores are individual lab runs, not field Core Web Vitals or a guarantee across devices/runs.

| Route | Mobile | LCP (s) | CLS |
| --- | ---: | ---: | ---: |
| `/retail` | 72 | 3.36 | 0.403 |
| `/` | 91 | 3.49 | 0.000 |
| `/about` | 93 | 3.27 | 0.000 |
| `/in-the-news` | 85 | 4.46 | 0.000 |
| `/properties` | 76 | 6.20 | 0.000 |
| `/rent-with-us` | 80 | 5.43 | 0.000 |
| `/gallery` | 90 | 3.63 | 0.000 |
| `/contact` | 90 | 3.71 | 0.000 |
| `/tenant-services` | 93 | 3.18 | 0.000 |
| `/services` | 92 | 3.41 | 0.000 |
| `/dining` | 92 | 3.41 | 0.000 |
| `/privacy-policy` | 100 | 0.81 | 0.000 |
| `/terms-of-use` | 100 | 0.81 | 0.000 |
| `/accessibility` | 100 | 0.82 | 0.000 |
| `/fair-housing` | 100 | 0.81 | 0.000 |
| `/copyright` | 100 | 0.81 | 0.000 |
| `/properties/1365-1st-ave` | 90 | 3.56 | 0.000 |
| `/properties/1374-1st-ave` | 94 | 3.10 | 0.000 |
| `/properties/1626-2nd-ave` | 96 | 2.80 | 0.000 |
| `/properties/166-e-118th-st` | 93 | 3.25 | 0.000 |
| `/properties/170-e-118th-st` | 91 | 3.48 | 0.000 |
| `/properties/171-e-74th-st` | 78 | 6.00 | 0.017 |
| `/properties/173-e-91st-st` | 92 | 3.41 | 0.000 |
| `/properties/225-e-83rd-st` | 92 | 3.33 | 0.000 |
| `/properties/235-w-18th-st` | 93 | 3.26 | 0.000 |
| `/properties/307-w-39th-st` | 92 | 3.11 | 0.000 |
| `/properties/3425-east-tremont-bronx` | 94 | 3.10 | 0.000 |
| `/properties/349-351-w-46th-st` | 93 | 3.25 | 0.000 |
| `/properties/41-w-46th-st` | 92 | 3.25 | 0.000 |
| `/properties/42-70-156th-st-flushing` | 92 | 3.33 | 0.000 |
| `/properties/609-golden-gate-pt` | 90 | 3.70 | 0.000 |
| `/properties/61-gold-st` | 79 | 5.69 | 0.021 |
| `/properties/71-e-110th-st` | 93 | 3.26 | 0.000 |
| `/retail/1365-1st-ave` | 92 | 3.33 | 0.000 |
| `/retail/1374-1st-ave` | 93 | 3.18 | 0.000 |
| `/retail/1626-2nd-ave` | 93 | 3.18 | 0.000 |
| `/retail/166-e-118th-st` | 93 | 3.25 | 0.000 |
| `/retail/170-e-118th-st` | 91 | 3.50 | 0.000 |
| `/retail/171-e-74th-st` | 83 | 4.68 | 0.000 |
| `/retail/173-e-91st-st` | 92 | 3.40 | 0.000 |
| `/retail/225-e-83rd-st` | 92 | 3.33 | 0.000 |
| `/retail/235-w-18th-st` | 93 | 3.23 | 0.000 |
| `/retail/307-w-39th-st` | 94 | 3.05 | 0.000 |
| `/retail/3425-east-tremont-bronx` | 94 | 3.03 | 0.000 |
| `/retail/349-351-w-46th-st` | 93 | 3.17 | 0.000 |
| `/retail/41-w-46th-st` | 89 | 3.25 | 0.000 |
| `/retail/42-70-156th-st-flushing` | 92 | 3.40 | 0.000 |
| `/retail/61-gold-st` | 87 | 4.03 | 0.024 |
| `/access` | 100 | 0.93 | 0.000 |
| `/tenant/login` | 100 | 0.93 | 0.000 |

## Focused shared changes

- Native lazy loading for non-hero gallery covers; retain eager/high-priority detail heroes.
- Viewport-deferred map API/module/tile loading with matching responsive placeholder/loaded heights; retain map controls and directions.
- Mobile/desktop-specific high-priority preloads for the existing daily header selection; no cover reassignment or rotation changes.
- Existing Sharp offline re-encoding of public covers/static small renditions, leaving originals and larger views unchanged.
- Browser-only image URL/width index instead of shipping the full server authorization/checksum manifest. URL-equivalence and compressed-size regression tests cover all prepared photos.
- Reserve gallery thumbnail height before loading; repair skipped footer heading levels without changing visual styling.

## Local verification

- 545 tests across 64 files pass.
- 204 rendered page/viewport checks pass at 320/390/768/1440px, including the retired application’s expected 404; decoded images, no page overflow or JavaScript exceptions.
- Six map scenarios at 390/768/1440px: no offscreen map API/tile requests; loading and loaded heights match (362px mobile, 462px tablet/desktop); map layer and retail individual-property controls work.
- Existing 20-view focused smoke also passes; screenshots visually inspected for homepage and map layout.
- Production build and image staging/checksum gate run against the candidate source.

No database mutations, credential changes, DNS/mail changes, real client communication or billing changes are included. Full preview metrics and release identity are recorded separately after verification.

## First production release and follow-up finding

Owner explicitly authorized production publication without requiring a separate
preview step. PR44 merged as `e15bcc4c5c47d5304abb5e9b2ce2c1f97fec332e`;
Pages production `46b2cc4b-6926-47e2-88e7-bac6b5e3f9c6` (primary `main`) serves
that SHA through `teams-performance-runtime-20261103`, Worker version
`88c68b8f-42e1-4882-aca6-434436b7e6ab`. Previous production gateway/runtime remain
available as the rollback pair. Existing credential/configuration entries were
preserved; no database write or DNS change was performed.

Early live mobile Lighthouse results: Home98, Properties99, Retail97;
all three accessibility/best-practices/SEO100 and CLS0. Thirty-two live responsive
views passed and 406 largest/changed photograph responses matched exact bytes.
The full mobile audit continues through every public page.

The remaining Rent With Us header used a newer, already-public corrected photo
that was absent from the original prepared-image inventory. The baseline and
first production audit both requested its 552,345-byte original JPEG. A read-only
publication/visibility/source-checksum check confirmed the exact currently rendered
asset. Append its unchanged original to the guarded derivative pipeline: the
960px WebP is103,608bytes (81% smaller). No image selection, caption, source bytes,
publication record or database field is changed. Inventory becomes270images,
24covers and1,346renditions. Large views remain native-capped and the original is
retained. This follow-up is limited to that missing delivery entry and tooling.
