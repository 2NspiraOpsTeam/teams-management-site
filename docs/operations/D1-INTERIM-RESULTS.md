# D1 optimization: interim evidence

Status: local verification complete for first pass; hosted recovery and capacity certification pending quota reset. No billing change.

## Local D1 measurements (NOT hosted workflow totals)

Synthetic fixture: 6 buildings,180 apartments,180 tenants,180 leases. Each row below is one authenticated API request, including its authentication query; browser navigation may issue additional requests. Index file applied locally.

| API action | Rows read | Rows written |
|---|---:|---:|
| Dashboard | 3110 | 0 |
| Properties | 3513 | 0 |
| Property selector | 8 | 0 |
| Building | 743 | 0 |
| Apartments | 669 | 0 |
| Tenants | 5991 | 0 |
| Rent Roll | 3346 | 0 |
| Phone search | 1138 | 0 |
| Lease detail | 17 | 0 |
| Maintenance | 57 | 0 |
| Maintenance internal note (synthetic only) | 26 | 13 |
| Lease internal note (synthetic only) | 17 | 15 |

The selector comparison is3513 versus8 reads on this same fixture (99.77% reduction). This is not a measured portfolio-wide percentage. Highest-cost measured local API: Tenants5991 reads, Properties3513, Rent Roll3346, Dashboard3110. Query fingerprints and counts retained privately. Hosted ranking may differ.

198 tests passed. Local built-app browser checks:4 screens ×3 widths (1440/768/390), no document overflow or JS page errors; Rent Roll next page starts at51. Fresh emailed-code delivery, tenant-session isolation on hosted preview, public cache hit rates, real staff navigation totals and Worker CPU remain unverified.

## Projections, NOT operational measurements

Illustrative daily actions per staff:10 Dashboard,10 Properties,20 Building,20 Apartments,10 Tenants,15 Rent Roll,20 Phone searches,10 Lease opens,10 Maintenance views.
At local API costs, this is228,070 rows/person/day before additional page/subview calls. Three staff:684,210; five:1,140,350. A hypothetical2× UI overhead makes those1,368,420 and2,280,700. Neither multiplier nor these action frequencies has been observed in production.

Public scenario, explicitly assumed:1000 visits/day ×4 dynamic requests ×500 rows/request =2m additional rows/day. Cache hit rate is not measured. With staff overhead above, total can approach/exceed Free5m/day; there is no basis yet to certify reliability. Staff write scenario:10 maintenance+5 lease internal-note saves/person/day, at local13/15 write rows gives205/person/day;3–5 staff615–1025 write rows, excluding other writes and growth.

Paid illustration only:10k dynamic requests/day,20CPU-ms/request,30days gives300k requests/6m CPU-ms monthly. Even6m D1 reads/day is180m/month, well below25bn;1025 writes/day is30750/month, below50m. Assuming storage≤5GB and no other account workload/log overage, these hypothetical levels fit the$5 minimum. Actual CPU/storage/account usage not yet measured; this is NOT a fixed quote or upgrade recommendation. Free CPU limit10ms/invocation remains a separate risk irrespective of D1 totals.

Paid overages:$0.001/million D1 reads beyond25bn;$1/million writes beyond50m;$0.75/GB-month beyond5GB;$0.30/million dynamic requests beyond10m;$0.02/million CPU-ms beyond30m. Logs/other products/tax may add cost. Alerts/control capabilities and final recommendation follow hosted measurements. No alerts or paid controls are claimed configured.

Sources checked2026-10-17:
https://developers.cloudflare.com/d1/platform/pricing/
https://developers.cloudflare.com/workers/platform/pricing/
