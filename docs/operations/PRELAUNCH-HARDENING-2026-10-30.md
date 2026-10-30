# Prelaunch hardening — 30 October 2026

## Scope and release identity

Jeffrey requested scaling tests and a comprehensive prelaunch hardening pass.
Inspected and tested application `b7692be8af06aaee80e424de068e9dd565946b97`
at `https://teams-management-preview.pages.dev`. The serving private runtime was
`teams-shared-login-20261029`, version `9b259fc2-3294-4a26-a227-a5de31856578`.
No company-production release, DNS/routing change, payment, real-tenant write,
tenant outreach, plan upgrade, or live database restore was performed.

Private raw evidence, database exports, sessions and diagnostic keys are outside
Git. This public report contains no credentials or tenant-level evidence.

## Completed checks

| Check | Observed result | Boundary |
| --- | --- | --- |
| Automated application tests | 539 tests / 61 files passed | Inspected release source |
| Release-gate Python tests | 7 passed | Local |
| Recovery-tool Python tests | 6 passed | Local |
| TypeScript | Passed before and after canonical build | Local |
| npm full / production and pnpm audits | Zero known advisories returned | Not proof of absence of vulnerabilities |
| Canonical OpenNext preview build | Passed | No release/promotion implied |
| Photo artifact packaging | 1,336 checksum-verified renditions | Built artifact |
| Full public release gate | 46 pages / 67 requests passed | Hosted preview; includes protected-route denials, assets and metadata |
| Prepared photo delivery | 269/269 source probes matched exact bytes | Hosted preview |
| Public browsing workload | 407 five-request journeys; 2,035 requests; zero failures | Home, directory, sign-in page and two actually rendered photos; not authenticated |
| Local synthetic tenant workload | 407 accounts / 2,035 requests; zero failures or workload writes | Populated, isolated local D1; pre-issued sessions |
| Hosted synthetic tenant API workload | 407 accounts / 2,035 requests; zero failures or workload writes | Separate Waterbear Worker/database; pre-issued sessions |
| Hosted signed-in page workload | 407 accounts / 2,035 full HTML responses; zero failures or workload writes | Tenant home/account/household/lease/maintenance SSR; not a browser resource-load or OTP benchmark |
| Hosted simultaneous session-read bursts | 50, 100, then 407 requests; zero failures | Single session endpoint, not OTP, uploads or sustained throughput |
| Responsive browser checks | 25 checks passed at 1440, 768 and 390 px; no captured page errors | Public preview and local synthetic tenant pages |
| Contact form | Disabled, invalid, cancel, save, clear, refresh, simulated backend failure, retained draft and retry passed | Synthetic localhost only; final contacts restored |
| Tenant authorization / retry checks | Five scenario groups passed | Actual local handlers; neighbor contacts unchanged, cross-origin mutation rejected, foreign assignment denied, concurrent maintenance requests share one receipt, foreign request concealed |
| Admin password checks | Setup, login, secure/HttpOnly/strict cookie flags, generic unknown/wrong failure and CSRF denial passed | Synthetic localhost only; no real admin reset |
| Admin page rendering | Dashboard, Properties, Tenants, Rent Roll, Maintenance and Passwords rendered | Local synthetic fixture; correct Rent Roll link derived from UI |
| Fresh preview database restore rehearsal | Exact schema and typed table contents matched; integrity `ok`; zero foreign-key violations | 70 tables including sequence; 117 portable batches; offline, not a cloud/live restore |
| Repository safeguards | Secret scanning, push protection and Dependabot updates enabled; main requires `integrity`, strict/up-to-date and admin enforcement | Read-back only; no policy changes |

### Measured performance and limits

- Public workload: highest stage 332 journeys / 20 concurrent virtual journeys,
  capped at 20 requests/second; p95 response 298 ms. Earlier five-user stage p95
  was 1,033 ms. These are complete-body HTTP times from one test location, not
  browser Core Web Vitals or a multi-region benchmark.
- Hosted tenant API workload: highest stage p95 91 ms; 15,103 measured D1 rows
  read across the five-endpoint 407-account scenario, zero written rows. All query
  metadata was required to be present. Local rerun measured the same total reads.
- Session bursts: p95 610 ms (50), 167 ms (100), 1,379 ms (407); maximum response
  in the 407 burst was 1,610 ms. A burst is not a sustained soak.
- Hosted signed-in page workload: highest 20-journey stage p95 176 ms; earlier
  five-journey stage p95 553 ms. All 407 synthetic accounts completed all five
  pages with valid HTML and complete query metering: 48,440 rows read, zero writes.
  The account page was checked for the expected synthetic account email. These
  HTTP response measurements exclude browser JS execution and asset loading.
- Partial live-tail cohort: 236 captured events, all `ok`, no captured exceptions;
  maximum observed CPU 393 ms, p95 236 ms. This is **not** complete invocation
  coverage or proof of Free-plan CPU headroom. Successful responses do not waive
  enforced limits. Verify the intended production compute entitlement before
  signing off; the account subscription API returned 403 to the current credential.
