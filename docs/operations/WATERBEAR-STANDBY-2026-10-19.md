# Waterbear Teams standby — 19 October 2026

**Status: prepared, awaiting hosted verification. Not ready for immediate development use yet.**

Jeffrey subsequently directed us **not to wait for the quota reset** and to resume 2Nspira development. Hosted verification is deferred, with no scheduled probe, activation, automatic failover or traffic switch. The procedure below is retained for a later authorized Waterbear completion.

2Nspira is the primary Teams preview and development account. No 2Nspira Cloudflare resources were modified during this task. Waterbear is a separate development/recovery environment, not automatic production failover or extra capacity for the same live workload.

## Inventory and disposition

| Waterbear resource | Disposition |
| --- | --- |
| Pages `teams-management-development` | Retained; direct upload, primary branch `development`, 4 deployments at inventory. |
| Worker `teams-development-runtime` | Retained, private RPC `TeamsPreviewRuntime`; current serving version preserved. Optimized synthetic-only version uploaded without activation. |
| Worker `teams-media-review-20261018` | Retained: referenced by historical media-review Pages deployment and preserved development DB. |
| Worker `teams-tenant-review-runtime` | Retained: referenced by two historical Tenant review deployments and QA DB. |
| Worker `2nspira-website` | Removed; fresh inventory confirms absence. Unused standard Next.js starter, no DB, secrets, route, domain, schedules, or incoming Teams references. Code and source/public assets archived privately. Exact hosted generated assets could not be downloaded during Error 1027; source-based local restoration passed a clean locked build and rendered browser check (HTTP 200, both logos loaded, no failed requests/client errors). The regenerated complete static/server artifact is archived too; this is not a byte-for-byte recovery claim for unavailable historical generated chunks. |
| D1 `teams-development-db` | Preserved unchanged; contains the earlier migrated client records, **not** the ongoing synthetic development target. |
| D1 `teams-tenant-qa-20261018` | Preserved unchanged with historical Tenant runtime. |
| D1 `teams-standby-synthetic-20261019` | New clean isolated standby database: 63 application tables / 131 schema objects; exactly matches the verified optimized-release schema. One draft QA building/unit, one controlled owner-mailbox QA Tenant alias, and one private synthetic PNG. No copied client rows, sessions, OTPs or media. |
| R2 / KV / queues / domains / scheduled jobs | R2 not activated; no KV namespaces, queues, Workers custom domains, account zones/routes, or Worker cron schedules found. No paid services enabled. |

The removed starter had zero recorded seven-day executions. Its removal is housekeeping, **not measured ongoing quota savings**. Historical deployments do not consume requests merely by existing. No Pages deployment or existing database was deleted.

## Serving chain, staging, and isolation

- Development URL: https://teams-management-development.pages.dev
- Account: `8fbe09502d38e82ab1b3d51f8eb7a1c6` (Waterbear).
- Pages primary branch: `development` (Production environment); branch reviews use Preview.
- Current Pages deployment: `e9ca87e6-7955-4563-b17d-1d0ff0b9c5dc`.
- **Still active:** runtime version `44894df3-9847-4c73-a273-817421e08392`, bound to preserved DB `29dfe758-69b1-4465-b74e-101d48c53f7e`. Existing Pages Production/Preview D1 settings also still name that old DB. Do not perform ongoing development against this legacy target.
- **Staged, not activated:** runtime version `4c1864de-37a5-449b-8c3f-e85c0ca202f2`, release `313f551-waterbear-standby-20261019`.
- **Only staged data binding:** `DB` → `8d1aa9bb-8370-4569-97b5-c1a61eb9406e` (`teams-standby-synthetic-20261019`). Importer target matches. No service/R2/KV binding exists on that version. Public Worker and version preview URLs remain disabled.
- `wrangler.waterbear.jsonc` now targets only the synthetic DB. Run the mandatory fail-closed guard before any Waterbear upload or activation:

  ```sh
  export CLOUDFLARE_ACCOUNT_ID=8fbe09502d38e82ab1b3d51f8eb7a1c6
  node scripts/recovery/standby-target.cjs "$PRIVATE_FRESH_VERSION_METADATA"
  node --test scripts/recovery/standby-target.test.cjs
  ```

