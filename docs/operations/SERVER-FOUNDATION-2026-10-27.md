# Server reliability investigation — October 27, 2026

## Scope and attribution

Teams stable preview is `teams-management-preview.pages.dev` in the 2Nspira account. The current Pages deployment before this pass is `65da9a31-c2f9-40d5-bcff-5284a7267694`, calling private `teams-news-review-20261023`, version `92be46c0-5bcf-4a6d-b775-fa9265451cf1` (activated 14:35:35 UTC). Served application SHA is `60f9552f563429dd8c7d7f1e577b73ee8fdb87d4`. Preserve this application and Dax's concurrent work. No application runtime, credentials, billing, database or public company-domain change is included.

Telemetry since that version activated returned one `exceededCpu` invocation at 14:36:10.774 UTC, 295 ms measured CPU, 313 ms wall time. Three associated exception rows describe the same invocation and are not three additional failures. RPC telemetry lacks an HTTP path; a trace query did not find its gateway request. Do not claim a route or cold-start cause without further evidence. A bounded 50-success invocation sample ranged 0–365 ms CPU; mixed request types and result limits prevent a page-specific headroom claim. An allowed success over 10 ms does not override Workers Free's limit or establish safe capacity.

The monitor expected an older release. Its private config is checkpointed and updated to the source-confirmed live SHA, without resetting `runtime_error_since` or historical counters. An additional monitoring query encountered Cloudflare GraphQL's `budget` rate limiter, which is not an application outage; avoid repeated broad analytics queries while it recovers.

## Gateway mitigation

Preserve the earlier public-static/news-cache/RPC-containment implementation, which was deployed but not on the latest application source branch. Add an early, rejection-only GET/HEAD guard:

- Anonymous `/api/admin/session` and `/api/tenant/session`: 401 JSON.
- Anonymous `/api/admin/*` other than session: existing 404 concealment.
- Anonymous `/admin` and descendants: existing same-origin `/access` 307.
- No caching, database access, Next.js initialization or backend invocation on these responses.
- Present role cookie, including invalid/empty/forged values, always delegates to the authoritative application. The gateway never authenticates a caller.
- POST, DELETE and other methods continue unchanged; no replay of mutations.
- Contained backend RPC failures now carry a generated request ID in the response and log, plus a bounded route family. No URL, cookie, body, identity or provider payload is logged.

This eliminates framework-induced resource failures only for the identified early rejections. Full server rendering and signed-in requests remain subject to the unresolved CPU capacity constraint. This is not a claim that all server errors are repaired.

## Local and candidate checks

- Five targeted suites, 90 tests passed: gateway, rejection/role boundaries, cache/static bypass, no mutation replay, request observation, authorization inventory.
- TypeScript and diff whitespace checks passed.
- Isolated candidate `d38efaf2.teams-management-preview.pages.dev`, separate non-primary branch, uses the existing Pages Preview binding (`teams-news-readability-20261027`), not the stable application runtime. No binding or credential changes were made.
- Authorized managed browser: session 401/guard headers, anonymous Admin API 404, forged Admin cookie delegated and rejected 401 by the backend, malformed login JSON 400 (no email), public news 200, image 200, guarded derivative 404, protected building API 401.
- Rendered resident login at 390/768/1440: one sign-in button and no horizontal overflow. News desktop screenshot inspected; eight articles rendered without overflow.
- Shell requests hit Cloudflare Access (302 or invalid historical service-token 401); those are not application verification. Browser's existing Access authorization was used. No new access credential was requested or created.
- No fresh emailed login, positive authenticated Admin/Tenant session, QA write or inbox delivery was tested in this pass. Preserve those as outstanding gates.

## Closure requirements

Measure attributable cold/warm SSR and authenticated workloads, address observed framework CPU costs or approve sufficient capacity, then complete login/write/recovery checks and a monitored soak. A zero-error snapshot, gateway mitigation, stale-alert correction or successful page load does not establish full-site reliability. Workers Paid is a separate spending decision; no billing action is authorized by this document.

## Stable rollout evidence

- Gateway source commit `c2bd4ec`, branch `fix/server-foundation-20261027`, pushed to GitHub.
- Stable Pages deployment `6644e3ca.teams-management-preview.pages.dev`, primary branch `preview`; prior rollback gateway `65da9a31-c2f9-40d5-bcff-5284a7267694` retained.
- Stable browser verified anonymous session 401/guard, concealed Admin API 404, news 200 with unchanged application SHA `60f9552f563429dd8c7d7f1e577b73ee8fdb87d4`. Anonymous Admin navigates via `/access` to the application's existing unified `/tenant/login` flow.
- Stable resident login rendered at 390/768/1440 with one sign-in button and no overflow; mobile screenshot inspected.
- Existing half-hour monitor forced successfully after config correction; no notification was needed. This proves execution, not a completed soak.
- Bounded current-day error-level telemetry queries for `2nspira-website`, `client-portal-v1` and `2nspira-service-reminders` each returned no matching rows. This does not prove those runtimes have no errors outside captured logs. Existing signed-in 2Nspira client-list API returned 200; no writes or emails performed.
- Unresolved: CPU-heavy Teams SSR, attributable cold/warm headroom, positive authenticated Teams QA, approved writes and recovery/soak. No all-errors-fixed or production-readiness claim.
