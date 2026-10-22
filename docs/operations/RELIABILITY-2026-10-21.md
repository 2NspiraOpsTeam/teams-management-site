# Reliability follow-up — 21 October 2026

## Confirmed build-consistency defect

The pnpm lockfile retained `glob@10.3.3` through the OpenNext build tooling,
despite npm's existing `@node-minify/core` override selecting patched `10.5.0`.
`pnpm audit --prod` reported GHSA-5j98-mcp5-4vw2 (high). This is a build-tool
CLI command-injection advisory, not evidence that website visitors exploited it
or that it caused the resource-limit incident.

Mirror the three existing npm overrides in `pnpm-workspace.yaml`, where pnpm
11 reads them. Regenerate the pnpm lockfile, also recording the already-declared
Microsoft browser dependency previously missing from that lockfile. No new
Microsoft integration, credential, permission or runtime setting is enabled.

## Local verification

- 441 tests / 55 suites passed after dependency reconciliation.
- TypeScript check and OpenNext Cloudflare preview build passed.
- npm and pnpm production-dependency audits both reported zero known advisories
  at the time of the checks. These reports are not a security guarantee and do
  not reconcile historical GitHub default-branch alerts.
- No application UI, database schema, tenant record, email, billing or live
  deployment changed in this pass. Rendered UI QA is not applicable to these
  build-configuration-only changes; hosted candidate verification is pending.

## Reliability release blockers

Do not describe the website as fully hardened based on passing tests alone.

1. The 109 reported resource-limit failures still lack a confirmed request-level
   cause. Historical log access was denied in the incident investigation.
   Diagnose using authorized provider logs/analytics and bounded observations;
   do not use live load loops, raise billing limits or claim rollback restores
   quota. In-process exception handling cannot catch a platform CPU termination.
2. Fresh real-user sign-in delivery and full authenticated workflows require
   authorized existing sessions or approved QA recipients. Do not send unsolicited
   codes, mutate real records or infer an end-to-end pass from mocked auth tests.
3. Off-device encrypted recovery and a cloud restore drill remain unverified.
   Use an owner-approved destination and retention policy, never a public repo.
4. Candidate review and hosted verification precede promotion. Company production
   remains subject to explicit approval of a concrete release.

The alert-deduplication repair lives in the separately scheduled monitor checkout;
it is not part of this application's dependency fix and does not prevent the
underlying resource exhaustion.