The guard checks the explicit account, exact synthetic DB, single DB binding, importer target, portal origin, RPC entrypoint, endpoint settings, absence of unexpected overrides, and (when supplied) actual version metadata and required secret bindings. It rejects the preserved client DB and 2Nspira account. It is a deployment prerequisite, not a claim that a Cloudflare administrator cannot manually bypass it. Never deploy using the generic primary-account config.

## Account independence and remaining dependencies

All discovered Waterbear D1 bindings and service bindings target Waterbear resources. The staged version has no dependency on a 2Nspira Worker, Pages project, D1 database, R2 bucket or custom domain. Built-in approved public marketing assets are in the version's own Workers Assets; uploaded images use its own D1 `media_objects`. The fixture PNG was independently seeded, not copied from client storage.

Gmail is an **external** dependency: existing Waterbear Google client ID/secret/refresh-token bindings were inherited by the staged version without printing or rotating their values. Sender is `do-not-reply@waterbearmecca.com`. Admin/Tenant OTP peppers remain write-only secrets on the Waterbear Pages environments and travel over private RPC. Secret-name presence is configuration evidence, not fresh mail-delivery proof. The historical authorization setup used an existing Google OAuth client with a separate Waterbear send-only grant; whether that Google project is shared with primary mail is not newly proven. A 2Nspira **Cloudflare** outage should not disable Google, but a Google grant/project/sender failure can disable sign-in in either environment. Fresh hosted OTP remains pending.

Maps use external ArcGIS tiles and Google Maps links. Some public marketing media/videos can link to external services. These are not 2Nspira Cloudflare bindings; network availability and third-party limits remain dependencies. The local authenticated Admin QA made no external requests. Private lease-document storage remains unprovisioned with its unavailable guard; R2 was deliberately not activated. Standby does not contain client photographs or lease files unless separately approved. This is intentional data isolation, not full client-portfolio recovery.

## Quota blocker and reset

On 19 October at 14:19 UTC, one shell request and one confirming rendered-browser request to the old starter returned HTTP 429 / Cloudflare **Error 1027**, with “owner has reached their plan limits.” No further hosted application probes were made while capped.

Cloudflare's [Workers limits documentation](https://developers.cloudflare.com/workers/platform/limits/#daily-requests) explicitly identifies this as the **Workers Free account daily 100,000-request allowance**, resetting at **midnight UTC**. Next reset: **20 October 2026 00:00 UTC = 19 October 5:00 PM America/Los_Angeles (PDT)**. This is distinct from D1 reads/writes and CPU Error 1102. Dashboard subscriptions returned no paid subscriptions; no plan was changed.

Bounded seven-day adaptive analytics returned 130,501 development-runtime invocations (24 historical exceptions), 1,134 Tenant-review invocations, and 77 media-review invocations. Those per-script historical/adaptive counters are not an exact billed-account quota meter; do not add assumed service-binding events to manufacture 100,000. The observed error plus the documented limit identifies the exhausted quota. Exact charged-account counter reconciliation remains unverified.

## Verification completed before reset

- Canonical optimized OpenNext build and TypeScript check passed in an isolated checkout.
- Existing suite: **245 tests / 31 files passed**; additional target-guard tests cover wrong account, old database, duplicate binding, importer mismatch and bad remote metadata.
- Remote synthetic schema matches all 131 baseline objects; ordered seed import completed. Initial seed import failed its FK check and rolled back completely; zero fixture rows remained, then dependency-ordered insertion succeeded once. No existing DB was touched.
- Local Chrome: 7 role/API checks, 9 desktop/tablet/mobile layouts (1440/768/390), Admin page refresh, synthetic Tenant dashboard; no client errors or external requests in the checked Admin pages. Sessions were local-only fixtures, **not fresh hosted OTP proof**.
- Private synthetic image: authenticated 200, rendered width 1, `private, no-store`; anonymous public route 404.
- Existing client-bearing DB exported privately and fully restored twice offline: exact schema/content, integrity OK, zero FK violations. Standby synthetic DB exported and independently passed the same exact offline restore checks. No live destructive restore was attempted.
- Current serving runtime remains unchanged; staged version's synthetic binding and inherited secret names verified directly from Cloudflare version metadata.

