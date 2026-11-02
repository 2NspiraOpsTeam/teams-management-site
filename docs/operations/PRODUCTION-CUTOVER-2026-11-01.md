# Production preparation — 1 November 2026

Status: www cutover completed at Jeffrey's request; verified evidence is recorded
below. Earlier inventory/preparation sections are historical. This is not blanket
backend/operational production-readiness sign-off.

## Observed live inventory

- Target: `https://www.teamsmanagement.com/`, HTTP 200, currently attached to
  direct-upload Pages project `teams-management-coming-soon` in 2Nspira account
  `36a7807b2d8726b889873bab8b572113`. Primary branch `main`; no Git integration.
- Coming Soon rollback deployment: `b3b6e676-f5d4-41fc-bd3f-48dad4260d1d`,
  `https://b3b6e676.teams-management-coming-soon.pages.dev`. Deployment metadata
  records a dirty source tree; do not claim its Git SHA reproduces the artifact.
  Its project currently has no application variables or runtime/database bindings.
- Apex GET redirects HTTP 302 to www. Apex DNS resolves to an external forwarding
  service; www CNAME points to `teams-management-coming-soon.pages.dev`.
  No `teamsmanagement.com` zone was returned by the current Cloudflare zone query.
  This does not establish registrar access or a DNS-write entitlement.
- Preview: direct-upload Pages project `teams-management-preview`, primary branch
  `preview`, using the Pages **production environment**. Canonical gateway deployment
  `e9f7f966-e703-4c81-91fa-f3699cc67105`, gateway metadata commit `c6e23b0`.
- Preview gateway binds `TEAMS_RUNTIME` to private service
  `teams-shared-login-20261029`, entrypoint `TeamsPreviewRuntime`.
  Served application release header is
  `b7692be8af06aaee80e424de068e9dd565946b97`; gateway commit is not application SHA.
- Current preview D1 binding: `2d04fbea-8af6-4d6d-b5bf-cf758666d55e`.
  Jeffrey subsequently confirmed retaining the current preview records as the
  production business data source. Preserve this database in place; no reset,
  replacement or development-database import is authorized by that selection.
- Preview runtime has observability enabled, usage model `standard`, and no explicit
  limits in the settings response. This is not proof of paid compute entitlement.
- Proposed reviewed-source starting point:
  `513bfeaf2d32aae747da0438f036ecd2c7d25f45`, including dependency patches
  `33a0140`. PR 40 is open and both current-head integrity checks succeeded.
  Its base is the October 30 testing branch, not main; no merge is implied.

## Proposed route (not executed)

Retain the existing www Pages project and custom-domain attachment. Prepare a
separate production application runtime and gateway, validate them in isolation,
then replace the Coming Soon project's gateway artifact on its actual `main`
primary branch after concrete release approval. This uses the existing hosting
platform and avoids a DNS transfer merely to publish the application. Keep the
preview runtime and alias independent. Re-inventory settings immediately before
any release, because this document is a point-in-time record.

Production runtime must retain the private RPC entrypoint and assets contract;
deploying `.open-next/worker.js` directly is not equivalent. Prepare its config
only after database selection and schema review. Do not create an unguarded
deployable config with guessed database IDs. The gateway must receive its own
correct service binding, production secrets, and intentional feature flags.
Never serialize masked Pages secret values back into a PATCH or copy Waterbear
credentials. Secret-name presence alone does not prove delivery capability.

## Build/content transition requiring verification

`NEXT_PUBLIC_PREVIEW_PORTFOLIO=1` currently does more than hide search indexing:
it includes draft portfolio content and preview-specific covers, galleries and
media paths. Turning it off changes public query eligibility and content.
Leaving it on retains preview canonical URLs and noindex behavior.

Production must be rebuilt with
`NEXT_PUBLIC_TEAMS_PORTAL_ORIGIN=https://www.teamsmanagement.com` and production
environment settings. A runtime variable alone cannot repair compiled email
destinations. Review approved property/media publication coverage and production
artifact content before selecting the final build flags. Do not bulk-publish
draft records, remove intended portfolio content, or copy preview-only assets
into a public release as an undocumented shortcut.

## Remaining gates and decision owners

1. Confirmed by Jeffrey: retain existing preview business records as the live
   source. Preserve database `2d04fbea-8af6-4d6d-b5bf-cf758666d55e`, IDs, current
   writes and credentials. This is not approval to publish every draft record.
2. Engineer: inspect selected database schema and migration ledger read-only;
   compare exact-release requirements and public publication coverage. Prepare
   any required incremental migration separately for concrete approval.
