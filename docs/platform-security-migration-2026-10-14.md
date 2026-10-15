# Supported platform/security migration — review only

Baseline: Pages preview commit 28f26aba127959f2684114cd78a6a7a646ce00a8. Existing Pages checkout and stable alias remain independently usable. This branch must not be deployed to Pages: OpenNext outputs a Worker, not a Pages artifact.

## Exact issue and risk

Next 15.4.11 and the deprecated next-on-pages adapter have security/support findings and cannot safely be force-upgraded together. Build tooling also carried vulnerable transitive dependencies. Retail additionally allowed unpublished building details outside the preview build; this branch requires published parents outside preview.

## Implemented fix

- Supported OpenNext Cloudflare 1.20.11, Next 15.5.27, Wrangler 4.151.0; request-context bindings remain runtime-scoped and retain D1 authorization.
- Node runtime replaces edge runtime for OpenNext. Root dynamic rendering prevents binding-dependent portfolio pages from prerendering without request context.
- Tailwind 4.3.3 with its supported PostCSS plugin and existing theme config; Vitest 5.0.4.
- Scoped compatible dependency overrides: Next PostCSS 8.5.30, Next sharp 0.35.5, minify glob 10.5.0. These replace audited vulnerable transitive versions; builds must continue to validate them on future upgrades.
- Retail listing/direct detail publication boundary tested against a real in-memory SQLite fixture: drafts remain preview-only and archived properties stay unavailable.
- Worker config uses a disposable local-only D1 identifier, no secrets, no public custom-domain routes. No remote Worker deployment or production DB migration is authorized by this document.

## Evidence and release boundary

Full npm audit: zero findings. Forty-eight tests pass; typecheck passes. Supported preview Worker build succeeds; 74 app routes match the Pages baseline with no missing routes. Initial dry run gzip bundle approximately 1.4 MiB, below the currently documented 64 MiB script limit. Local QA uses one approved public storefront image and synthetic local accounts, never real tenant sessions.

This does **not** establish deployed Worker authentication, Gmail delivery, production bindings, approved asset publication or operational launch readiness. Local runtime evidence and final updated bundle size are recorded in the parent report.

## Launch / cost

Launch blocker: yes, until supported Worker runtime/bindings and required end-to-end gates are verified. Package changes cost $0. No paid plan, R2 billing activation or custom-domain release performed. Worker/D1 free quotas are bounded, not an unlimited $0 guarantee; production must remain within free quotas and configure upload/abuse policies before launch.

Stable Pages preview remains the review surface until a deliberate runtime transition is approved and verified. Canonical PR6 must not be merged/released merely because this isolated patch passes audit.

## Current free-plan operating constraint

Official Cloudflare limits checked 2026-10-14: Workers Free has 100,000 requests/day and 10 ms CPU/request; script limit now documents 64 MiB. SSR/auth often uses 10–20 ms according to Cloudflare. Local build/guards do not prove edge CPU compliance. Remote budget profiling and optimization remain launch gates; no paid upgrade is authorized. Source: https://developers.cloudflare.com/workers/platform/limits/ .
