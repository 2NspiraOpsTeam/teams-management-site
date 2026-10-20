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