3. Engineer/Jeffrey: establish production sender credentials, approved QA recipients,
   maps restrictions, access policy, storage and compute entitlement. Current
   Coming Soon environment cannot run application authentication as configured.
4. Jeffrey: select encrypted off-device backup destination, retention and RPO/RTO.
   Engineer: capture current checkpoint and prove isolated cloud recovery without
   overwriting live records. Local synthetic restore is not this gate.
5. Engineer: canonical production build; final-ref security analysis; candidate
   Admin/Tenant fresh OTP receipt, consume/replay/logout and role separation;
   representative uploads, contact/lease/maintenance operations, responsive
   browser QA, monitored normal-day hosted soak and recovery evidence.
6. Engineer: present exact source SHA, target runtime/version, Pages deployment,
   binding/config changes, database plan, checkpoint, expected interruption and
   rollback pair. Obtain concrete production release approval per repository
   AGENTS.md and PRODUCTION-PROMOTION.md before the live switch.

## Cutover and rollback criteria

Do not promise zero downtime before candidate/domain checks. No DNS mutation is
planned for this route. Preserve MX, SPF, DKIM and other unrelated DNS records.
Immediately before release capture fresh project settings metadata and deployment
IDs privately, preserve usable production credentials, and checkpoint the chosen
database. Freeze writes only when the reviewed data operation requires it, also
accounting for background/direct writers. Never restore preview data over a
different production database.

After approved publication verify the www served release SHA, exact normal
navigation/static chunks/photos, www email destinations, canonical/robots/sitemap,
TLS, apex redirect, authenticated role flows and errors. Distinguish provider
acceptance from actual inbox receipt. Monitor authorization, 5xx, latency, D1
usage and mail outcomes. Abort launch acceptance for unresolved critical flows.

If application publication fails, restore the preserved Coming Soon Pages
deployment and verify www in a rendered browser; this restores the holding page,
not resident portal service. Keep the previous application runtime/gateway pair
for any subsequent app-to-app rollback. A code rollback does not roll back data;
never discard post-cutover writes without a separately reviewed recovery action.

## Verification boundary

Live HTTP/DNS, Cloudflare project/runtime metadata and GitHub checks were inspected.
Read-only source database inventory found 17 draft buildings, 3 archived buildings,
**zero published buildings**, and 269 published photo assignments. Consequently,
simply disabling the preview flag would exclude all buildings from production
queries even though photo assignments have publication approval. Do not mutate
publication flags without reviewing the exact properties and shared-preview
behavior: some preview showcase queries specifically require draft buildings.
The schema table inventory includes current auth, work-order and operations
tables; this is not a complete column/index/ledger compatibility certification.
No production build, candidate deployment, browser QA, production sign-in,
complete schema compatibility review, database restore or live cutover was
completed in this preparation pass.

## Authorized property publication — completed

Jeffrey explicitly requested publishing all 17 active properties (Telegram message
15829). Applied to the retained database on 2 November UTC / 1 November Pacific:
17 draft buildings are now `published`; all 3 archived buildings and every other
building field except the active records' `updated_at` were verified unchanged.
Recorded 17 per-property audit entries with the actual requester and message.
A fresh full pre-change SQL snapshot was restored locally with integrity `ok`
and zero foreign-key violations; snapshot, exact ID-scoped guarded SQL, checksum
and read-back evidence are private, outside Git. No deployment or domain change.

This supersedes the earlier zero-published inventory and missing-publication-
approval gate only. The preview build's draft-only `page-showcase.ts` eligibility
must be made compatible with published properties in the reviewed release;
HTTP 200 on preview/www does not verify photo-showcase rendering. Remaining
production release, recovery and hosted-flow gates are unchanged.

## Continued cutover authorization and candidate preparation

Jeffrey subsequently instructed continuing until the production URL works with
preview content. This authorizes the www gateway cutover described above; retain
the preview database in place, existing preview runtime and Coming Soon rollback.
No billing change, DNS change, tenant import or destructive recovery is included.

Production build now has an explicit `build:production:worker` script: production
canonical/portal origin, preview/draft access off, approved portfolio presentation
on, and all 1,336 prepared images staged with checksum verification. Presentation
is distinct from publication eligibility. Canonical portfolio fixtures require a
matching published live building in production; archived/missing/draft rows are
excluded. The preview showcase supports published as well as draft buildings.

