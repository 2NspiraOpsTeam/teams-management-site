# Teams preview performance incident and resource audit — 19 October 2026

## Release and disposition

**Promoted and publicly reopened:** https://teams-management-preview.pages.dev/

Application SHA: `313f55145729b0cbb7d1281c4e8b766e4a5e2168` (performance base `195cc75f81be2f9aa1dd730c417538deb2c46104`). Pages deployment: `97d2b90e-b156-4ee9-b75d-b29787c40444`, actual primary branch `preview`, Production environment. Runtime version: `a5959d8e-8837-47ec-8538-140313e708bc`.

Only the stable preview's temporary public restriction was removed. Historical/branch deployment URLs remain restricted, preventing unoptimized old builds from becoming alternate public entry points. Waterbear remains restricted. Client-facing production domains, unrelated applications and paid plans were not changed.

## Confirmed root causes and fixes

- Gallery rotation recreated image nodes and repeatedly retried unavailable images. Historical five-minute telemetry contained 136 media 404s, 57 successful media requests and 10 lightweight Admin change checks. Media accounted for 97.6% of measured D1 reads in that sample. A rolling-day sample contained 43,399 public-media guards and 264,964 reads. The initiating person/browser is unknown.
- Visited gallery/thumbnail images now remain reusable. A bounded shared failed-URL set prevents repeated attempts until reload. Automatic transitions pause offscreen and on Page Visibility hidden, while manual controls, clickable imagery, rotation, cover rules, original image bytes and responsive presentation remain intact.
- Uploaded approved-public images use checksum-versioned URLs and a 60-second public cache. Warm responses pass the remaining lifetime, not a fresh 60 seconds. Private/Admin media stays authenticated and `private, no-store`; denials are not publicly cached. This is not a new static-delivery architecture, and an edge cache hit can still invoke the gateway/runtime even when it avoids D1.
- Removed periodic Admin change checks and Tenant maintenance full-data polling. Opening, saving, navigating, explicit refresh and throttled visible-tab return remain supported. Dashboard was not a confirmed full-dataset polling offender.
- The final two gallery 404s came from public cover selection for archived properties. Public selectors now exclude archived buildings; Admin draft access, assets and assignments are preserved.
- Added missing destination indexes matching the authoritative application schema. Existing SQL optimizations were retained; no speculative query rewrite was introduced. The historical Properties family consumed **4,541,215 reads across 240 executions**, not per execution. An intermediate Waterbear family averaged about 3,044 reads. Final hosted full Properties API measured 4,908 reads on the migrated dataset; indexed main query 4,906. Dataset, query shape and optimizer differences preclude a like-for-like percentage claim.
- Local-only QA configuration has no hosted fallback. Sanitized route/view D1 meters flag large query/read budgets, failures and missing metadata. Retry/failure suppression is bounded; authentication was not weakened.

## Local results — not hosted quota measurements

245 tests across 31 files, TypeScript and the clean OpenNext destination build passed. Rendered desktop/tablet/mobile checks, transitions, pause/resume, navigation and reduced motion passed.

The final local five-minute unavailable-image session, including cold load, changed from **103 to 3 image requests**, **111 to 11 D1 reads**, and **101 to 1 failed-image attempts**. Earlier 103→4 / 111→12 results preceded the final shared failure guard.

After cold load, unavailable-image and controlled hidden-tab loops fell from 100 requests/100 reads to zero; offscreen from 50/50 to zero; idle Rent Roll from 10 requests/30 reads to zero. All wrote zero rows. A real 30-minute local idle Dashboard observation produced zero recurring requests before and after; this must not be described as a Dashboard polling fix.

## Hosted results — actual Cloudflare

Persistent Cloudflare logs were used because a live CLI tail omitted some RPC events. Complete retrieved result counts were checked. RPC invocations, incoming browser requests and billed/limit-counted Workers requests are different measures: do not sum Pages plus service-binding executions into an exact Free-tier billable counter.

### Final candidate and Admin workflows

The final candidate validation cohort recorded **206 runtime RPC invocations**, **73 metered application requests**, **25,067 D1 rows read** and **14 written rows**. Writes were the explicitly controlled synthetic QA edit and restore; no real operational record was edited. There were no usage warnings or failed application responses. The cohort includes multiple workflows and is not a single-visitor cost.