## Bounded post-reset completion procedure

1. Read this report, fresh Waterbear deployment/version metadata and the private continuation file. Check no other authorized run already completed this release. Select Waterbear explicitly. Read-only quota information first, then **one** public availability probe after reset. If still capped, stop without retry loops or plan upgrades.
2. Re-fetch staged-version metadata and run the target guard. Verify 63-table synthetic schema and controlled QA identities. Preserve the existing deployment/version/configuration snapshot. Existing client-bearing databases are recovery archives, not targets for new QA.
3. Activate the guarded synthetic version only in Waterbear using its exact ID. Preserve original version for recovery, but **never automatically roll back to a client-bearing data binding**. If new-version verification fails, leave development blocked or apply a synthetic-only maintenance release; diagnose locally.
4. Selectively PATCH **only** `DB` in Waterbear Pages Production and Preview to the synthetic DB; preserve `ADMIN_OTP_PEPPER`, `TENANT_OTP_PEPPER` and all unrelated keys by omission. Re-read bindings. Gateway calls runtime DB over RPC, so both surfaces must agree before declaring readiness. Do not serialize masked secrets back into a PATCH. The existing gateway need not be reuploaded unless its configuration snapshot/fingerprint requires it; any upload must explicitly use primary branch `development`.
5. Verify stable release header, representative public pages/static assets, fresh Admin and controlled QA Tenant request/receive/verify/session, consumed-code rejection, cross-role denial, synthetic assignment scope, private media and unpublished denial. Read OTP only from the authorized owner's mailbox; do not send to clients. Use the existing authorized Gmail browser session when CLI OAuth is unavailable. Record delivery, verification, rendering and unverified gaps separately.
6. Exercise the recovery package in a **new temporary, empty Waterbear D1** using the synthetic checkpoint only. Verify exact schema/rows, media checksum, integrity and FK state, then remove only that newly created disposable test DB after preserving its evidence. Never restore over any existing database. This cloud rehearsal is pending; offline rehearsal already passed.
7. Capture bounded before/after Workers and D1 analytics plus application metering. Report browser requests, runtime invocations and D1 reads/writes separately; analytics lag may prevent exact attribution. No load testing or repeating gallery sweeps. Close all QA pages and stop tails.
8. Once every hosted gate passes, update this report and the handoff, capture the synthetic release checkpoint, and notify Jeffrey. Until then keep status **prepared, awaiting hosted verification**.

## Switching development, not live users/data

Once the hosted gate passes, a primary-account outage requires selecting this already-running Waterbear development URL and its branch/config; **no database import or public-domain redirect should be necessary**. Check its independent quota once, then continue with synthetic fixtures. Use local D1 when either account is capped; do not mirror live traffic, cycle accounts/databases to evade allowances, or enable paid capacity.

For subsequent approved changes: branch from the known application baseline, retain account-specific configuration, run local tests/build and schema rehearsal, take the matched checkpoint, apply only reviewed additive migrations to the synthetic DB, run the guard, upload and verify the Waterbear release. Sync **code and reviewed migration files** back to the primary branch via a reviewable commit/PR. Deploying to 2Nspira is a separate authorized action. Do not sync sessions, OTPs, tenant identities, client rows, uploaded files or test mutations between accounts automatically.

Moving live client data or public traffic requires a separate secure-transfer/release decision: approved exact dataset, access policy, encryption, matched backups/bookmark, freeze of all writers, schema compatibility, restore rehearsal, media transfer, authentication/session policy, reversible traffic plan, and post-transfer validation. This standby preparation grants none of those actions.

## Recovery assets and limitations

Private artifacts are outside the repository and owner-only. They include Worker multipart exports/settings and checksums, original website source/public assets, existing DB export with exact offline restore package, synthetic checkpoint, schema comparison, local screenshots and QA results, staged version evidence, and usage inventory. Source history and previous pre/post-migration checkpoints remain preserved.

No off-device encrypted replication, recurring synchronization, full cloud recovery, fresh hosted auth, or sustained Free-tier capacity is claimed. The standby can itself exhaust quota; it is development continuity, not a Free-tier uptime guarantee. Remaining hosted checks and cloud restore rehearsal are explicitly deferred to the reset, not marked passed.
