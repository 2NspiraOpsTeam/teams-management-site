# Main / tested preview source reconciliation — 28 October 2026

Jeffrey authorized reconciling legacy main with the tested preview and resolving
its dependency alerts. This is a source reconciliation, not a production launch.

## Exact baseline and preserved history

- Legacy main: `923ff597318f1475b1062af6f1c2c04d5d65dd11`.
- Tested preview application: `f5a4e54397a096ebaeea2a7fbdf8d35da00ea5fd`.
- Preview lineage plus passing prelaunch safeguards:
  `c226ae4805c5a3ccb3718466c098347f7b9d265c` (PR #26).
- Legacy main is an ancestor of this lineage: zero main-only commits and 391
  preview-lineage commits. Preserve the history; do not replace main with an
  orphan snapshot, rebase the approved branch, or individually merge stale PRs.
- The reconciliation includes the approved media, nearby destinations, visible
  paused video player, logos, operational features, supported runtime and
  dependency updates. Generated photo variants remain checksum-verified assets.

## Repository hygiene

Remove ten inherited `.wrangler/` state/manifest files from the current tracked
tree and ignore the directory. Local files are preserved. These files already
existed in legacy main; this does not erase Git history or prove historical
data exposure absent. Private recovery/QA files stay outside the checkout.

## Deployment boundary

Read-only Cloudflare API inspection confirms `teams-management-preview` is a
direct-upload Pages project with production branch `preview`, no Git source
integration, and only its pages.dev domain. The repository's sole Actions
workflow runs integrity checks, contains no deployment step and receives no
deployment credentials. Merging main does not promote this source to the live
preview or a company production hostname. Existing D1 bindings, runtime secrets,
schema, database contents and live application remain unchanged. No migration
is run; production schema readiness remains a separate release prerequisite.

## Security acceptance

Before reconciliation, GitHub reports 78 open dependency alerts, including six
critical alerts in legacy `package-lock.json` (Next, Vitest, tinypool and tar).
Require a clean install, full and production dependency audits, canonical
integrity checks and fresh GitHub checks for the reconciliation head. Allow
GitHub to reevaluate alerts from the merged default-branch lockfile; never
dismiss them merely because a preview branch audits cleanly. Report the actual
post-merge counts separately from dependency audit results.

The secondary pnpm lockfile initially had nine advisories (five high and four
moderate), despite the clean npm graph. Refreshed it against the existing
manifest and updated transitive body-parser within its permitted range.
Full npm, production npm and pnpm audits now report zero vulnerabilities.
CI now explicitly audits the full npm graph and the pnpm graph in addition
to the production npm graph. Canonical npm clean install, 491 tests / 58 files,
typecheck, six recovery checks, five release-gate checks and the OpenNext preview
build pass; 1,333 generated photo variants are checksum-verified.

Gitleaks 8.30.1 scanned the complete proposed tracked tree (not Git history).
Its three detections were reviewed: two documentation prose matches and a
fixed SQL mutation marker, not credentials. GitHub reports zero open secret
scanning alerts and push protection remains enabled. One legacy-main medium
CodeQL stack-trace finding points at a route already replaced by the approved
Admin-only report handler, which returns a generic error without a stack.
Require fresh default-branch analysis after merge to establish its disposition.

Fresh signed-in Admin/Tenant workflow QA, off-device recovery and a cloud
restore drill remain separate launch gates; this change does not claim them.
