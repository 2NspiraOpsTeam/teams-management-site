# Website intelligence (Cloudflare Web Analytics)

## Implementation and scope

The Admin home includes a Cloudflare-backed website intelligence panel. It queries `rumPageloadEventsAdaptiveGroups` through the authenticated, no-store `/api/admin/analytics` route. There is no custom visitor database, migration, Google tracking tag, or paid dependency.

Reports show daily page views, Cloudflare visits (arrivals, **not unique people**), property detail views, residential vs retail page interest, top properties/pages, device types, and page-view referral categories. Filters cover 7/30/90 UTC calendar days, including partial today. Cloudflare sampling, blockers, data delay and collection readiness affect results. No historical traffic is fabricated. Staff browsing public pages can be counted; referrers are page-view attribution, not inquiry conversions.

Only published property paths and allowlisted public pages are queried. Residential/retail classification follows `/properties` and `/retail`; detail views are separate from listing-page views. Admin, access, tenant and API paths are excluded from **reports**. Keep development and company production on separate site tags and exact hostnames. No account-wide fallback is permitted.

## Runtime configuration

Inspect the correct runtime and existing bindings before merging configuration. Use the development release/backup procedure in the operations index. Do not copy short-lived Wrangler OAuth credentials into application secrets.

- `CF_ANALYTICS_ACCOUNT_ID`: account containing the analytics property.
- `CF_ANALYTICS_SITE_TAG`: Cloudflare analytics site's tag (not assumed equal to the beacon token).
- `CF_ANALYTICS_HOST`: exact measured hostname without scheme/path; preview traffic must not be presented as company traffic.
- `CF_ANALYTICS_API_TOKEN`: secret, scoped to read analytics for that account; never `NEXT_PUBLIC`, never returned to a browser.
- `CF_ANALYTICS_BEACON_TOKEN`: public installation token from the site's Cloudflare snippet; optional if the owner already injects exactly one beacon automatically. Do not enable both injection methods.

The optional beacon respects browser DNT/GPC at initial loading and only initializes on public pages on the exact configured hostname. Cloudflare's SPA beacon then handles route navigation; reporting filters are not a promise that the provider never receives a private pathname after in-app navigation. Do not send contact data, account emails, application contents or arbitrary custom events to analytics.

Provider results are cached for five minutes in a bounded per-isolate server cache. Browser responses remain no-store. Missing configuration gives a setup state, upstream/auth failures give a retryable error, and an empty provider result is explicitly described as potentially unstarted collection. Truncation is rejected, not silently presented as a complete total.

## Verification and release gates

Targeted tests cover hostname/site isolation, public-path scope, retail publication, metric aggregation, empty/setup conditions, provider errors and truncated results. Verify rendered desktop/tablet/mobile, loading, setup, empty, error/retry, filter persistence and accessible daily data table. Before calling the integration live, prove the approved hostname's beacon produces an event, the matching site tag returns it, Admin displays it and anonymous API access is denied. A development setup is not company production evidence. Production enablement/release still requires the concrete owner-approved production action.

Initial read-only checks on 20 October 2026: GraphQL schema and RUM read access succeeded; no Teams records were found in the checked accounts/time ranges. The documented site-list endpoint (`GET /accounts/{account_id}/rum/site_info/list`) rejected the local OAuth credential with 403. The development hostname was registered through the existing authenticated Cloudflare dashboard and reached the installation step; the beacon has not been released. Production was not registered or changed. The runtime integration has not been supplied a scoped long-lived analytics credential. No deployment or production analytics changes were performed.

Local verification: 38 targeted tests passed; TypeScript and the OpenNext Worker build passed. The built Worker denied anonymous access (404 without a session cookie; 401 with an invalid cookie), with private no-store headers. Standalone lint is not configured and prompts for ESLint setup. Browser policy blocked navigation to the local QA harness, so rendered responsive states remain unverified. No feature deployment or end-to-end event collection was verified.

## Preview candidate — 20 October 2026

Jeffrey explicitly confirmed `https://teams-management-preview.pages.dev/` as the target, not the independent Waterbear development site. The candidate isolates the two analytics commits on the currently served property-facts source baseline; it excludes the separate shared-sign-in work and preserves all 1,333 checksum-verified photo variants.

- Exact preview hostname registered in its existing Cloudflare account. A new Account Analytics Read-only account token was created with expiry 20 October 2027, stored privately, and provisioned only on the isolated analytics Worker. No existing credential was rotated.
- Live GraphQL query using that token returned HTTP 200, no errors and zero rows for the exact preview site tag/hostname. This proves reporting authorization, not event collection.
- 12 targeted analytics tests, TypeScript and the canonical OpenNext preview build passed.
- Candidate gateway: `https://52747edb.teams-management-preview.pages.dev` (branch `analytics-review-20261020`), private Worker `teams-preview-analytics-20261020`, fingerprint `preview-analytics-09d4e5b`. The candidate-only Pages Preview service binding changed; all pre-existing variables/secrets, D1 bindings and Production configuration were verified unchanged. Stable remains gateway `a0ced234-e86b-4ec5-be56-819756cbd92e` backed by `teams-property-facts-20261020`.
- Hosted candidate currently requires Cloudflare Access authentication; the browser shows its email-code screen. Stable Admin also has no active browser session. Rendered graphs, filter persistence, responsive states, authenticated reports and event ingestion are **not yet verified**. Do not promote or describe analytics as live until these gates are completed. The collection beacon intentionally runs only on the exact stable preview hostname, not a candidate alias.
- No stable preview promotion, development-runtime change, production-company change, database mutation or test email was performed in this retry. Private rollback metadata and logs are outside Git.

### Authenticated candidate and compact sample view

On 20 October Jeffrey completed Cloudflare Access and the candidate Admin sign-in. Authenticated `/api/admin/analytics?days=7` returned 200 with `private, no-store`; the connected report returned zero traffic. The 7-day period and weekly grouping survived normal refresh. A browser-only simulated 503 displayed the operational-data-unaffected message and retry control; the interception was removed afterward.

Jeffrey requested dummy figures and a smaller intelligence view. Added an explicit, default-off sample switch: figures are generated only for display, clearly labeled, never inserted into Cloudflare or D1, and sample properties are not navigable. Refresh returns to real data. Thirteen focused tests cover provider isolation, aggregation, authorization and sample breakdown consistency; TypeScript and the canonical OpenNext build pass. Preserved 1,333 checksum-verified photo variants. Compact layout uses six breakdown cards (3 wide / 2 tablet / 1 phone), shorter chart, tighter paragraphs and a single-row headline summary. Browser QA at 1440, 820 and 390 pixels found no horizontal overflow; screenshots inspected for each width.

A single actual staff QA visit on the approved stable public homepage was instrumented temporarily in that browser with the approved provider snippet (no stable deployment/configuration change). The script loaded 200 and the provider ingestion POST returned 204. A subsequent exact-site/exact-host GraphQL query still returned no rows: ingestion acceptance is not reporting/display proof. Stable promotion and real-event reporting remain pending; sample data must not be presented as satisfying that gate. No tenant records or mail settings changed; no tenant sign-in regression is claimed from this analytics-only QA.