Dashboard, Properties, building, building apartments, Tenants, Rent Roll, Phone List, Maintenance, Media Library and page refresh were exercised sequentially, followed by safe edit/readback/restore. Browser on-wire requests for those ten views were respectively 13, 19, 19, 21, 28, 23, 17, 20, 20 and 20. These include page/static/API traffic, and client caching/prefetch can move query costs between navigation steps.

Full Properties API: 4,908 reads. Rent Roll API measured 2,309 in the candidate cohort and 4,574 in the later stable cold-load cohort. These are observed costs, not a fixed-cost guarantee. Operational aggregate queries remain the principal legitimate read expense; more changes are not justified without a new query-plan/workload finding.

### Five-minute stable watch after public reopening

Fresh browser contexts used ordinary HTTP caching, no request interception and no Access credentials. The following counts exclude cold loading:

| Scenario | On-wire requests | D1 reads / writes | Repeated images | Failed requests |
|---|---:|---:|---:|---:|
| Idle homepage | 0 | 0 / 0 | 0 | 0 |
| Active Gold Street gallery | 6 unique static images | 0 / 0 | 0 | 0 |
| Gallery scrolled offscreen | 0 | 0 / 0 | 0 | 0 |
| Controlled hidden-tab gallery | 0 | 0 / 0 | 0 | 0 |
| Idle Admin Dashboard | 0 | 0 / 0 | 0 | 0 |
| Idle Rent Roll | 0 | 0 / 0 | 0 | 0 |

The six gallery requests occurred in minute one; minutes two through five had zero requests. They were first visits to distinct existing static files, not repeated media authorization calls. Visibility was tested through a controlled Page Visibility event in headless Chrome, not a physical OS-tab transition.

Two earlier full five-minute hosted matrices independently showed the same settling/no-repeat behavior. Their request interception disabled browser HTTP caching, so those results are cache-disabled reuse proofs, not normal-cache traffic estimates.

The final public Properties check and active-gallery check had no failed requests; the two archived cover URLs were absent. A subsequent anonymous five-page stable visit (home, Properties, Gold Street, Retail, Gallery) used **84 on-wire requests**, **18 browser-cache loads**, and no failed requests/client errors. Its corresponding provider-time cohort recorded **61 runtime RPC invocations**, **15 metered app requests**, **3,914 reads** and **zero writes**. These distinct counters are not interchangeable; this was one bounded observed visit with existing edge state, not a guaranteed cold-cache cost.

The broader post-opening verification cohort recorded **171 runtime invocations**, **45 metered requests**, **25,842 reads**, **zero writes**, and zero usage warnings. It includes six cold scenarios, public navigation and deliberate authorization-denial tests; it is not a per-five-minute visitor rate. Anonymous private-media/Admin/Tenant denial checks intentionally produced 4xx responses. Two isolated unknown-path zero-read 404s were also logged outside controlled gallery failures; no repeating pattern or gallery image 404 was observed. No old named Teams runtime executions were returned in the post-promotion adaptive-analytics window.

### Cache and security

Hosted replacement testing returned new-version bytes immediately, bounded the old version to its remaining 60-second lifetime, and denied both versions after unpublication plus 61 seconds. Repeat denial remained uncached; authenticated private access returned `private, no-store`. The synthetic fixture and parent publication state were restored.

Already-downloaded pixels cannot be remotely revoked. This window covers managed uploaded-media retrievals, not legacy photographs already bundled as public static files.

Fresh Admin and approved QA-only Tenant emailed-code login passed on the candidate, including role isolation and Tenant scope. The QA Tenant was logged out/revoked and restored inactive. Fresh owner Admin login also passed on the stable preview. Stable anonymous Admin/Tenant/private-media guards, authenticated Admin API and Admin-not-Tenant isolation passed after reopening and after cleanup. Existing configuration/secrets were preserved, not reserialized from masked values.

## Migration integrity and recovery

Both databases were exported before migration and fully restored offline with exact typed table/schema fingerprints, integrity `ok` and zero foreign-key violations. An additive, rehearsed migration preserved destination-only operational records, excluded source synthetic identities/lease graphs, and transferred current schema, private media/video choices and the specifically reconciled owner corrections. No destructive database replacement occurred.

A post-additive remote export matched the rehearsed expected state exactly. A fresh post-promotion remote checkpoint also passed complete offline restore verification, with an unchanged bookmark during export. Source history, public assets, matched build/configuration and old/new serving versions are retained privately. The pre-promotion Pages/runtime pair is recoverable; database restore still requires its own reviewed recovery procedure, not just Worker rollback. No live destructive restore was exercised. Encrypted off-device backup replication remains unestablished; do not claim full disaster-recovery readiness.

