# Teams Management — Verified Current State (2026-10-08)

This document supersedes the earlier Milestone 0 completion/status reports in `docs/`. Those reports asserted a deployed preview, D1-backed admin CRUD, and a working contact form without live evidence. They are historical notes, not release evidence.

## Source and infrastructure

- Canonical repository: `2NspiraOpsTeam/teams-management-site`, `main`.
- Controlling scope: Maya's `teams_management_master_research_and_recommendations_v3.md` in the research repository.
- Preview runtime: isolated Cloudflare Pages project `teams-management-preview`, direct upload, branch `preview`; URL `https://teams-management-preview.pages.dev`. This is not the client-facing production site.
- Data: D1 `teams-database-dev` (`2d04fbea-8af6-4d6d-b5bf-cf758666d55e`), seven application tables. The preview's published-property API read proves its `DB` binding is live.
- The proposed `teams-management-worker` does **not** exist in the Cloudflare account; Pages, not a standalone Worker, owns this preview.
- R2 media integration is not implemented. `wrangler r2 bucket list` returns Cloudflare code 10042 (R2 must be enabled in the account dashboard). No media should be represented as approved or live.

## Verified and open

- Public homepage, portfolio, Contact, and published-property API returned HTTP 200 on the preview. An unknown property and `/admin/buildings` returned 404. The API projects only published public building fields; gallery output remains empty until explicit public-media approval is enforced.
- D1 holds 15 client-supplied property records plus one separate QA record. Four client properties are published; eleven remain draft pending accurate content/approval. The QA record is draft. The reconciliation is additive and does not overwrite the original four client records.
- `npm run typecheck`, `npm run test`, and `npm run build:pages` are the current validation gates. A passing build is not a complete browser, admin, or contact verification.
- Admin UI pages are placeholders, not D1 CRUD. They are blocked at the server middleware until authenticated, scoped access is implemented.
- The Contact form previously showed a fake success message without saving. It remains hidden on preview; the email contact path is visible. A private D1 inquiry payload table and `POST /api/contact` now provide validated, idempotent storage with an `admin_inbox` routing marker. Live preview QA returned 201 on initial submission, 200 on retry with the same receipt, 400 on invalid input, 403 on wrong origin, and 405 on an attempted public read. A D1 read confirmed the QA inquiry and private payload were stored. Actual notification delivery, authorized admin review, and reopening the UI remain open.
- Public media, R2 binding, responsive rendered QA, accessibility QA, and production deployment remain open.

## Immediate next work

1. Establish identity and server-side authorization for admin roles and property scope, then implement D1-backed building/unit/inquiry workflows.
2. Verify the inquiry API against the deployed preview, then complete notification/review routing and UI success/error/retry behavior before reopening the form.
3. Provision isolated R2 media, require explicit public-media approval, and verify image loading and responsive layout.
4. Run browser QA on desktop, tablet and mobile, then separately release and verify production when the launch criteria are met.
