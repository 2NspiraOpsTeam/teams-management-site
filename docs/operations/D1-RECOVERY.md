# D1 optimization / recovery — October 17, 2026

Authorized: optimize, deploy optimized preview, measure common staff workflows after
quota reset, evaluate Free reliability and Paid cost. NO upgrade/spend, main merge,
public-company launch, invitations, or real-client communications. Preserve data,
Gmail secrets, existing feature flags and all bindings. Never send masked/null secret
values back to Cloudflare. Source branch fix/d1-read-efficiency-2026-10-17.
Checkout /Users/adam/.openclaw/private/teams-d1-optimization-20261017.
Evidence /Users/adam/.openclaw/private/teams-d1-evidence; read release.json when present.

## Gate and timing

Expected reset October 19 00:00 UTC = October 18 5 PM Pacific / 8 PM Eastern.
Existing recovery automation fires five minutes later. One minimal actual-row probe;
stop on code7500; SELECT1 does not establish D1 health. No hosted heavy QA until
optimized stable deployment. Never blindly promote historical SHA33da4a3: rolled back
stable was Pages879015fc-de82-4743-842e-44ddf842a2fe + teams-contact-entry-2a51b93.
Inspect current canonical deployment and served fingerprint before any change.

## Changes / honest boundaries

- One visible-tab audit watermark check per 30s, shared across views. Focus and
  visibility now check watermark instead of fetching whole graphs. Saved events and
  BroadcastChannel still refresh linked views; drafts protected. Not zero polling;
  same-browser save events still invalidate all subscribed linked operational views.
- Minimal paginated selectors avoid portfolio/contact aggregates. Source roster unit
  resolution is scoped to buildings on its visible page. Rent Roll totals omit the
  full display/window projection.
- Operational directories, Rent Roll and Phone List already paginate at50+lookahead.
  Property Media now has50-row pages; legacy no-page endpoint retains100-row cap.
  Renewal report still constructs its bounded graph before slicing; Dining editor and
  some legacy selectors remain bounded/full loads. Do not claim universal O(page-size).
- Public DTO caching only: published building list, allowlisted preview addresses,
  public Retail list. Release-separated Cache API keys,60s TTL, fail-open to DB.
  NEVER cache tenant, contacts, Admin HTML, leases, maintenance, sessions or auth.
  Publication changes may take60s; private media/document guards stay independent.
- New operations-read-efficiency.sql indexes: locally applied/idempotence+FK tests;
  remote application gated on schema inspection, backup and local restore rehearsal.
- RPC D1 metering logs teams_d1_usage: counters + opaque SQL fingerprints only.
  No SQL/values/records/cookies/query strings. measuredQueries must equal queries;
  missing metadata is NOT zero usage. DB duration is NOT Worker CPU.
- npm run qa:d1:local now initializes complete operational schema in fresh local
  state. scripts/d1 synthetic seeder and built-app harness are local-only, never
  hosted entrypoints. Existing data is not used for repetitive QA.

## Release workflow

Follow 2nspira-website-validation/PAGES.md. Inspect both actual Pages environments,
service bindings/D1 IDs and secret NAMES/types. Preserve known-good rollback pair.
Build OpenNext, deploy unique private runtime with matched flags/bindings, await
Worker Version ID. Patch ONLY Preview TEAMS_RUNTIME and direct-upload gateway on
nonprimary branch. Smoke /access and fingerprint while capped; D1 failure expected.
Do not claim candidate authenticated verification while blocked. After reset, minimal
candidate auth/data checks, then selective Production binding + primary branch
preview gateway promotion. Verify canonical fingerprint/chunks, then controlled QA.
Do not overwrite a newer release. No unrelated LLC/lease-upload feature changes.

## Controlled measurement (cold + warm; record exact release/time)

For each workflow capture all navigation/auth/API/sync requests, queries, rows read/
written, measuredQueries coverage, errors, Worker request count and real CPU from
Workers tail/analytics. Never substitute wall time. Keep hosted/local files separate:
1 Dashboard /admin; 2 Properties; 3 one building; 4 Apartments+Tenants tabs;
5 Rent Roll first/second page+property filter; 6 Phone List name+numeric search;
7 approved QA maintenance internal note, SAME status, no tenant update/email;
8 approved QA lease internal note, preserve holders/dates/rent/publication, read back
and restore revision-safely. One unchanged-watermark interval suffices hosted;
repeated idle, drafts, retries, errors and multi-tab tests stay local.

No real tenant edits to measure writes. Use existing approved QA records. Compare
local synthetic and hosted actual totals explicitly; single API costs != full UI
workflow. Include index maintenance writes. Rank opaque query fingerprints by reads.

## Recovery matrix

After optimized stable release, sequentially check all sitemap/public routes plus
Admin sign-in and authenticated session, Tenant Services with approved existing QA
session, Rent Roll totals/pages, Phone List search, maintenance and lease roundtrips.
Verify anonymous denial, assigned-tenant scope, private document guards/no shared
cache. Existing sessions are NOT proof of fresh emailed-code delivery. Do not send
codes/invitations without explicit communication authorization. Report every surface
passed/failed/not verified, not blanket recovered.

Remote indexes: matched schema and existing indexes/plans first; owner-only export,
local restore rehearsal/FK check, then ONLY reviewed additive file, never pending
migration sweep or wholesale restore. Preserve sessions, contacts, source/audit IDs.
Earlier cleanup remains separate: inspect corrected close-office-qa.cjs and
final-preservation.cjs under teams-rentroll-fields-2026-10-17; preserve two real
contact additions at04:52:57UTC and all history, no screenshot-inferred overwrites.

## Reliability / costs

Project3 and5 staff with explicit per-person workflow counts, tabs and public traffic;
use complete measured workflow totals + account-wide other workloads + safety
factor. Free limits:5m rows read/day,100k written/day,5GB; Worker100k dynamic
requests/day AND10ms CPU/invocation. Use p95/p99CPU; average D1 headroom alone
cannot certify reliability. Cache hit rates and CPU currently unmeasured hosted.

Prices verified official docs Oct17: Paid minimum$5/month account; includes25bn
D1 reads,50m writes,5GB,10m dynamic requests,30m CPU-ms monthly. Overage:
$0.001/million reads,$1/million writes,$0.75/GB-month,$0.30/million requests,
$0.02/million CPU-ms. Static assets free. Logs currently Free200k/day/3days;
Paid20m/month/7days then$0.60/million; pricing changes Dec1,2026. Other products/tax
additional. $5 is NOT unlimited. No purchase authorized.

Controls: D1 Row Metrics/GraphQL, Worker requests/CPU analytics, usage metering,
bounded exports/queries, local QA, public endpoint abuse protection, Paid CPU caps.
Set/verify alerts at50/75/90% of allowance only where account actually supports them;
otherwise prepare a minimal read-only analytics monitor. Do not claim configured
alerts or a hard per-project dollar cap. Alerts do not stop spending automatically.

https://developers.cloudflare.com/d1/platform/pricing/
https://developers.cloudflare.com/workers/platform/pricing/
