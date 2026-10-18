# Teams development — waterbearmecca

Established 2026-10-18. This is a separate development environment, not a production move.

## Ownership and release

- Account: `waterbearmecca` / `8fbe09502d38e82ab1b3d51f8eb7a1c6`.
- Pages: https://teams-management-development.pages.dev (primary branch `development`, direct upload).
- Initial deployment: `e9ca87e6-7955-4563-b17d-1d0ff0b9c5dc`.
- Application source: `d22a754a05219e4540c64def8bf99862cf23722d`, including read-efficiency work.
- Private runtime: `teams-development-runtime`, initial version `84c11487-7171-47ed-91a6-66fd128efd45`, RPC entrypoint `TeamsPreviewRuntime`. No public Worker route.
- D1: `teams-development-db` / `29dfe758-69b1-4465-b74e-101d48c53f7e`.
- Both Pages environments bind this development runtime and database. The Pages “Production” environment here is only this development project's stable alias, not company production.
- Repository stays `2NspiraOpsTeam/teams-management-site`. No main merge or production DNS/billing changes.

## Data and credentials

Schema initialized from a newly created, empty local QA database using the current ordered QA initializer, including read-efficiency indexes. Imported schema excludes Cloudflare/SQLite internal tables; no source account database was exported or copied.

Only labelled synthetic fixture data is installed: 6 draft properties and 180 apartments/tenant identities/leases. These are not client records and must never be promoted into production. Predictable local-harness sessions were omitted. A cryptographically random, short-lived synthetic Admin session used for QA was removed after verification. Foreign-key check passes.

Separate random Admin/Tenant OTP peppers exist in both Pages environments. Gmail credentials/sender are **not configured**: sign-in fails closed with HTTP 503. No email was sent. Complete a separate development Gmail authorization and set the three Google OAuth secrets plus sender variables before claiming user sign-in ready. Do not copy production refresh tokens or add a login bypass. Private lease/media upload storage is not provisioned; the runtime's existing unavailable guard remains in place.

## Repeat releases

1. Build intended source with `npm run build:preview:worker`; run applicable typecheck/tests when source changes.
2. Use `wrangler.waterbear-development.jsonc`, set `TEAMS_RELEASE_SHA` to the application commit, and deploy the private Worker. Await completion/version before updating the gateway.
3. Deploy `deployment/waterbear-development` using explicit account and project `teams-management-development`, branch `development`, exact commit metadata. Preserve Pages encrypted secrets; never serialize masked GET secrets back into a write.
4. Verify canonical branch/environment, exact release header, D1-backed APIs and rendered screens before calling the release verified.
5. Future production promotion promotes approved code only, retaining production bindings/data. Never use the development fixture database for production.

## Initial hosted verification

- Sign-in page renders; anonymous protected APIs deny access.
- Synthetic authenticated Properties, Apartments, Tenants and Rent Roll APIs return expected 6/180/180/180 totals.
- Properties, Rent Roll and Tenants rendered at 1440/768/390 widths; no page overflow or page errors. Desktop Properties and mobile Rent Roll screenshots inspected.
- Rent Roll next page and reload work (reload returns to page 1; no persistence claim for page selection).
- Synthetic property note save/read/clear succeeds; a stale repeat is rejected with 409.
- All short-lived QA sessions removed afterward; zero FK violations.
- Fresh OTP/email delivery and real-user login **blocked/not verified** until independent mail authorization is configured.
- Original 2Nspira preview remains deployment `879015fc-de82-4743-842e-44ddf842a2fe`, runtime `teams-contact-entry-2a51b93`.

Pending uncommitted lease-upload/LLC work in the prior release checkout was preserved and not silently shipped. Initial deployment reuses the already-built, previously locally tested d22a754 artifact; no new application code or full test-suite run was required for this configuration-only setup.
