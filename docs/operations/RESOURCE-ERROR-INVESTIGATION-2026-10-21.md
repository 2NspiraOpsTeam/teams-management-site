# Resource errors and duplicate alerts — 21 October 2026

Bounded Cloudflare analytics review covered Monday 19 October 00:00 UTC through 22 October approximately 00:23 UTC, in the preview's account. This is account-scoped, not a claim about Waterbear or all environments.

## Evidence

- Current `teams-preview-next16-20261020` runtime: 109 `exceededResources` failures, all grouped in 21 October 20:00–21:00 UTC (13:00–14:00 Pacific). The same 109 also appear in the general error total: these are overlapping classifications, not 218 separate failures.
- Other Teams preview/candidate scripts had 47 resource failures and one script exception in this week's queried window. Those scripts are not evidence of current active-site failures.
- Active-runtime hourly data showed no additional resource failures in subsequent reported hours. Provider analytics can lag.
- Homepage HTTP 200; release `preview-reviews-5a25b34`. A bounded monitor snapshot returned no problems and no authentication lockouts/throttle excess.
- Historical event-log query was denied by the available credential (HTTP 403). Consequently the offending request route, CPU versus memory cause, and initiating client remain unverified. Do not claim a resource-exhaustion fix or infer a paid-plan requirement from aggregates.

## Prevention implemented

- Fixed release-window error counters no longer reset their notification baseline at UTC midnight.
- Error high-water marks survive temporary downward analytics revisions, preventing the same historical errors being reported again when totals recover. Genuine increments still alert.
- Existing daily quota warnings remain daily; unavailable analytics still retain the prior error baseline.
- Private monitor release fingerprint reconciled with the verified seven-review deployment; previous private configuration preserved.
- Nine focused regression tests passed, including midnight, downward revision, fresh errors, monitoring continuity and quota reset scenarios.

The scheduled monitor directly executes this checkout, so this correction needs no application deployment or database changes. Further application optimization requires route-level failure evidence; historical analytics alone cannot establish that a specific route caused resource exhaustion.
