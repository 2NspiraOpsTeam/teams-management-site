# Monitoring security review — 20 October 2026

Scope: the current approved Teams preview source, not a company-production release.

## Implemented

- Monitoring distinguishes visibility failures from confirmed site/security incidents, classifies provider failures without retaining payloads, and permits one bounded retry for network/HTTP 5xx failures. Permission, query and rate-limit rejections are not retried.
- Empty provider error arrays are accepted. Error-count baselines survive missing samples, avoiding missed error deltas when reporting resumes.
- Monitoring incidents remain latched through brief recovery/failure flaps; two healthy scheduled samples establish recovery. Site failures and new security/resource events remain independently evaluated.
- Removed raw exception/message logging from four API error handlers. Generic user responses and authorization gates are preserved.
- Repository dependency vulnerability alerts and automated security-fix PRs enabled. Existing secret scanning/push protection retained. Main now requires an up-to-date `integrity` check, pull requests and conversation resolution, including for administrators; force pushes and deletion are disabled. No second reviewer is required, preserving the single-owner workflow.
- GitHub CodeQL default setup enabled for the default branch. Initial analysis was queued; configuration is not evidence of a clean scan or of scanning the separately deployed preview branch.

## Verification and boundaries

Local focused monitoring tests pass, including provider recovery, empty errors arrays, counter continuity and flap suppression. The complete application test suite/typecheck and canonical preview Worker build passed before the final documentation update. The actual existing scheduler executed the updated monitor successfully and silently with all reporting channels available. Intermittent provider-report failures were reproduced, but earlier alerts discarded provider details, so their exact historical causes cannot be recovered.

The scheduler reads this script directly from the checkout, so its changes are active without deploying the website. API logging changes remain source-only pending a preview release. No production release, database/application-record write, authentication email, billing change, DNS or secret rotation occurred. No evidence of intrusion was established; this is not a forensic clearance.
