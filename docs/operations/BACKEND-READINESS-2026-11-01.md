# Backend readiness continuation — 1 November 2026

## Scope

Jeffrey authorized continued backend testing and remediation of availability risks.
Baseline: `44d63e3` (October 30 test branch), application `b7692be`.
Work is isolated on `test/backend-readiness-20261101`; no production release,
Cloudflare resource/configuration changes, billing, real-record writes or mail sends.
Private fixtures, SQLite snapshots, request evidence and logs remain outside Git.

## Reproduced and fixed locally

A fresh npm audit reported five moderate affected-package findings, rooted in
`glob` cancellation bypass (GHSA-3g3m-2fjr-6pw4) and `minimatch` amplification
(GHSA-g3hv-75wg-m249). These concern tooling dependencies; this pass did not
reproduce a remotely exploitable website outage. Both npm and pnpm resolution
policies now require `glob` 14.0.3 and `minimatch` 11.0.3. No framework downgrade
or blanket `audit fix --force` was used. Final npm and pnpm audits returned zero
known advisories. A separate clean npm installation and frozen pnpm installation
verified the lockfiles. The inherited nested npm glob entry needed lockfile
reconciliation; a clean resolver regenerated the entry without unrelated upgrades.

## Verification completed

- Full application regression: 539 tests / 61 files passed, including strengthened
  transaction-recovery coverage; TypeScript passed.
- Canonical OpenNext preview Worker build passed with patched dependencies;
  1,336 prepared photo renditions passed checksum/artifact validation.
- Six recovery-planner and seven release-gate Python tests passed.
- Extended actual SQLite-backed maintenance-handler test: force outbox insertion
  failure; require HTTP 503, no partial parent/photo/history/outbox and no scheduled
  delivery; clear the fault and retry the **same** receipt concurrently; require
  one 201 and one duplicate 200, one receipt/photo/event, two audience notifications,
  and no extra delivery after another retry. Passed with stubbed mail only.
- Fresh isolated operational-state snapshot restored through eight portable
  batches: 65 tables including sequence; exact typed contents and schema matched;
  integrity `ok`, zero foreign-key violations. This is synthetic local data,
  not a current cloud or production restore.

## Operational run

The existing locally built baseline Worker uses an independently initialized,
local-only D1 fixture: six synthetic buildings and 180 apartments/tenants/leases.
The repeated scenario alternates resident contact saves, replays one photo-backed
maintenance submission, reads five resident APIs concurrently, adds internal staff
notes, rejects stale staff revisions, and confirms staff notes remain absent from
resident detail responses. It checks private/no-store responses and stops at the
first unexpected status or timeout. It does not send mail. An initial harness
request used `127.0.0.1` while OpenNext normalized the origin to `localhost`; the
same-origin guard correctly denied it. The corrected localhost run is separate.

The baseline run completed 60 cycles / 725 HTTP requests in 299.8 seconds with
zero unexpected responses. The newly patched built Worker then passed a separate
two-cycle / 30-request operational smoke using the committed repeatable harness.
Both runs restored the original synthetic contact values. Expected stale-save 409 responses are successful
negative checks, not workload failures.

The repeatable `scripts/performance/local-operational-soak.cjs` requires the
standard 180-tenant synthetic fixture, matching disposable local state, a private
evidence directory, and 2–120 cycles; it targets only localhost:8797. Start the
built local Worker on that port using the same state before running it. Sessions
are deliberately local fixture sessions: never copy them to hosted environments.

## Production sign-off remains withheld

This is local backend verification, not preview deployment or production proof.
The patch is not deployed. A short repeated operational run does not prove a
normal-day hosted soak, account quotas, maximum-size photo throughput, multi-region
availability or long-term memory/CPU headroom. The one-pixel valid photo proves
persistence/retry behavior, not realistic upload performance.

Still required: exact production release/configuration and compute entitlement;
fresh approved-QA Admin/Tenant OTP provider/inbox/consumption/logout checks;
hosted operational workflows and realistic uploads; a monitored normal-day soak;
an owner-approved encrypted off-device destination, retention/RPO/RTO and current
isolated cloud restore; final release-ref security analysis; owner-approved
production promotion and post-release verification. No claim of zero future faults.
