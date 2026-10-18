# Resident portal and household access — Waterbear development

## Scope

Built from `handoff/waterbear-recovery-2026-10-18`, not the older default main. Production in 2Nspira remains outside this release.

- Premium resident home, sign-in, apartment/account details, active navigation, maintenance overview, management contacts, approved Teams logo, responsive layouts and reduced-motion behavior.
- `/tenant/household`: request another person's individual sign-in, track decisions, cancel pending requests and safely retry. Requests remain private to the requesting identity and its active apartment assignments.
- `/admin/tenants/access-requests` (Portal Access in staff navigation): review, decline or approve a request.
- Approval enables an **existing approved occupant** only: exactly one matching identity or unarchived directory email contact, with an active assignment to the requested apartment. Ambiguous contacts, another apartment and stale/cancelled requests fail closed. No new occupant or apartment assignment is created. Existing identity IDs are preserved.
- Activation, decision and audit share one D1 batch. Assignment/current-request predicates are rechecked inside that transaction. Declining or cancelling never revokes an existing occupant's access. Removal or changes to approved occupancy remain management responsibilities.
- No invitation/welcome email is sent by this flow. An approved member uses their own email and the existing fresh-code sign-in. Share the tenant login page with them; never share a sign-in code.
- Lease, rent and document publication permissions are unchanged. No payment integration, invented balances or unavailable lease-upload control was introduced.

## Storage and recovery

No schema migration is required. Versioned household requests use the existing `tenant_contact_requests` table with subject `household-access-v1`. The normalized requester/assignment/email determines the request ID, preventing duplicate submission rows. A declined/cancelled request can be deliberately resubmitted; approvals are idempotent.

Before implementation, a private checkpoint restored all 63 tables and schema exactly, integrity `ok`, zero foreign-key violations, with aligned before/after Time Travel bookmarks. The existing runtime rollback version is `ef0686fd-c0c9-4be5-a11e-fe4577dc5b25`. Use the documented backup/restore procedure; rolling back code does not undo an approved account activation.

The capture command now supplies the verified Worker config to every D1 command. Without it, a stale default Wrangler config could cause the explicit development database lookup to fail. This correction does not change a remote database.

## Verification

- 217 application tests passed across 29 suites, including 17 household security/transaction tests; six recovery-planner tests passed.
- OpenNext production build and TypeScript checking passed using the committed lockfile and pnpm 10.18.3.
- Isolated schema-only synthetic local and hosted Waterbear QA, not test identities inserted into the migrated tenant directory.
- 21 hosted rendered checks: resident home, household, account, contact, maintenance, sign-in and staff review at 1440, 768 and 390 pixels. No horizontal overflow; approved logo loaded; final hosted checks had no browser page errors.
- Valid/partial/invalid form paths, clear, backend error with retained draft, saving/disabled feedback, success, duplicate retry, cancel confirmation, refresh persistence, management approval, anonymous/role denial and reduced motion verified.
- Synthetic local OTP verification tested after household approval, including apartment scope, consumed-code rejection, secure/HTTP-only/Strict cookie, failed sign-out feedback, successful retry and session revocation. No email sent. This is not Jeffrey's fresh emailed-code acceptance check.
- A transient hydration mismatch was reproduced during boundary integration. The optional newly added portal-wide error/loading boundaries were not included in the final build; final local and hosted 15-navigation checks passed without recurrence. The standard framework boundaries remain. Do not describe the historical mismatch as an established framework defect.

Hosted synthetic review: https://ea8f1b03.teams-management-development.pages.dev, runtime version `14862ce3-cf44-4f2b-aab6-3c89648e1f25`. This preview runtime uses its own synthetic D1 database; it is not a copy of private tenant rows. QA sessions were revoked after verification. Future-preview project service settings were restored to their pre-review configuration; the immutable QA deployment remains isolated. The stable development gateway continues to use its original migrated database binding.

## Still open from recovery handoff

1. Jeffrey's fresh emailed-code tenant sign-in after reassignment: not claimed verified by synthetic tests or injected QA sessions.
2. Three inherited missing/nonnumeric rent values: no guessed corrections, totals remain partial.
3. Owner-approved encrypted off-device backup destination and retention/schedule: not configured. Verified checkpoints remain private on the development computer; local copies are not off-device backups.
4. Private lease upload storage: still unavailable behind its existing guard.

See [operations index](README.md), [current recovery handoff](WATERBEAR-DEVELOPMENT.md) and [backup/restore procedure](BACKUP-AND-RESTORE.md).

## Stable development release

- Application commit: `f133572` (follow-up release records are documentation-only).
- Stable URL: https://teams-management-development.pages.dev/tenant/login
- Release header: `tenant-household-20261018`.
- Development runtime version: `c498f52a-f9cf-4167-a4ea-1db77e3a38de`, verified at 100 percent traffic.
- Existing stable Pages gateway and migrated D1 binding preserved; no Pages stable upload, credential replacement, schema migration, or 2Nspira deployment.
- Final live checks: home, tenant login, contact, new protected page redirects, tenant/admin API denial, and branded login at all three widths passed with no browser errors. Authenticated household round-trips were verified on the isolated hosted synthetic candidate, not by impersonating a real tenant in the migrated database.
- One initial stable home request returned HTTP 500 immediately after release. Its historical cause is unconfirmed. Subsequent home checks and the full final stable smoke pass returned normally; a subsequent runtime tail contained no exceptions. Do not label this observation a diagnosed or guaranteed-fixed cold-start issue.
- Post-release checkpoint: all 63 tables/schema restore exactly, integrity `ok`, zero foreign-key violations, unchanged export bookmark during capture. Its logical database fingerprint equals the pre-change checkpoint: no migrated database content changed during implementation or verification.
- The corrected capture tool completed the post-release capture directly, without the temporary pre-change config wrapper.