- Shared-account daily usage snapshots include unrelated visitors, monitoring and
  lagging provider counters. Do not subtract them to claim exact test cost.
- The existing preview database was approximately 99.55 MB. Published D1 limits
  at inspection were 500 MB/database on Free and 10 GB on Paid; storage alone was
  not an observed blocker. Account-wide quotas and future uploads still matter.

## Isolated hosted test design

The synthetic test used a new Waterbear database `teams-capacity-20261030` and a
separately named Worker, never the existing development or preview database.
407 synthetic active accounts each had an assignment and published synthetic
lease. No real contacts or mail credentials were copied. All runtime writes were
disabled; the wrapper accepted only explicitly allowlisted GET routes with a
random private test key and returned bounded D1 usage metadata.

An initial setup probe returned one non-JSON 404 after three successful reads.
It stopped immediately; the same route passed the follow-up probe. The exact
cause was not established. The separately retained full rerun passed all 2,035
requests. Do not erase the initial observation or describe it as a reproduced
production failure.

The raw synthetic import failed safely (reserved local metadata, then a provider
`D1_RESET_DO` response). The target was checked to remain empty before recovery.
The existing recovery verifier generated 18 normalized parent-first batches;
all imported successfully. This reinforces using verified portable batches,
not assuming a raw local dump will import into hosted D1.

The test key was checked to reject anonymous requests; non-GET requests were
rejected even with the key. The disposable endpoint is disabled after testing;
retain the synthetic database/artifact for review rather than deleting databases
as an incidental cleanup step.

## Fixed

The existing integrity monitor's expected SHA was stale, causing false release
and photo-check failures. After live release/byte verification, updated only its
expected release to `b7692be`; preserved the prior configuration, schedule,
historical error baseline and all other settings. Read-back execution passed.

The app's mail/OTP secrets intentionally live on Pages and are passed over the
private RPC configuration allowlist. Absence of those names on the Worker itself
is not evidence of missing credentials. Both Pages environments retained the
required secret names and correct runtime binding; values and fresh delivery
were not claimed verified by metadata inspection.

## Launch gates still required

1. **Production release selection and configuration.** The company `www` domain
   still serves “Teams Management | Coming Soon”; apex GET redirects to `www`.
   Preview checks do not verify the future production app. Confirm production
   owner, bindings, compiled portal origin, sender, access policy, migrations and
   reviewed release SHA. Reconcile the stacked release PRs deliberately; do not
   merge old dependency branches blindly or copy development data over production.
2. **Production compute entitlement and representative soak.** Confirm CPU,
   account-wide request/D1 budgets, operational staff workload, realistic uploads,
   and a monitored normal day. Hosted tests use synthetic data and a separate
   account; no universal 407-user capacity certification is implied.
3. **Fresh end-to-end sign-in delivery.** Current-pass password checks were local;
   pre-issued sessions are not OTP verification. Fresh Admin and approved-QA Tenant
   request → provider acceptance → inbox → code consumption → portal → logout / old
   session rejection must pass on the actual release candidate. Do not send codes
   to real tenants or activate real accounts for a load test.
4. **Final candidate workflows.** Verify approved synthetic writes/imports,
   lease-document download/provider permissions, household review, maintenance
   updates/photos, mail-failure/retry state, and role isolation in hosted staging.
   Existing automated tests cover many rules but are not a complete hosted E2E.
5. **Off-device recovery and cloud restore drill.** The fresh offline restore is
   proven. Encrypted off-device destination, retention, recovery ownership/RPO/RTO,
   and a current isolated cloud restore remain unverified. Never restore over the
   live database to prove this.
6. **Release-ref scanner evidence.** Dependabot returned no open alerts and CI on
   the inspected SHA was successful. Latest CodeQL analyses inspected were for a
   different PR ref; this does not certify the final production commit.
7. **Final owner-approved promotion.** Present exact production targets, matched
   artifact/checkpoint, migrations, expected impact and rollback plan before
   release; recheck the actual serving version and critical flows afterward.

## Repeatable tooling

- `scripts/performance/public-capacity.cjs`: fixed preview-origin, GET-only,
  response/byte-qualified workload, 20 req/s cap, failure/latency stop conditions.
- `scripts/performance/local-tenant-capacity.cjs`: exactly 407 synthetic fixtures;
  localhost by default or the dedicated isolated Worker via private target JSON;
  full query metadata and no-write assertions. Optional `pages` mode checks SSR.
- `scripts/performance/isolated-burst.cjs`: one session read per synthetic account,
  bounded 50/100/407 bursts; refuses arbitrary domains.
- `scripts/performance/isolated-worker.mjs`: private-key, allowlisted-GET wrapper;
  never select it as the production entrypoint.

Keep target JSON, test key, session fixture, SQL, screenshots and raw tail output
private. Review active release identity and usage headroom before repeating hosted
load, stop on unexpected failures, and disable the disposable endpoint afterward.
