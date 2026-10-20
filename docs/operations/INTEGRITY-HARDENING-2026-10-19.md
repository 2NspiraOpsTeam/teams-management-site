# Integrity hardening — 19 October 2026

## Release and scope

Authorized follow-up hardening of the existing preview, preserving all frontend effects. No company-production deployment, main merge, spending, schema migration, real-record mutation or email send.

- Authoritative prior source: `09f1569ad715efb759bb04ebc578fffb0c4e4cbb`, branch `fix/property-media-management-20261019`.
- Application hardening: `cc32037`; release/monitor helper follow-up: `95ac0c0`.
- Candidate gateway: `7a47167d`, branch `integrity-hardening-review`.
- Stable gateway: `7ab71ca7-ca1a-4eaa-9cf8-a29e42342d6c`, primary branch `preview`, Pages Production environment (not company production), gateway commit metadata `cc32037`.
- New private runtime: `teams-integrity-20261019`, version `41b5f1d1-feff-4c75-8bf1-7a45fc7c26a1`; served fingerprint `integrity-20261019`.
- Rollback pair retained unchanged: gateway `5e1a5bc1-529d-4409-9b54-45ed8d2a042c` with `teams-cover-cache-20261019` / version `082326f6-d1a2-4239-a57e-a3a77050023f`. Gateway rollback requires restoring its corresponding service binding; old gateways do not freeze a mutable service target.

Both environments' variable and database bindings were deep-compared before/after selective service-binding updates and preserved. Live ownership remains Pages gateway → private OpenNext runtime; no public Worker URL or company domain changed.

## Implemented safeguards

- Pinned least-privilege GitHub integrity workflow: tests, typecheck, recovery planner tests, production dependency audit, canonical preview build. No deploy credentials or automatic promotion. The workflow is not yet a required branch-protection rule.
- Versioned approved sharing-copy contract and bounded read-only candidate/stable release gate. Checks unique titles/descriptions/social metadata, canonical scope, JSON-LD, headers, homepage script/style assets, private endpoint denial and crawler settings. `--full` discovers detail hrefs, not guessed slugs. Origin-scoped private Access support refuses unrelated origins and redirects.
- Website Content and import-review bodies are bounded while streaming, before parsing; oversized chunked requests cannot bypass Content-Length checks. Existing revision locks, retry receipts and atomic audit batches are retained.
- Self-only form submission CSP supplements existing conservative policies without changing script/style/maps/animations.
- Runtime-generated request IDs correlate returned server failures and rejected login POSTs to bounded classifications. Exceptions return a generic no-store 503, never raw error text. Logging omits bodies, identities, query strings, cookies and supplied IDs.
- Runtime observability redacts query strings and disables automatic request invocation logs; safe custom usage/security/error logs remain persisted.
- Read-only half-hourly scheduled monitoring: account-wide D1 rows read/written, Worker invocation proxy/errors, homepage release/sharing regression, aggregate exhausted OTP attempts and excessive sign-in requests. Conservative Free-baseline warning levels 50/75/90%; new error deltas and monitor failures are surfaced. Dedupe lives in scheduler state, not an extra state file. Credentials are refreshed through the existing Wrangler OAuth grant and kept outside the public repository. No automated configuration edits, upgrades or deployments.

## Verification

- **Local:** 335 tests across 43 files, typecheck, canonical OpenNext preview build, 6 recovery-planner safety tests; production dependency audit found zero known advisories. GitHub secret scanning and push protection confirmed enabled.
- **Authorization inventory:** 43 protected Admin/Tenant route modules reject missing sessions despite forged cookie values before database access. This mocked boundary inventory is not alone proof of real session validation; separate existing-session/forged-token hosted probes and session/role tests cover those paths.
- **Tenant isolation:** real SQLite execution of production authorization SQL proves owner access, neighbor denial, revoked-assignment denial and mismatched building/unit denial for maintenance requests/photos. Existing suites also test lease/document visibility, opposite roles, retries, revision conflicts and transaction rollback on audit/server failure.
- **Candidate and stable:** full release gate passed on all 46 public pages (62 read-only requests per gate); exact runtime headers checked on pages/assets/private probes. Mobile/tablet/desktop browser checks passed for motion, hover pause, reduced motion/manual controls, overflow and JS page errors. Existing approved Admin session and forged-session/origin/body-type/body-size rejection passed. No live record writes or fresh email sends.
- **Observability:** three rejected-login classifications seen in candidate live tail; the synthetic no-send probe's response request ID matched its log. No server-failure event or usage warning observed in that bounded cohort. RPC tails reported canceled outcomes despite successful HTTP, so neither tail outcome nor later 200 proves cold-path capacity.
- **Monitoring:** actual scheduler run completed successfully in about 2.7 seconds, intentionally silent with no alarm. Live snapshot: 1,357,618 reads, 1,022 writes, 9,067 invocation-proxy requests, 13 historical resource/invocation errors, zero recent login lockouts/throttle excess. Analytics can lag and its rate-limit budget is independent of application quotas. Invocation analytics are not the exact enforced/billable request counter. Alert route configured; artificial incident delivery not exercised.

## Recovery proof

Fresh matched remote D1 export, source/history bundle and working-source/public-assets archive retained privately with checksums and restricted permissions. Full SQL restored twice locally using existing recovery tools: exact typed-table contents and schema match, integrity OK, zero foreign-key violations, 66 tables including SQLite sequence, 115 portable bounded batches. D1-backed media bytes are inside the export; repository public assets are in the archive. Inspected active runtime has no external R2 binding.

This proves local database recovery, not complete cloud disaster recovery. No destructive live restore was run. The unchanged prior runtime/gateway pair remains available. Choose an owner-approved encrypted off-device destination and retention policy before claiming off-device recovery readiness; no private data was uploaded to an arbitrary location. Secret values are not included in public Git or recovery reports.

## Remaining limits

The earlier unexplained Tenant-session 500 and elevated cold-start CPU remain unresolved. New correlation/monitoring improves future diagnosis; it does not retroactively explain them. Fresh OTP inbox delivery, physical-device testing, attack/load testing and off-device/cloud application recovery remain unverified in this pass. Preview noindex remains intentional; company-production indexing/launch is a separate release. No security-certification or free-tier reliability guarantee is implied.