## Free-tier planning — projections, not a load test

The runaway time-dependent idle costs are eliminated in these controlled scenarios. Browsing still has finite page, image and operational query costs.

Using the observed 84-request / 3,914-read public visit, with the larger local merged-data cold visit (4,928 reads) as a sensitivity input:

| Assumed daily workload | Incoming resource planning input | Projected D1 reads |
|---|---:|---:|
| 100 public five-page visitors | 8,400 | 391,400–492,800 |
| 500 public five-page visitors | 42,000 | 1,957,000–2,464,000 |
| Five staff using the illustrative busy day below | ≤14,800 | about 1.70 million baseline; allow more for larger/cold workflows |
| 100 Tenant five-page read-only visits | ≤7,200 | about 20,900 local-fixture input, not hosted Tenant capacity proof |

The staff assumption per person is 10 Dashboard, 10 Properties, 20 building, 20 apartment, 10 Tenants, 15 Rent Roll, 20 Phone searches, 10 Maintenance, 10 Media, 10 refresh and 20 safe edit/readback actions. The 339,475-read/person estimate came from the smaller local workflow fixture; cold hosted Dashboard/Properties can cost more. This is a sensitivity model, not measured staff behavior or certified capacity.

At those inputs, 500 visitors plus staff and Tenant activity imply roughly 64,000 incoming resource events and **3.68–4.18 million reads**, before larger-workflow adjustments, other account applications, bots and extra actions. This is below nominal 100,000 Workers / 5 million D1 reads / 100,000 D1 writes daily limits on the stated model, but has limited read headroom and is **not an unconditional sustainability guarantee**. A measured normal day and account-wide monitoring are needed before growth. The controlled edit used 7 written rows per operation; real writes/audit/index amplification vary. Today's migration/index/import writes must not be projected as routine usage. No paid services were enabled.

## Teams-only Cloudflare cleanup

Audited **51 Teams-related Workers**, **2 Teams Pages projects**, **365 Pages deployments** (363 in the preview project; 2 in the production-linked coming-soon project). All account Worker settings were read solely to find incoming Teams service dependencies; unrelated services were not modified. Checked service bindings, historical deployment bindings, custom domains, zone routes, schedules, public Worker URLs, shared D1 bindings, storage/queue dependencies and seven-day named adaptive activity. No Teams cron schedules were present. No R2 bucket was deleted or created.

Removed only these five unreferenced obsolete Workers:

- `teams-consolidated-runtime-47c2070`
- `teams-consolidated-runtime-9236e4c`
- `teams-preview-runtime-547a354`
- `teams-refine-runtime-48df75f`
- `teams-rentroll-sync-8029201`

For each: no current or historical Pages binding, incoming Worker binding/tail consumer, route, custom domain, schedule, queue consumer or enabled public/preview Worker URL was found. Named seven-day requests were zero. Bindings contained only shared D1, static assets and ordinary configuration, with no unique data store or secret. Every one of its 136 source public-file blobs exists in the current build/source. Exact Worker multipart artifacts, settings and source history were archived with checksums before removal; the shared database was not deleted. Removal was confirmed from a fresh Worker listing.

Retained:

- `teams-management-preview`: the one canonical development/review preview, with its active private runtime `teams-usage-runtime-195cc75` (serving release 313f551 despite its historical name).
- `teams-contact-entry-2a51b93` and the preserved pre-promotion gateway: matched rollback dependencies.
- Other historical Workers referenced by retained successful Pages deployments: deleting them would break those recoverable deployment URLs. Historical deployment existence alone is not ongoing request consumption; broad deletion was not justified as a quota fix.
- `teams-management-coming-soon`: **not disposable**; it has the actual `www.teamsmanagement.com` custom domain.
- `teamsmanagement-website`: legacy production-related Worker with distinct database binding/public endpoint; left unchanged.
- Every database, operational record, uploaded media asset, secret and unrelated application.

Five Workers were removed in this cleanup; **no additional Pages project or successful deployment was deleted**. One failed, never-started preview deployment had already been removed during migration preparation and is recorded separately. Cleanup itself has **no measured ongoing request/read saving** because the five deleted Workers were inactive. The gallery/polling fixes, not deletion of inert history, provide the measured performance benefit.

Private per-resource inventory and rollback evidence are retained with the owner. Stable release, public galleries, authenticated Admin API and Tenant guards were checked again after removal and passed. No unrelated feature work was resumed automatically.
