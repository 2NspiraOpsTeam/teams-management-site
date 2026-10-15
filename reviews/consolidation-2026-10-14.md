# Teams Management consolidated review — 2026-10-14

## Verified serving release

- Application commit: `65a8a56463bad38094121bd22d038439f2aeb7ea`.
- Canonical deployed source branch: `review/security-consolidation-2026-10-14` (not `main`).
- Stable: https://teams-management-preview.pages.dev/
- Stable immutable gateway: https://8b329791.teams-management-preview.pages.dev/
- Candidate: https://e456ce46.teams-management-preview.pages.dev/
- Private frozen Worker: `teams-preview-runtime-65a8a56`; version `df30917a-49ed-4b2a-8de1-cd4ec9603658`.
- Pages primary branch/environment: `preview` / Production; this is the preview project, not the public company site.
- Rollback deployment: `e5d29c54-7c20-4e28-bc0c-facf384dd9e1`, self-contained original Pages build. Preserve it independently of the new Worker. Future candidate releases must use a NEW Worker service, not mutate this serving release's service.
- Public company deployment remains `b3b6e676-f5d4-41fc-bd3f-48dad4260d1d`; no public-company deployment or domain changes.

## Security / compatibility evidence

Next 15.5.28; OpenNext Cloudflare 1.20.11; Wrangler 4.151.0; Tailwind 4.3.3; Vitest 5.0.4. Audited dependencies: 39 findings (4 critical,25 high,8 moderate,2 low) to zero. Includes removal of the deprecated Pages adapter and vulnerable Vercel/tooling dependency chain; patched Next and scoped compatible PostCSS/sharp/glob overrides. 78 tests, typecheck and supported build pass. Audit is dependency evidence, not a guarantee against all application vulnerabilities.

Pages preserves the original request URL/cookies/body over a same-account private service-binding RPC to the Worker. Only required runtime variables are forwarded; credentials are not placed in HTTP headers, URLs, browser responses or repository files. No write-only secret values were read back or written. Production/Preview variables and D1 binding configuration were preserved; only the named service binding was added. Worker has no public workers.dev/custom-domain endpoint.

Candidate public-route sweep: 51 public pages, desktop/tablet/mobile layouts; no page errors, overflow or broken loaded images. `/rent-with-us/apply` intentionally remains404. Two initial harness classifications were corrected: uppercase CSS required case-insensitive copy matching, and the intentionally disabled application route was not a regression. Targeted rendered reruns passed; no app source was changed for those harness corrections.

Fresh Admin and approved QA Tenant OTP inbox receipt/verification passed; consumed-code401; HttpOnly/Secure/SameSite Strict cookies; Admin↔Tenant isolation. Sessions regressed on final candidate and stable. QA #7 exercised failed-save draft retention, duplicate receipt suppression, private photo authorization, full lifecycle, completion/closed history, internal-note isolation and six responsive Admin/Tenant layouts. A UI harness initially selected the list filter before the detail panel finished loading; scoping to the loaded management form passed. No duplicate request was created to recover the harness.

Admin valid image upload201, SVG400, archive200, private Admin read200, public/Tenant404. QA fixtures only; no existing property/gallery media edited. QA #7/#8 are closed. All10 notices have `sent`, attempts1, provider IDs. Jeffrey confirmed #7 management, tenant confirmation and update/closed receipt. #8 checked new canonical portal links; full Gmail-MIME OTP link tests also passed. No OTP values retained in reports/files.

## Branch / PR inventory and dispositions

Every local/remote ref was inspected; raw ref SHAs, ancestry, patch equivalence and changed-file inventory are in `branch-inventory-2026-10-14.json`. Local worktrees have no unpublished application edits beyond this new operations branch; older untracked QA reports/screenshots and local Wrangler SQLite state are not missing features. Do not commit local Wrangler state.

