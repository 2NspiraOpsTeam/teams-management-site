# Usage, SEO readiness and backend hardening — 19 October 2026

## Scope and release

Jeffrey requested a Cloudflare/D1 runaway-limit review, safe optimizations that preserve frontend effects, all-page SEO/AI discoverability, and backend hardening. No plan/billing change, production-domain release, schema migration, real-record mutation, live email send, or indexing of the review portfolio was authorized or performed.

- Application: `5711f53` on `fix/property-media-management-20261019`.
- Canonical review: https://teams-management-preview.pages.dev
- Private runtime: `teams-cover-cache-20261019`, version `082326f6-d1a2-4239-a57e-a3a77050023f`.
- Candidate gateway: `d725ffeb`, branch `usage-seo-security-review`.
- Stable gateway: `5e1a5bc1-529d-4409-9b54-45ed8d2a042c`, primary branch `preview`, Pages Production environment (not client production).
- Recovery pair preserved: gateway `4f0c3609-0d10-4c24-8459-f1426df2d3dc` and runtime `teams-share-preview-20261019`. Recovery must restore both environment binding and matching gateway; no database restore is required for these source-only changes.

Both Pages environments' existing variable/D1 bindings were preserved by selective service-binding patches. The active fingerprint is `cover-cache-20261019`. The actual www company site remains unchanged.

## Provider usage snapshot

Account and active database were matched through actual Pages/Worker bindings, D1 inventory and D1 database detail. Database `teams-database-dev` has 65 tables and a provider-reported file size of **98,541,568 bytes**. Five account databases total about 99 MB, well below the documented 5 GB Free account storage baseline; the main database is about one fifth of the 500 MB Free per-database baseline.

Current provider documentation was fetched for Workers limits and D1 pricing/limits. Free baselines are 100,000 Workers requests/day, 5,000,000 D1 rows read/day, and 100,000 rows written/day. Reset is midnight UTC, currently **5 PM PDT**. Quotas are shared account-wide, not isolated per database. Current subscription API access was unavailable; retained same-day subscription evidence showed Free plans. No paid plan was enabled. Compare against Free baselines, not a newly verified billing entitlement.

D1 analytics snapshot (provider data obtained at 02:12 UTC and still unchanged when queried at 02:19 UTC on 20 October):

| UTC day | Rows read | Rows written |
|---|---:|---:|
| 19 October | 2,110,110 | 15,261 |
| 20 October to snapshot | 1,320,683 | 1,022 |

The current-day values are **26.4%** of the Free read allowance and **1.0%** of the write allowance: nominal remaining read headroom is 3,679,317 rows, subject to provider reporting delay and subsequent activity. Only the active Teams DB returned D1 activity in the queried account window. The other account's isolated development resources were not swept, queried or changed.

Hourly D1 reads for 20 October: 00:00 UTC **1,110,574**, 01:00 **187,866**, 02:00 partial **22,243**. Heavy activity had tapered. Sustaining the busiest hour would exceed the Free daily allowance in roughly 4.5 hours from an empty daily budget; do not extrapolate it as normal visitor traffic or infer the actor from analytics.

Account Workers adaptive analytics at 02:19 UTC returned **8,622 invocations** since reset: 1,680 success, 6,930 clientDisconnected, 12 exceededResources. These are invocation analytics, **not the exact enforced/billable counter**; Pages gateways and RPC execution must not be summed into a claimed visitor or billed-request count. Earlier script/hour grouping placed the 12 resource errors on `teams-daily-hero-20261019` and `teams-city-rail-20261019`, six each, in the 00:00 UTC hour. They are not D1 daily-cap errors. No observed daily-cap exhaustion was established in this review.

The first generic-time D1 analytics requests returned an analytics-budget rate-limit response; a bounded D1 Query Insights request and hour-filtered D1 aggregates succeeded. This analytics limiter is separate from application request or D1-row quota exhaustion.

## Runaway checks and optimization

A normal-cache, non-intercepted five-minute live homepage carousel observation on the prior active build recorded **16 distinct first-time image requests**, no duplicate image paths, no page errors and no additional requests in minutes four/five. Motion continued. This is a bounded observation, not a traffic/load test or whole-account guarantee.

Source review confirmed:

- No periodic idle Admin change polling; shared focus checks are throttled to 15 seconds, hidden views do not reload, and requests time out after ten seconds.
- Gallery transitions are foreground/viewport gated; visited image nodes are retained and repeated failed sources are suppressed with a bounded set.
- Public navigation prefetch remains disabled where already configured.
- Existing public projections/images retain 60-second caching. Private sessions, tenant/Admin data and documents remain uncached.

One-hour D1 Query Insights ranked **property-cover selection** first: **970 rows/read**, 24 executions, 23,280 total reads. Other top-five families were much smaller. Query text is retained privately, not published in this report.

Implemented a 60-second cache around the already publication-filtered public showcase projection. Keys separate release, preview/published scope, residential/retail, covers/all images, and explicit-cover/fallback rules. Visit-specific allocation still runs separately; image bytes, gallery order, carousel timing, effects, card sizes and navigation are unchanged. Raw eligibility queries remain available to noncached internal callers. Cache failures fall back to the existing guarded SQL; no private/Admin inventories or sessions were added to shared cache.

Candidate live-tail samples included one homepage request with **1,106 reads/5 queries** and three warm homepage requests with **68 reads/2 queries**, zero writes and no usage warnings. This includes pre-existing caches as well as the new cover cache: do not attribute the entire cold-to-warm difference solely to this change. Unit tests prove repeated selection calls reuse one guarded load and isolate selection scopes. Tail events were incomplete relative to the complete browsing cohort; these samples do not establish aggregate hosted savings, complete CPU distributions or a visitor-capacity guarantee.

