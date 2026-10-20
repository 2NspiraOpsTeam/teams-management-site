# Read-rate investigation — 20 October 2026

Jeffrey requested prevention of another runaway following the 50% read warning.

## Verified observations

- Scheduled provider totals: 2,504,607 reads at 22:39 UTC; 2,507,225 at 22:52 UTC. Increase: 2,618 reads over approximately 13 minutes. Provider reporting can lag; this is not proof of every intervening request or sustained future capacity.
- Bounded rolling-day Query Insights (not UTC-day quota attribution) ranked Admin media-library relationship summaries first: 909,076 reads / 38 executions, average 23,923. Public cover-selection families also contribute. Actor attribution unavailable.
- Monitoring still targeted an older runtime. Verified current Pages service binding and 100% runtime deployment, then aligned expected fingerprint, runtime and error-window start to `preview-mobile-code-3fb99db`, `teams-preview-analytics-20261020`, `2026-10-20T22:36:50.151301Z`. Preserved prior private config.

## Active monitoring change

The existing scheduler directly executes the monitor in the `teams-usage-20261019` checkout. Added fresh-total delta alerts at 500,000 reads/hour, with immediate escalation at 1,000,000/hour, a one-hour repeat cooldown, 15-minute minimum sample interval, and two-hour maximum interval. UTC reset/backwards counters rebaseline. Missing samples retain their original fresh timestamp; no extra analytics queries or table scans are introduced. Daily 50/75/90 warnings remain.

12 monitoring/rate tests passed. Actual scheduler execution succeeded silently; full fresh metrics, no current-window resource/invocation errors, no auth anomalies and no release mismatch. Synthetic warning delivery was not sent. These alerts are not a hard quota stop; provider delay and half-hour cadence limit detection speed. No service shutdown, billing change, database mutation or company-production change.

## Prepared application optimization — not deployed

Admin media-list SQL now materializes the filtered, deterministically sorted 61-row lookahead page before evaluating relationship summaries. Private data remains uncached; search, building/homepage filters, order, pagination and authorization stay unchanged. No schema/index changes.

Real SQLite synthetic fixture (1,200 assets), five before/after scenarios returned identical rows. Approximate SQLite VM steps for default first page: 11,610,600 → 614,900 (~94.7% reduction). This is local execution work, NOT measured hosted D1 rows saved. Filtered scenarios improved less; absent-building filtering was unchanged. 18 focused media tests and TypeScript passed. Preview build validation recorded separately at completion.

Application rollout remains separate from active monitor improvements; candidate authenticated media-library QA and hosted before/after metering are required before claiming deployed savings. No emergency blanket block was installed: shutting down staff/tenant access or choosing which services to suspend near quota is a business-behavior decision, not an alert implementation detail.