| Branch / PR | Functionality / deployment evidence | Completeness, risk, disposition |
|---|---|---|
| `review/security-consolidation-2026-10-14` | Reconciled runtime plus current app and email links; stable65a8a56 | Verified serving source. Retain canonical preview line; no main merge. |
| `fix/platform-security-2026-10-14` local/origin; [PR7](https://github.com/2NspiraOpsTeam/teams-management-site/pull/7) | Original supported-runtime review; integrated by reconciliation with current work orders | Original branch older; merging alone would omit later fixes. Superseded by consolidation; recommend close after retaining evidence. |
| `qa/production-readiness-2026-10-13` local/origin; [PR6](https://github.com/2NspiraOpsTeam/teams-management-site/pull/6) | Readiness fixes already ancestors of stable, local ahead with later review evidence | Deployed through newer canonical chain. Do not merge stale branch to main/public launch. Retain evidence, supersede PR during canonical-main reconciliation. |
| `feature/admin-media-self-service` local/origin; [PR1](https://github.com/2NspiraOpsTeam/teams-management-site/pull/1) | Upload improvements patch-equivalent to stable; live API/UI already present | Verified again in runtime QA. Duplicate; recommend close, not merge old API over newer validation/photo numbering. |
| `origin/feature/legal-compliance-preview`; [PR5](https://github.com/2NspiraOpsTeam/teams-management-site/pull/5) | Legal/accessibility/footer source is ancestor of stable | Already integrated; legal/business approval still separate. Recommend close duplicate PR; avoid its stale base. |
| `feature/admin-media-preview-integration` local/origin | Core media work included; unique remainder: GoldStreet3D and rent-roll SQL | 3D prototype remains experimental/not current QA. Rent-roll units already exist remotely (242 `rentroll-%` IDs); SQL is not an unapplied UI feature. Do NOT replay/import or blindly merge. Retain reference only. |
| `gold-street-maplibre-prototype` local/origin | Earlier aerial/map/font/loading prototypes | Not integrated wholesale, not current QA. Newer public map/gallery work exists. Retain experimental; never merge merely because branch exists. |
| `feature/61-gold-aerial-preview` local/origin | Selected earlier aerial behavior is already ancestral | Historical integrated source, not permission to expose other prototypes. Retain/archive reference; no merge needed. |
| `origin/feature/dining-delizia73` | Older restrained-motion treatment; newer Dining source has video, approved images, directions and shared property rotation | Some styling intent superseded, exact older change not fully integrated/current-tested. Whole merge risks replacing later functionality. Retain optional UX reference; no integration needed for security or operations. |
| `origin/feature/tenant-services-live-benefits` | Four explanatory benefit cards, not new portal backend functionality | Cards not on current surface; branch predates legal/accessibility notices. Implement selectively only if still wanted, preserving notices; retain optional copy/UX backlog, not whole-branch merge. |
| `feature/rental-application` local | Fillable PDF plus FAQ | PDF patch equivalent; FAQ semantics already present in newer Rent page. No separate unpublished application workflow. Never restore disabled incomplete online application. Retain/archive. |
| `feature/rental-form-preview` local/origin | Conditional application field/document registry, PDF/handoff work | Ancestor of stable. Online submission intentionally disabled404; private document intake is not complete. No merge. |
| `fix/canonical-address-consistency` local | Canonical addresses/evidence audit | Both unique commits patch-equivalent to current source. Remote ZIP corrections already separately verified. No merge; never replay data updates. |
| `origin/dax/preview-media-integration` | Alternative media-delivery policy lineage | Equivalent intent already in merged gallery policy plus later media tests. Divergent history/multiple merge bases; whole merge risky. Retain reference, no merge. |
| `dax/property-media` local/origin, `origin/dax/main-media-delivery-policy`, `main` local/origin | Approved image delivery, gallery policy | Ancestors; PR2/3 merged historically. Already deployed. `main` lags preview and is NOT serving canonical source. |
| `feature/dining-photo-rotation` local/origin | Approved covers and cross-page visit-wide rotation | Ancestor of stable; covered by feature tests and public rendering. Already integrated. |
| `review/photo-numbers-2026-10-14` local/origin | Media numbering and overlays | Both local and remote ancestor of stable. Already integrated. |
| `origin/review/demo-readiness-2026-10-14`, `origin/review/media-contexts-2026-10-14`, `origin/review/nearby-actions-2026-10-14` | Responsive/demo, independent Residential/Retail presentation, nearby actions | Ancestors; live/current tests retained. No merge. |
| `origin/review/residential-fullbleed-2026-10-14`, `origin/review/retail-feature-2026-10-14`, `origin/review/retail-occupants-2026-10-14` | Galleries, retail feature, occupant links | Ancestors; live. No merge. |
| `review/work-order-mvp-2026-10-14` local/origin | Work orders plus property-details removal | Exact pre-upgrade serving base, integrated and verified. Retain rollback/source lineage. |

PR dispositions above are recommendations, not claims that those PRs were merged/closed. No GitHub CI checks were reported for the older open PRs. A merged-looking ancestry/patch match is distinguished from live QA.

## Property operations baseline (before this new implementation)

- Property creation/editing, publication safeguards, map/media/retail controls: implemented; not a complete operations dashboard.
- Private units: creation/editing and internal statuses implemented; bedrooms/bathrooms/area/occupancy verification, complete tenant/lease joins, scalable filtering/pagination: partial/missing.
- Tenant access: identity/assignment/activation/invite/revoke and sessions implemented. Full tenant profile/searchable paginated directory, role-specific household/leaseholder model: partial/missing.
- Lease management/history/leaseholder associations: not built. Existing `tenant_documents` table is metadata scaffolding, NOT a secure working lease/document module.
- Superintendents/multiple-building assignments: not built.
- Work-order MVP: implemented and live. Property/unit-linked complete maintenance views and explicit staff/superintendent assignment, Scheduled vs In Progress vs Cancelled: separate development, not implied by MVP completion.
- Tenant My Lease: not built/live; must remain hidden until scoped authorization/private storage QA.

## Business decisions / production blockers

1. **Work-order inbox:** current runtime falls back to existing inquiry routing (`jcortez@2nspira.com`); final dedicated mailbox/ownership and response coverage require approval. No invented inbox.
2. **Emergency contacts:** approved property-specific numbers/instructions and coverage hours needed. Existing emergency-services notice remains; do not invent numbers.
3. **Management contacts:** existing public contact is Admin@TeamsManagement.com /212-861-0303; confirm role-specific routing/coverage before production. Do not silently change to test recipients.
4. **Private lease storage:** choose approved private backend, retention/deletion/access policy, upload limits and operating owner. R2 is not activated; PDF bytes must never enter D1 or `/public`.
5. **Cost:** account already reports Workers Standard. No plan upgrade, paid activation or R2 purchase occurred. Strict $0 operation is not proven by a green build. Verify included usage, limits and billing visibility/controls; Free10ms CPU/request constraints need profiling before a public launch. D1 export is ~60MB including existing media; private-document bytes must not increase it.
6. **Governance:** legal/content/rights/publication approval, real operational data verification, secure storage/retention and canonical-main reconciliation remain production gates. Preview promotion is not public launch approval.

New property operations are developed on `feature/property-operations-2026-10-14`, isolated from the serving security release. Module status and QA must be updated independently; this baseline is not a claim those new modules are already complete.
