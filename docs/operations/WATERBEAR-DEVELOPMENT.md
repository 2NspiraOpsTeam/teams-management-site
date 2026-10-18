# Waterbear development handoff

Updated 18 October 2026. Waterbear development is ready for continued feature work after the corrected migration. The original 2Nspira environment remains unchanged. This status supersedes the initial synthetic-only setup.

## Environment and release

| Item | Development value |
| --- | --- |
| Website | https://teams-management-development.pages.dev |
| Admin sign in | `/access` |
| Tenant sign in | `/tenant/login` |
| Cloudflare account | `8fbe09502d38e82ab1b3d51f8eb7a1c6` |
| D1 database | `teams-development-db`, `29dfe758-69b1-4465-b74e-101d48c53f7e` |
| Private Worker | `teams-development-runtime` |
| Working Worker version after migration | `ef0686fd-c0c9-4be5-a11e-fe4577dc5b25` |
| Release header | `d22a754-waterbear-portal-fix-20261018` |
| Application baseline | `d22a754a05219e4540c64def8bf99862cf23722d` plus the source changes in this handoff |
| Worker config | `wrangler.waterbear.jsonc` |
| Build config | `open-next.waterbear.config.ts` |

The default `main` branch at the migration review was `923ff597318f1475b1062af6f1c2c04d5d65dd11`, older than the deployed baseline. The branch `setup/waterbear-development-2026-10-18` starts from the correct baseline. Use the handoff changes on that history; reconcile main separately before choosing a production release. Do not treat this documentation commit as an already deployed release identifier.

## Runtime contract and mail

The Pages gateway calls `TEAMS_RUNTIME.handleRequest` on the private `TeamsPreviewRuntime` RPC entry point. Deploy `deployment/preview-runtime/entry.mjs`, which loads the OpenNext build. Deploying `.open-next/worker.js` directly breaks this gateway. Keep Workers public routes disabled and preserve the existing Pages bindings and encrypted secrets.

Independent Waterbear Google credentials are configured under the names `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`. The internal OAuth app has Gmail send-only authorization. The development sender is `do-not-reply@waterbearmecca.com`. Sign-in mail delivery and a new development-domain admin link were verified. Never copy these credentials into production or print their values.

Portal URLs are compiled into the Next build. Set `NEXT_PUBLIC_TEAMS_PORTAL_ORIGIN` before building as well as in runtime configuration. The tenant importer accepts the verified development database ID and still requires its matching backup configuration and authenticated active operator.

`TEAMS_MIGRATION_WRITE_FREEZE=1` rejects POST, PUT, PATCH and DELETE requests with HTTP 503 while permitting GET, HEAD and OPTIONS. Set it back to `0` only after verification. It is currently `0`. This gate covers application HTTP requests; separately stop background jobs, direct database writers and other integrations before a coordinated snapshot or restore.

## Repeat development release

1. Capture a verified checkpoint and record the current Worker version before a material data change or deployment.
2. Install from the committed pnpm lockfile with the matching pnpm version. Keep dependency and package-manager changes separate from feature changes.
3. Run applicable tests. The focused migration checks are:

   ```sh
   pnpm exec vitest run tests/development-portal-links.test.ts tests/tenant-manual-upload.test.ts tests/inquiry-mail.test.ts tests/media-delivery-policy.test.ts
   ```

   The migration validation passed these four suites and all 28 tests.
4. Build with the development origin:

   ```sh
   NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_PREVIEW_PORTFOLIO=1 NEXT_PUBLIC_ENVIRONMENT=development NEXT_PUBLIC_TEAMS_PORTAL_ORIGIN=https://teams-management-development.pages.dev pnpm exec opennextjs-cloudflare build --config wrangler.waterbear.jsonc --openNextConfigPath open-next.waterbear.config.ts
   ```
5. Review the account, database binding, mail sender, flags and release identifier. Preserve the Google secrets. Deploy the private Worker using `wrangler.waterbear.jsonc` only within the authorized development scope. Record the returned version before checking the website. Updating code does not require redeploying the existing Pages gateway.
6. Check the release header, anonymous access denial, signed-in admin pages, tenant authorization, images, contacts, rent roll and maintenance. Use an approved recipient for any test email. Do not reuse old OTPs or copied sessions.

## Data and remaining acceptance checks

The migration passed a full 63-table schema and content comparison against the intended destination, including source history, approved owner edits and the exclusions listed in [migration QA](MIGRATION-QA-2026-10-18.md). All QA people were removed from the tenant directory; synthetic buildings were archived. Historical rows linked to archived buildings are retained outside the active portfolio.

A second approved occupant is enabled for tenant sign-in on the requested real apartment, preserving the original occupant. Verify a fresh sign-in with the owner when available; no fresh tenant code was requested after that final reassignment. Private identity details and acceptance evidence are held in the owner's QA package.

Three missing or nonnumeric rent values remain flagged in the imported source data. Financial totals stay partial until an authorized operator resolves them. Unknown source ownership/floor information is preserved rather than guessed. Private lease upload storage remains unprovisioned, with the existing unavailable guard retained.

The recovery procedure has a successful isolated D1 restore drill and a verified completed-state checkpoint. Off-device private backup replication and a recurring schedule are not configured. Select an approved encrypted destination and retention policy before production launch.
