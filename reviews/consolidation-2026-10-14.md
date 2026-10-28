# Current integrated preview — final consolidation

## Serving release

- **Application commit:** `d60293ec72a3664761c93b3774ac398ffd852589`.
- **Canonical preview source branch:** `feature/property-operations-2026-10-14`. Repository `main` has not been merged or publicly launched. A report-only commit follows the deployed application commit.
- **Stable:** https://teams-management-preview.pages.dev/
- **Deployment:** https://cd4be0fe.teams-management-preview.pages.dev/ (`cd4be0fe-89a6-4162-9b4f-4174f6c97346`).
- **Isolated verified candidate:** https://f9cb3697.teams-management-preview.pages.dev/
- **Frozen private runtime:** `teams-preview-runtime-d60293e`, version `983a4ec5-8687-44cc-922e-058decc9759a`.
- **Immediate rollback:** https://15699233.teams-management-preview.pages.dev/ (`15699233-8032-441c-91a8-51e466b5ceb0`), source `7f17cc0dad3a13ff037e3b778787e93c9ffc8b5c`, frozen Worker `teams-preview-runtime-7f17cc0`. For rollback, restore that service binding and Pages deployment together; do not restore/reset D1. Earlier security and self-contained Pages rollback points remain retained below.
- Pages branch `preview` / Cloudflare Production environment belongs to the **preview project**, not the public company site. Public-company deployment `b3b6e676-f5d4-41fc-bd3f-48dad4260d1d` is unchanged; public production was not deployed or included in application QA.
- Existing Pages secrets/variables and D1 bindings were fingerprinted and preserved. Only the named runtime service binding changed. No masked/write-only secret values were overwritten.

## Admin entry points and features live on stable preview

- `/admin`: actual-record Operations Overview, not illustrative portfolio numbers.
- `/admin/properties`: searchable, sortable private property directory, building/superintendent/open-request filters. All **18 non-archived properties** are present.
- `/admin/properties/[id]`: Overview | Apartments | Tenants | Leases | Superintendent | Maintenance. Existing `/admin/buildings/[id]` dashboard alias remains compatible.
- `/admin/operations/units`, `/admin/tenants`: paginated unit and tenant directories; bedrooms/bathrooms/area where supplied, private notes, contact/preferences, access state, multiple tenants per unit, audited assignment history and session revocation. Identity email cannot be silently changed through an unverified edit.
- `/admin/operations/leases`: dates, monetary metadata, multiple leaseholders, status/renewal history. Renewals create a distinct agreement and preserve prior dates, terms and associations.
- `/admin/superintendents`: contact/language records and many-building assignments. Tenant contact disclosure is opt-in and authorized per property, not automatic.
- `/admin/maintenance`: existing requests remain the single source of truth; property/unit views link the same IDs. Scheduled, In Progress, Cancelled and completion states, staff assignment, audited activity and private notes are integrated. Assignment does not automatically dispatch or email staff.
- `/admin/media`: Property Media (`/admin/buildings`), Homepage Media (`/admin/homepage`), Media Assets (`/admin/media/assets`), Public Content (`/admin/media/content`). Existing assets, assignments, publication gates, Residential/Retail galleries and reuse contexts were preserved; no media library was deleted or replaced.
- Primary navigation: Dashboard | Properties | Tenants | Maintenance | Media | Settings. **Inquiries is removed from primary navigation and dashboard shortcuts**, but review remains under Media → Public Content → Rental inquiries (`/admin/inquiries`), because the current public Rent with Us form still writes inquiry records and sends notifications. Eight website submissions are QA-marked; one older `web` record also exists. Genuine customer use was not confirmed. No inquiry data, public form or routing was deleted.
- Public website, Dining, Featured Property rotation, galleries, Gmail-backed authentication and Tenant Services remain intact. Portal URLs are included in the existing transactional email templates.

## Building-list corrections and latest Golden Gate reconciliation

- Exactly the two user-identified accidental archives (1374 1st Ave and 1626 2nd Ave) were restored to their prior Draft state through audited Admin updates. Other archived legacy/QA records were not restored.
- Edit, Mark for review, Archive and Draft badges were removed from the legacy list. Server-side archive attempts return409, protecting stale Admin pages too. Publication states/gates remain intact.
- Confusing row-number badges were removed; the media property list retains an actual database total.
- Sarasota had existed only in the approved preview portfolio, not in D1 Admin. An audited new record was added without replacing an identity; stable ID is `7a0d4a54-1fcc-4470-a557-00e077040d1a`.
- The newer separately released Golden Gate title/URL changes were reconciled from `fix/golden-gate-building`, not overwritten: current title `609 Golden Gate Pt`, canonical `/properties/609-golden-gate-pt`, permanent query-preserving legacy redirect from `/properties/609-golden-gate-pt-unit-402`. No unit number remains in its title. Property identity is not a claim about verified occupancy, leases or management of every condominium unit.

## QA, security and deployment verification

