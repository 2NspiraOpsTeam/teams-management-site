# CPU reliability release gate

## Confirmed incident and baseline

The October 27 incident was correlated by runtime and UTC second with `exceededCpu` events on `teams-news-review-20261023`. RPC telemetry did not expose a direct Ray-ID association. The stable Pages gateway calls that private runtime; its primary branch is `preview`, using Pages' Production configuration. Do not replace it with the older candidate application. Source baseline for this gateway-only change is `a3ec7dbcfe1dd872af648222818593771d8c40f6`; application, favicon, database and secrets are unchanged.

## Capacity recommendation, not activated by this document

Cloudflare Workers Paid starts at $5 USD/account/month, including 10 million requests and 30 million CPU milliseconds. Overages are $0.30/million requests and $0.02/million CPU milliseconds. HTTP CPU defaults to 30 seconds and can be configured up to 300,000 milliseconds. Verify current prices before billing activation. This is separate from a Cloudflare Pro zone subscription. Static asset requests are free; database/storage services have separate limits/billing.

Sources checked October 27, 2026:
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/workers/platform/limits/

Obtain explicit billing approval before activation. Do not promise a $5 maximum: usage can add charges. Keep the default 30-second ceiling initially, measure cold/warm CPU, then choose a bounded application-specific ceiling with headroom. Do not set five minutes merely because it is available. Account upgrade is shared with other Workers on that account; separate accounts require separate subscriptions. Inspect each site's actual serving account before claiming coverage.

## Gateway mitigation

The gateway now awaits RPC failures inside a catch boundary and returns generic, private/no-store 503 plus Retry-After. It logs only a bounded event and method. It never automatically retries writes, which may already have committed. This improves error containment; it does not prevent backend CPU termination or protect against termination of the gateway itself. Existing successful responses, cookies and configuration allowlist remain unchanged.

## Required before production sign-off

- Paid capacity active and verified on the actual serving account/runtime, or measured evidence that every production workload fits its chosen limit. Current free-tier CPU failures disqualify the existing setup.
- Measure platform CPU for cold and warm public pages, authenticated Admin/Tenant reads and approved QA writes. Wall-clock latency is not CPU time. Use bounded production-like concurrency in isolated staging; no real client messages or financial writes.
- Audit static delivery and safe cache eligibility. Current root layout forces dynamic rendering; do not remove that globally because it also protects request-scoped authentication/portfolio context. Do not cache Admin, Tenant, sessions, private documents, mutation responses or cookie-bearing responses. Preserve publication gates and refresh semantics.
- Verify fresh Admin/Tenant login, role isolation, safe retries/double-clicks, backend failures and recovery, desktop/mobile rendering, images and release fingerprint.
- Configure and prove actionable exceededCpu/5xx monitoring and an external availability check, with an approved notification destination. Enabled logs are not an alerting system.
- Capture a fresh source/config/data checkpoint, prove rollback compatibility, and complete off-device private backup and restore gates from the operations index.
- Require a multi-day monitored soak with no unexplained resource failures. A few HTTP 200s are not production reliability evidence.

Production domain promotion, billing activation, real client communication and database changes are separate owner-authorized actions. Do not describe this gateway mitigation as permanent CPU prevention or production sign-off.

## Zero-cost efficiency pass

Owner deferred paid billing on October 27. Keep subscriptions unchanged.

- Gateway reads Pages ASSETS first only for `/_next/static/`, `/images/`, `/brand/`, `/documents/news/` on GET/HEAD. Stage those public directories from the matched OpenNext build. Missing assets fall through to the runtime, preserving compatibility with newer immutable chunks. Do not copy `_photo-variants` or bypass live `/api/media` authorization/publication.
- Audited `/in-the-news` uses source-only reporting, Header/Footer defaults, no account data and no D1 publication decisions. Anonymous query-free HTML GETs can use Cloudflare Cache API for 60 seconds. Cookie/Authorization/RSC/Next-router/Range/refresh requests bypass it. Only successful HTML without cookies, authentication challenges or private Vary is stored. All delivered HTML stays private/no-store in browsers; internal cache expiry is 60 seconds, scoped by hostname. Gateway does not retry failed calls. Changing content may take up to 60 seconds for anonymous HTML; explicit refresh bypasses. This intentionally overrides framework no-store only inside the audited policy, not globally. Do not expand to editable website pages or properties without separate review.
- Default client-side RSC navigation and signed-in browsing still call the application; cache misses and new edge locations still render. Cache failure falls back to normal rendering. These are reductions, not proof the free CPU limit is sufficient.
- Gateway-only candidate can preserve the serving application runtime and all credentials; do not swap in an older candidate runtime merely to test gateway changes.
