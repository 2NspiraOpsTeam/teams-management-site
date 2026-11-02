# Production readiness review — 2 November 2026

Scope: public Teams Management website, approved owner Admin sign-in, isolated synthetic resident/Admin workflows, build/dependencies, accessibility, browser engines, performance and recovery. This is an evidence-based engineering review, not a penetration-test, legal or WCAG certification.

## Verified results

- 48 sitemap pages returned successfully; 2,401 link appearances inventoried, 499 distinct URL/fragment/special destinations checked. Internal targets and local anchors passed. One Sarasota tourism destination was genuinely obsolete and has been replaced with the verified official article. Bot-blocked external sites were checked in a rendered browser; a restricted New York Times original retains its accessible archival alternatives.
- 216 menu/gallery interactions across desktop, tablet and mobile viewports passed. Additional home review/property navigation, dining property navigation, retail map modes/all individual selectors/zoom/popup, rental FAQ/PDF, and property video embed/close checks passed at desktop and mobile widths. Rental form tests intercepted the POST: required/invalid/partial inputs, server failure, retained retry values, pending disabled state, successful receipt/reset and refresh were observed without sending an inquiry.
- 543 regression tests in 63 files, TypeScript, clean production build and both GitHub integrity jobs passed. 1,336 prepared-photo renditions passed artifact checksums; 269/269 hosted photo gates passed.
- 96 candidate automated accessibility scans (48 pages at two widths) had no detected violations. Baseline accessible-name/loading-role defects were fixed. Incomplete/manual contrast, media and other checks are not certified by that result.
- 72/72 candidate Chromium, Firefox and WebKit checks passed across twelve representative routes at two widths. The reproduced WebKit mobile Escape issue was fixed with explicit menu-button focus. These are engine/viewport checks, not physical iPhone/Android or native Safari certification.
- Dependency audits reported no known advisories. Semgrep ran OWASP/TypeScript rules across 414 source files with no findings, but eleven files had partial parse warnings. A supplemental OWASP scan of their TypeScript-transpiled JavaScript completed with no parse errors/findings; it does not replace a comprehensive security audit or final-ref CodeQL.
- Anonymous session/contact guards denied access; unknown routes and private rendition paths returned 404 in a browser. Authentication cookies were HttpOnly, Secure and SameSite=Strict. Approved owner mailbox received a fresh Admin code; redemption, rendered Admin session, logout and server-side session revocation passed. No client records were changed.
- Isolated synthetic resident/Admin pages rendered at mobile width without overflow or page exceptions. A resident could not read the neighboring resident's maintenance request (404); a tenant could not access an Admin session. A five-minute operational soak completed 60 cycles / 726 requests without unexpected failures, including revision conflicts, duplicate request handling and internal-note isolation. A separate localhost-only burst completed 360 requests at concurrency 12 without failures. Neither establishes hosted production capacity.
- A fresh production snapshot restored locally: all 70 tables, schema and typed row contents matched; integrity check passed and no foreign-key violations remained. No production restore was performed.

## News header / public fixes

The News page now joins the shared New York-day property-photo plan. All six registered page backgrounds were distinct and remained stable on refresh; tests cover 366 days, reordered pools, duplicate bytes and insufficient inventory. Existing five-page selections are preserved. Mobile uses a smaller rendition of the same selected asset. The obsolete static News HTML cache was removed so publication and daily selection stay current. Desktop/mobile rendered review passed.

## Performance: measured, still needs improvement

Lighthouse lab results (one sample each, not field Core Web Vitals):

| Page | Baseline mobile performance / LCP | Candidate mobile performance / LCP |
| --- | --- | --- |
| Home | 91 / 3.5 s | 77 / 5.0 s |
| Property directory | 73 / 7.2 s | 80 / 4.7 s |
| 1365 First Avenue | 92 / 3.4 s | 96 / 2.7 s |

Desktop Home: 100 performance / 0.7 s LCP in both samples. Candidate samples had zero CLS, 0–20 ms TBT, 98 accessibility and 100 best-practices/SEO. Preview and live host/network/cache differences prevent attributing the Home score change to code alone; it is not a proven regression or improvement. Smaller mobile daily-header images mitigate directory transfer cost, but consistently good mobile LCP and field INP/CWV remain unverified.

Overlapping nearby overview pins were observed; the Individual property selector remains the reliable way to choose every address. The popup check used an unobscured visible pin rather than forcing clicks through a neighboring marker.

## Outstanding / not verified

- Apex non-www deep paths do not consistently preserve their path into www; the external registrar forwarding configuration remains a separate launch gap. www public routes and accepted sitemap work.
- Search Console permissions for the QA account are absent; actual indexing/exclusions/Google-selected canonicals remain unverified. Sitemap acceptance is not indexing proof.
- Fresh approved tenant-mailbox OTP was not exercised; only the authorized owner Admin mailbox was used. Synthetic resident tests were local, without a real outbound-mail provider. Inquiry transport and tenant notification inbox delivery were not established by intercepted submissions.
- Native Safari automation was unavailable without its disabled remote-automation setting; physical devices, manual screen-reader review and complete manual accessibility/content/caption review remain outstanding.
- No external penetration test, full dynamic attack scan, final-ref CodeQL clearance, hosted peak-traffic certification or long-duration availability SLA is claimed.
- Local restore proves local recoverability only. Isolated cloud restore, encrypted off-device recurring backups and agreed RPO/RTO remain unverified.

Private raw scans, synthetic fixtures, mail/session evidence and database snapshots are retained outside the repository with owner-only permissions. No credentials, session tokens or private database exports are included here.

## Release record

- Reviewed application: `e69b5804f7fbb3b97dcc2c121f1fb51b006786b5`; PR #42 merged into the authoritative production-preparation branch as `81f97ce05539e127db21e335bb9f40c8b19408a3` with an identical source tree.
- Candidate Pages deployment: `b19e1128`; production Pages deployment: `8e7fdbe5-6fc4-462f-9d79-f79e3e67671d`, production environment / primary branch `main`.
- Private RPC runtime version: `3ba86488-4018-4233-98c0-59031ed98f4b`. Production credentials, D1 binding and feature flags were preserved; review write freeze was removed for the serving runtime.
- Stable release fingerprint matched the reviewed application. Live News desktop/tablet/mobile, all six header uniqueness/refresh checks, corrected tourism destination and 269/269 photo probes passed.
- Previous Pages deployment `f4173ba9-5dc6-4cb9-96bb-73ce0752efb6` and its unchanged previous private runtime remain the rollback pair. Database snapshot and source/build recovery artifacts remain private. No production database migration or replacement occurred.