## SEO / AI discovery readiness

Used Next.js native metadata/robots/sitemap support; no paid or custom indexing service was introduced.

- Audited **46 reachable public pages**: 15 general/legal pages, 16 residential details and 15 retail details.
- All 46 returned 200, one H1, nonempty unique titles, descriptions, matching page-specific Open Graph descriptions/titles, self canonicals on the review origin, and parseable Organization/WebSite JSON-LD. Detail pages retain Place data.
- Added consistent page/social metadata and descriptions to previously title-only legal pages; removed the single-property special-case canonical in favor of all-property canonical coverage.
- Added Organization IDs, approved logo URL, website/publisher references and explicit language.
- Added `robots.txt` and `sitemap.xml`. Preview robots disallows crawling and the preview sitemap contains no draft portfolio URLs. At production build time the sitemap uses only publication-filtered building/retail selectors and public static routes; Admin, access, tenant portal, API and disabled application routes are excluded.
- Production metadata points at the existing `https://www.teamsmanagement.com` origin. This release does not attach that origin or replace its coming-soon deployment.
- Admin/access/resident login surfaces remain noindex even in a production build. Preview-wide noindex remains intact. Sharing crawlers can still retrieve current HTML directly without cookies.

**Launch gate:** the review site is intentionally not searchable. Search-engine/AI indexing requires the separately approved production release with the correct production build/publication scope, followed by live production robots/sitemap/canonical checks and any desired owner search-console submission. No search-console submission, observed indexing, ranking or AI citation is claimed. Structured data and clean crawlable HTML improve machine readability; they cannot guarantee discovery or ranking.

## Backend review and hardening

Reviewed direct routes and delegated authorization paths, including operations and office-maintenance handlers. Existing per-route session validation, separate Admin/Tenant cookies, assignment checks, same-origin mutations, parameterized values, public DTOs, publication gates, private document/media guards, retry receipts and notification attempt bounds were retained. Existing domain-based Admin eligibility policy was not changed.

Implemented:

- Admin and Tenant sign-in endpoints require JSON and bound the body to **4,096 bytes before JSON parsing/database work**; malformed/nonobject bodies and oversized streams receive controlled errors. Origin checks still precede parsing. This does not change OTP expiration, attempt limits, session issuance or recipients.
- Conservative CSP: `base-uri 'self'; object-src 'none'; frame-ancestors 'self'`, supplementing existing frame, nosniff, permissions and referrer protections. No restrictive script/style rule was added that would disable current effects/maps.
- Noindex/nofollow/noarchive response headers for Admin, API and private tenant/access paths; explicit private no-store on Tenant APIs.
- Extended security middleware coverage to all public legal/crawler routes.

`npm audit --omit=dev` reported **zero known vulnerabilities** in the production dependency audit. This is advisory-database coverage at the time checked, not a penetration-test certification.

## Verification and unresolved limitations

- **Local verified:** 285 tests across 38 files; TypeScript; complete OpenNext preview build (including lint/type validation); clean diff checks. Tests include body-size/chunked-stream rejection before database calls, origin/malformed/type rejection, cache isolation/fallback, production-vs-preview discovery gates, publication/media and existing operational behavior.
- **Candidate verified:** all 46 SEO routes; crawler gates; anonymous denial; forged-session rejection; existing approved Admin session; cross-origin/oversize/malformed/content-type sign-in responses; mobile/tablet/desktop carousel movement, hover pause, reduced motion/manual navigation, no page overflow or JS page errors. No real record writes/emails.
- **Stable verified:** all 46 SEO routes and crawler gates; same security checks and existing-session regression; rendered responsive/motion checks. Public cookie-free TelegramBot homepage, robots and sitemap returned 200 with the intended release. Canonical gateway/branch/commit/runtime were confirmed through the control plane.
- **Transient retained:** during the first stable security pass, one Tenant-session probe expected 401 but received 500. The harness retained the path and mismatch but did not retain that response body/error code. A bounded targeted recheck returned the intended 401/413/415/400, followed by a passing security/rendered continuation. The subtype/cause is **unknown**; successful retries do not erase or explain it. No repeat was seen in the continuation.
- **CPU not certified:** limited RPC live-tail samples included elevated cold execution CPU (up to 402 ms) and canceled invocation outcomes despite successful client responses. These are not a complete per-client CPU distribution or proof of compliance with the documented Free CPU allowance. Combined with earlier exceededResources events and the unexplained 500, Free-tier cold-path reliability remains a production-readiness concern. No account upgrade or speculative rewrite was made.
- Fresh OTP delivery/login, real-client submissions, full authenticated mutation regression, physical-device testing, load/attack simulation, WAF/rate-limit policy verification, continuous alert delivery, production indexing and off-device recovery remain **not verified by this pass**. No new alerts or hard spend stops were configured.

**Assessment:** measured daily request/read/write/storage totals do not indicate imminent daily-cap exhaustion, and the bounded carousel check found no repeat-request loop. The new cache reduces repeated public-cover database work without removing frontend effects. This is not unconditional Free-tier reliability or customer-production security certification. Before launch/growth, resolve/measure the cold-path resource risk, verify production publication/crawling, and observe a normal day of account-wide usage. Sensible warning levels are 50%/75%/90% of daily reads/requests; they are recommendations, not configured alerts.

Private provider responses, request logs, screenshots and configuration preservation evidence remain outside Git. No secrets, sessions, raw query text, tenant records or access codes are included here.