Read-only fresh live-schema comparison found all columns for the 64 application
schema tables present (68 live tables total). No migration is proposed. This is
column coverage, not certification of every index/constraint or all data semantics.
542 application tests, 13 recovery/release tests, typecheck, npm and pnpm audits
passed. Local production-artifact browser QA passed Home, properties, retail,
dining and one property detail at 1440/768/390 widths, decoded images with no broken
images, no overflow/page exceptions, and www canonicals. Local public portfolio
fixture excludes private tenant/auth/session/contact data. Hosted verification and
cutover identifiers will be recorded after execution; local QA is not live proof.

Target private runtime: `teams-production-runtime-20261101`; Pages target remains
`teams-management-coming-soon`, actual primary branch `main`. Bind the retained
D1 in place. Use the existing owner-controlled 2Nspira Google sender credentials,
not Waterbear credentials. New production-only OTP peppers do not change preview
peppers or password hashes; existing shared database records are preserved.
Off-device encrypted recovery and normal-day observation remain separate
operational readiness gaps and must not be presented as completed.


## Production cutover — completed 1 November Pacific / 2 November UTC

- Application source: `02b3cfa3733c55805e4ea9e2dd0dba0b54011ced`.
- Private runtime `teams-production-runtime-20261101`, active 100% version
  `f32d3b33-819b-4e8d-ba89-ef82b7e59531`; no public workers.dev route.
- Tested Pages candidate `4940300a.teams-management-coming-soon.pages.dev`,
  preview environment / `production-candidate-20261101` branch. Initial superseded
  candidate `8624e099` had mistyped commit metadata; the replacement's exact
  commit and application fingerprint were verified before promotion.
- Production Pages `f4173ba9-5dc6-4cb9-96bb-73ce0752efb6`, production environment,
  actual primary branch `main`; metadata and served application match source above.
  `https://www.teamsmanagement.com/` now serves the application, not Coming Soon.
- Existing domain attachment/DNS preserved. Preview gateway/runtime and existing
  credentials remain unchanged; preview still serves `b7692be8af06aaee80e424de068e9dd565946b97`.
- Retained DB unchanged in place: 17 published / 3 archived properties verified.
  No schema migration, tenant import, record reset or production database swap.
  A previously approved synthetic QA Admin/password was temporarily recreated for
  candidate and www login checks, then its password, sessions and identity removed.
  No real tenant/property/lease/maintenance records were edited by this release.
- Production sender credentials were configured from the owner-controlled existing
  2Nspira sender grant; OAuth refresh succeeded. Credentials were not printed or
  committed. Separate production OTP peppers leave preview credentials unchanged.
- Fresh full checkpoint restored twice with matching schema/typed-data fingerprints,
  integrity and foreign-key checks; 117 portable batches retained privately.
- Both GitHub integrity runs at the application source succeeded. 542 application
  tests, 13 recovery/release tests, typecheck, production build, npm/pnpm audits and
  1,336-rendition artifact checks passed.
- Candidate AND www: all 269 prepared-source photo checks passed exact bytes and
  checksums; 15 rendered page/viewport combinations each passed (Home, properties,
  retail, dining, 1365 detail at desktop/tablet/mobile), with no page exceptions,
  broken decoded images or overflow and correct production canonical metadata.
- www: 33 public routes including all 17 property detail URLs returned the expected
  application release. Production robots/sitemap, unauthenticated role guards,
  guarded-photo denial, ordinary header/property/contact navigation and refresh
  passed. Visually inspected the delivered mobile homepage and property directory.
- Candidate AND www: fresh synthetic Admin password sign-in, authenticated Admin,
  property, tenants and maintenance pages, tenant-role denial, logout revocation
  and cross-origin rejection passed. These are NOT fresh OTP/inbox or authenticated
  Tenant workflow proof.

Rollback: retained Coming Soon Pages deployment
`b3b6e676-f5d4-41fc-bd3f-48dad4260d1d` remains the holding-page recovery target.
Rolling it back does not undo DB writes or produce a resident portal. Preserve the
production runtime version and its asset/config pair for application recovery.
Exact project/settings inventories, checkpoints, OAuth recovery material, image
proof and browser evidence remain private outside this public repository.

### Remaining operational verification (not claimed complete)

Fresh Admin/Tenant emailed-code receipt and consumption on www, authenticated Tenant
business flows, hosted realistic uploads/longer normal-day soak, explicit compute
entitlement evidence, encrypted off-device backup destination/retention/RPO/RTO and
isolated cloud restoration remain unverified. The Gmail inbox CLI grant used for
QA reading returned invalid_grant; production sender OAuth refresh separately
passed. No real client messages were sent as a workaround. Site publication is
complete; these gaps prevent blanket production-readiness sign-off.