- **100 automated tests pass**, typecheck and supported OpenNext build pass. Local D1 tests exercise the additive schema twice, uniqueness/retries, atomic audit rollback, stale revisions, household assignments, renewal history, document authorization and 400-unit pagination/index plans.
- **Local rendered workflows:** property selection; add/edit unit and reload; multiple tenants in one unit; reassignment/deactivation with retained historical IDs; superintendent contacts/languages and two buildings; lease creation/edit/renewal; server-error draft retention/retry/cancel; same-request property/unit maintenance views; private staff assignment, full status lifecycle and tenant-visible synchronization.
- Local browser stale-edit protection returned409, retained the draft and did not overwrite the saved record. Revoked tenant session returned401 and redirected to login.
- **54 local responsive Admin views** at1440/768/390 passed. Final candidate: **27 hosted Admin views**,18 properties and every property-linked resource API; existing Admin/tenant sessions200, role isolation denied unauthorized endpoints, hosted lease uploads disabled and tenant My Lease hidden.
- **Final candidate public sweep:52 routes /156 responsive views**, no page errors, overflow or broken loaded images. `/rent-with-us/apply` remains intentionally404. Golden Gate redirect/metadata have dedicated automated coverage.
- **Stable preview:**27 hosted Admin views and12 targeted public/gallery/Dining responsive checks passed, with release header matching the exact application SHA. Public-company deployment metadata remained unchanged.
- Browser Media Assets upload exposed an existing bug: `Array.map(prepareMediaUpload)` passed its array index as the byte limit, preventing uploads. Fixed with an explicit callback. Real browser upload returned201; Admin file200, tenant/public access denied; the synthetic QA asset was archived and never published. Identical corrected upload/operations code is retained in the final reconciled release.
- Fresh Admin/tenant OTP login, replay denial, cookie security and Gmail acceptance/inbox evidence were established in the accepted security upgrade. This operations promotion reverified existing sessions and authorization; it did **not** claim a new OTP exchange or send duplicate QA maintenance emails. Jeffrey confirmed management/tenant notices for QA requests7/8, including the linked tenant receipt. Current mail implementation and secret bindings were preserved.
- D1 backup/export was preserved before operations migration. Hash guard protects1,118 original rows across15 tables: **zero unexpected changes**; exactly two user-authorized building restorations are explicitly accounted for. New Sarasota/QA media rows are additions, not baseline replacements. No tenants, lease history or maintenance records were reset, and no rent-roll/schema seed was replayed.
- Featured rotation intentionally establishes first-visit cookies by redirect; non-browser verification must preserve those cookies. Cookie-aware verification returned200. No rotation behavior was changed to accommodate a cookie-less diagnostic client.

## Framework/runtime and remaining concerns

Next15.5.28; OpenNext Cloudflare1.20.11; Wrangler4.151.0; Tailwind4.3.3; Vitest5.0.4. Cloudflare `nodejs_compat`, compatibility date2026-10-14. Full dependency audit: **0 findings**, down from39 (4critical/25high/8moderate/2low). This is dependency evidence, not a guarantee against all application vulnerabilities.

Hosted `PROPERTY_OPERATIONS_ENABLED=1`, `TENANT_LEASES_ENABLED=0`, **no lease-document bucket binding**. No R2 or other paid storage/service was activated. The account already reports Workers Standard; strict $0 usage is not independently proven and requires billing/quota visibility and operating controls before production.

## Complete but intentionally not activated / incomplete work

- Lease metadata/history/permissions are live. Private PDF adapter and tenant My Lease architecture passed local-only private-store/authorization tests, but **hosted uploads/downloads and tenant My Lease remain disabled** until a private backend, access/retention policy and any spend are explicitly approved. PDF bytes never enter D1 or `/public`, and documents are not automatically emailed.
- Real operational onboarding remains management-owned: verified tenancy/occupancy, lease terms, staff contacts/assignments and property-specific emergency information are not invented from website content or QA records. Missing verified unit metadata must not be fabricated.
- Granular staff roles remain future work; this release enforces the existing authorized-Admin model. Detail-history views currently cap certain sections at100 entries (tenant document list20); underlying records remain retained. Further pagination is needed before those per-record limits are exceeded.
- Unrestricted public-description editing is not enabled; approved descriptions continue through the existing content source. Media/Public Content links preserve existing presentation controls rather than presenting a nonworking editor.
- Optional earlier Tenant Services benefit cards remain a UX backlog. Older MapLibre/3D prototypes remain experimental and are not merged just because branches exist.
- Final work-order inbox/coverage, approved emergency contacts, management routing, legal/content/publication approval, private storage and billing/quota confirmation remain production decisions. See detailed business gates below.

## Current open PR dispositions

These are review recommendations, **not claims that PRs were merged or closed**. No main merge or public launch occurred.

| PR | Current disposition |
|---|---|
| [#1](https://github.com/2NspiraOpsTeam/teams-management-site/pull/1) | Media self-service changes patch-equivalent/live; close duplicate after repository reconciliation, do not merge an older whole branch. |
| [#5](https://github.com/2NspiraOpsTeam/teams-management-site/pull/5) | Legal/accessibility implementation is already in serving ancestry; duplicate integration, separate legal/business approval remains. |
| [#6](https://github.com/2NspiraOpsTeam/teams-management-site/pull/6) | Readiness fixes integrated in preview; retain for canonical-main reconciliation, not authorization to launch/merge main. |
| [#7](https://github.com/2NspiraOpsTeam/teams-management-site/pull/7) | Original platform branch superseded by reconciled#8; do not deploy its older application wholesale. |
| [#8](https://github.com/2NspiraOpsTeam/teams-management-site/pull/8) | Accepted security release, now ancestor of integrated preview; retain release/review evidence. |
| [#9](https://github.com/2NspiraOpsTeam/teams-management-site/pull/9) | Golden Gate release was already deployed separately and is now merged into operations source; do not reapply its D1 identity update blindly. |
| [#10](https://github.com/2NspiraOpsTeam/teams-management-site/pull/10) | Active consolidated operations review, code deployed/verified on stable preview; draft review is not a main merge. |

New branches `fix/property-archive-safety-2026-10-14` and `fix/golden-gate-building` are integrated into the canonical preview source. Detailed older branch/functionality/regression inventory follows; those historical recommendations remain applicable.

---

# Teams Management consolidated review — 2026-10-14

## Historical security-upgrade baseline (superseded by the integrated release above)

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
