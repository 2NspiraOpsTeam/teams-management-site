# Corrected framework candidate — 20 October 2026

## Source and scope

Branch `release/client-readiness-20261020` starts directly at `c35a84846eb993538f207d55688638601d349195`. It preserves the property-directory/header covers, guarded manual Send/Resend invitation controls, and sign-in notification cleanup in that history. No unrelated feature branch or open email-design PR was merged.

Upgrade: Next.js 16.4.2, React/React DOM 19.3.1, OpenNext Cloudflare 1.20.12, React 19 types and matching npm/pnpm lockfiles. Next regenerated its TypeScript JSX/type includes. Responsive photo components now distinguish URL strings from React 19 Blob image sources, preserving both. The pnpm build-script allowlist permits only the existing esbuild/workerd installers.

## Local release checks

- 381 tests in 49 files passed after the compatibility fixes.
- TypeScript passed before and after full builds.
- Full normal Worker build passed without unsupported-version bypasses.
- Full preview Worker build passed with preview environment and canonical preview portal origin; 1,333 derivative checksums verified during staging.
- Application route manifest: all 117 previous entries retained, plus Next 16's global error page (118 total).
- Production and complete npm dependency audits: zero known advisories.
- Six recovery-planner safety tests passed. No cloud database export or restore performed.
- Canonical `TeamsPreviewRuntime` wrapper dry-run bundling passed: 1,554 assets, gzip Worker 2,439.28 KiB. Dry-run performed no upload or activation.
- Local built Worker used a newly created disposable synthetic SQLite fixture only. No Cloudflare data was copied into it.
- 51 rendered views at 390/768/1440 widths, zero page-script exceptions or document overflow: 21 tenant/household/Admin-review/sign-in views and 30 property/directory/tenant-detail/public/sign-in views.
- Interactions: property notes cancel/no autosave, save/refresh, clear/refresh, backend-error draft retention/retry; authenticated cover decoding, image failure fallback and refresh recovery; invitation recipient confirmation/cancel, real local unconfigured-mail failure, intercepted success/loading/single-request lock; sign-in validation/partial code/autofill/error recovery; household validation/clear/error/loading/success/refresh/duplicate/cancel/Admin review; anonymous/role/private-media denial and reduced motion.
- Successful mail and sign-in response branches were intercepted locally; no real email was sent in local QA. Local image data was synthetic, not the hosted property photography.

## Explicit limits

- The inherited `lint` command is `next lint`, which Next 16 no longer supplies. It fails as an obsolete command; there was no ESLint configuration/package in this baseline. Lint is not counted as passed. Tests, strict TypeScript, full framework compilation, runtime checks and browser QA are separate successful gates.
- Physical devices, capacity/load, fresh inbox delivery, and hosted authenticated behavior are not established by local checks.
- All full-page screenshot captures are supplementary; viewport/DOM checks avoid treating screenshot-stitching artifacts as application duplication.
- Database contents remain on Cloudflare. No reset, export, migration, paid upgrade, production deployment, or real-tenant invitation is part of this release.
