# Pre-launch error review — 28 October 2026

## Scope and evidence

Reviewed all 94 retained GitHub Actions runs in `2NspiraOpsTeam/teams-management-site` (20–28 October): 43 successful, 45 failed and six canceled. Downloaded all 45 failed-run logs. Reviewed all 414 retained Teams Pages deployment records (8–28 October); every latest deployment stage was successful. A Pages environment called `production` here means the stable **preview alias**, not company production.

Historical failed runs remain historical; neither deleting nor rerunning obsolete source proves a current fix.

## GitHub failure classification

| Runs | Cause | Current disposition |
| --- | --- | --- |
| 34 | undici dependency audit (some also include body-parser) | Current full npm audit: zero vulnerabilities. |
| 2 | body-parser audit | Patched in current dependency tree. |
| 4 | Unsupported Next 15 build | Current Next 16.4.2 / OpenNext 1.20.12 builds without unsupported-version bypass. |
| 2 | Gateway test TypeScript tuple error | Corrected typed mock retained; typecheck passes. |
| 3 | Dependabot cannot resolve old next-on-pages transitive undici / busboy / sharp | Current stack removed next-on-pages; default branch still needs reconciliation. |

Checkout / Setup Node now target Node 24 and Ubuntu is pinned to 24.04. Earlier successful fresh run: https://github.com/2NspiraOpsTeam/teams-management-site/actions/runs/40730334631.

### Unfinished default-branch reconciliation

GitHub's `main` remains the 9 October legacy stack, whereas preview uses the recovered development lineage. The live alert API returned **78 open default-branch alerts**: six critical, 31 high, 33 medium and eight low. Current preview full npm audit is zero, but this does not close those alerts or establish that main is safe. Several open PRs also retain historical failed checks. Do not merge them individually or blanket-dismiss alerts: reconcile the approved preview lineage to the intended release base, review its full comparison and rerun security/CI before launch. This review does not authorize a production launch or changing the default branch.

## Cloudflare attribution

Stable preview resolves through Pages deployment `a0d4c852-0258-4023-8610-60021478ab78` to `teams-grandcentral-review-20261028`, active version `eea0b205-859c-4f8f-a0be-9f700445679d` at 100%, deployed 28 October 16:44:38 UTC. Served application fingerprint is `f5a4e54397a096ebaeea2a7fbdf8d35da00ea5fd`.

- Workers Paid remains active; no billing change made.
- Bounded 48-hour old-runtime telemetry contains CPU failures before the paid activation and one hung/canceled RPC on superseded version `c4151a58` at 27 October 17:58:29 UTC. No HTTP route is recorded for that RPC; exact cause remains unknown. It is not an error from the serving version.
- Postactivation old-runtime query found no CPU-limit failures. Today's error-level queries for both Restaurant Row and Grand Central Workers returned zero events.
- Current serving-runtime analytics sample: 122 successful invocations, 133 client-disconnected outcomes, zero reported errors. Client-disconnected is separate from a platform CPU failure. Counts are bounded analytics, not guaranteed billed totals or authenticated/cold-start proof.
- Shared 2Nspira website had two log rows from one image-optimizer incident at 28 October 15:25:27 UTC. The exact coaching image source and 3840px optimizer URL both currently return HTTP 200 with image bytes in an actual browser; not reproduced, no speculative source change made.
- Same postactivation error-level queries returned zero events for the portal and reminder Workers. These are bounded observations, not universal absence of errors.

## Additional fixes from this review

1. Scheduled monitor still targeted yesterday's Worker and SHA. Captured its old configuration and scheduler state privately, then changed only runtime/revision/window to the independently observed serving release. Direct snapshot and forced existing scheduled job passed; no new job, reset of historical incidents or automatic deployment. Historical 17 resource/invocation errors remain in the checkpoint and scheduler scratch. Free thresholds remain conservative warning baselines, not paid-plan limits.
2. Current application source lacked gateway and monitor safeguards deployed from separate branches. Reconciled the rejection-only anonymous guard, public asset bypass, narrowly scoped news cache, awaited RPC containment/no mutation replay, public-only staging, monitoring transient-failure classification and fixed-window high-water marks, including their regression tests. No UI, application data or company-production runtime changed.
3. Release checker required an application fingerprint even on Pages ASSETS and gateway-only denials. It now requires exact local artifact bytes for edge-served assets (`--asset-root`), keeps the exact application revision mandatory for runtime responses, and accepts headerless rejection only for the exact marked anonymous guard contract. Wrong revisions, changed asset bytes, login HTML and successful/private responses still fail closed. Added five Python regression checks to CI.

## Verification and remaining gates

- 491 tests / 58 files pass; TypeScript passes.
- Five release-gate regression tests and six recovery-safety tests pass.
- Full npm audit and production npm audit: zero vulnerabilities.
- Canonical OpenNext preview build passes; 1,333 checksum-verified photo variants staged.
- Stable read-only release gate passes: 46 public pages / 62 requests, exact asset bytes, protected boundaries and preview noindex/discovery checks.
- Existing scheduled monitor forced run succeeded with no delivery/no problems; current resource/invocation counters zero. Prior incidents retained privately.
- Reconciled source is committed for CI/review, not a new live deployment. Stable preview remains the independently verified f5a4e54 application.

**Not verified / still required before launch:** default-branch reconciliation and alert closure, fresh authorized Admin/Tenant sign-in delivery and full authenticated workflow QA, off-device encrypted recovery plus actual cloud restore drill, and longer attributed reliability observation across the release. Unit recovery-safety tests are not a cloud restore drill. No real-client communication, record writes, D1 migration or production launch occurred.
