# Cloudflare D1 read audit — 2026-10-11 PDT

## Scope and binding
Account `36a7807b2d8726b889873bab8b572113` has five D1 databases. Wrangler's rolling 24-hour metrics showed `teams-database-dev` at 3,913,768 rows read after the targeted index change; the other four (`client-portal-db`, `2nspira-client-portal`, `2nspira-client-portal-preview`, `teamsmanagement-db`) each reported zero in that window. The alerted daily allowance is 5,000,000 rows read; the 24-hour Wrangler metric is not the exact UTC-day billing counter.

Cloudflare Pages project API confirmed both *preview* and *production deployment configurations within `teams-management-preview`* bind `DB` to `teams-database-dev` (`2d04fbea-8af6-4d6d-b5bf-cf758666d55e`). Its live preview therefore consumes this D1 quota. The currently public `www.teamsmanagement.com` comes from `teams-management-coming-soon`, which has no D1 binding. The separate `teamsmanagement-website` Worker binds `teamsmanagement-db`, not `teams-database-dev`; it recorded zero reads. Repository deployment configs for both Teams worktrees also reference `teams-database-dev`; future full-site production promotion must explicitly recheck its actual binding before release.

## Top query families (rolling-day historical values before indexes)

| Query family | Calls | Rows read | Avg/call | Finding |
| --- | ---: | ---: | ---: | --- |
| Admin Media Library search, current query | 94 | 2,460,740 | 26,178 | Correlated assignment lookup scanned 179 assignments per each of 189 assets; dominant cost. |
| Admin Media Library search, older query variant | 58 | 478,847 | 8,255 | Same unindexed lookup pattern. |
| Public property gallery query | 2,655 | 457,462 | 172 | Building-scoped media lookup lacked a matching index. |
| Public media authorization lookup | 1,412 | 189,713 | 134 | Repeated image requests; query needs publication checks. |
| Page showcase pool | 253 | 180,202 | 712 | Property/media joins, usually per page render. |
| Homepage media list | 149 | 173,626 | 1,165 | Two correlated assignment lookups per home item. |
| Other gallery variant | 1,281 | 120,431 | 94 | Same media join family. |
| Admin session authorization | 1,605 | 3,210 | 2 | Already indexed; not a driver. |

Cloudflare D1 Insights supplies SQL-level counts, not HTTP path logs. The source identifies the first two queries as `/api/admin/media`, property galleries as property page/media queries, and homepage/showcase queries as page-render paths. The gallery component's six-second timer changes slides only; it does not refetch. No network polling loop was found in tenant or Admin code. Admin Media Library's search previously fetched on every keystroke; a 350 ms debounce is deployed to preview. Exact human-versus-bot/QA request attribution is not available from D1 Insights alone.

## Targeted remediation and evidence
`media-read-indexes.sql` adds only three indexes, after checking `EXPLAIN QUERY PLAN` and existing indexes: `media_assignments(asset_id,building_id,unit_id)`, `media_home_assignments(asset_id)`, and `media_assignments(building_id,unit_id,order_index)`. The first query plan had full `media_assignments` and `media_home_assignments` scans. The same full-library lookup measured 925 rows read after indexing, versus 26,178 historical average (~96% fewer per call). A 61 Gold Street gallery sample measured 41 rows after indexing versus 172 historical average (~76% fewer; route and sample can vary). Homepage media sample measured 66 rows versus 1,165 historical average (~94% fewer). Indexes do not retroactively reduce the day's accumulated reads.

`buildings.slug`, `buildings.publication_state`, Admin email/session token, tenant email/session token/OTP, tenant assignment, tenant maintenance history, inquiries status, and page-showcase page already have suitable indexes or unique-key indexes. No additional broad index changes were made. A `SELECT *` in a single-record Admin media mutation is primary-key scoped and is not the read spike.

## Ongoing controls
- Use `npm run qa:d1:local` to create a fresh, isolated local D1 store for repeatable integration/QA scripts. Pass the printed directory as `--local --persist-to <directory>`. The script deliberately omits preview seed-data inserts and uses no remote D1.
- `npm test` currently runs three non-D1 tests and does not contact the live database. Preview builds compile routes but do not run these dynamic D1 queries; browser traffic to deployed preview does.
- Avoid scripted page refresh/search loops against preview; use one controlled runtime check for deploy verification. Do not use `wrangler d1 execute --remote` for iterative test fixtures or large scans.
- Monitor Wrangler D1 Insights by rows read and call count, plus the UTC-day Cloudflare account usage counter. Do not add a paid plan without explicit approval. Recheck the full-site production binding before promotion.
