# In the News

Route: `/in-the-news`, linked from desktop/mobile navigation, footer, and sitemap.

## Editorial selection — October 23, 2026

Eight distinct publisher stories / transaction profiles. The owner's selected October 5, 2003 New York Times feature and full clipping lead; remaining stories are newest first. Short summaries are original, not full article reproductions. The owner requested the clipping from the Georgia Malone reprint; the local image retains full framing and credits the source. No additional publisher imagery or dependencies were added.

- Original five: NYT rental-building feature; Crain’s 69 Gold Street; two Real Deal Malba reports; Real Deal Second Avenue eminent-domain report.
- Added Bisnow August 25, 2026 deal sheet: its Top Sales section explicitly identifies Kings Capital and Frank Pecora as the 69 Gold Street buyers.
- Added PincusCo August 24, 2026 acquisition story: rendered title/date and public Frank/Peter Pecora tags verified; article body is subscription-only. Summary does not claim the body was read. Bisnow independently corroborates the transaction.
- Added Traded profile: rendered page identifies Frank and Peter Pecora of Teams Management as sellers of 517 West 212th Street. Display date is the publisher’s October 29, 2024 update, not the May 29, 2019 closing. Avoid its inconsistent square-foot figures and AI-derived size claims.

Searches covered exact Frank/Peter names, Teams Management, real-estate outlets, Delizia, Malba and 69 Gold Street. Excluded unrelated namesakes, directories/court records (not editorial articles), and generic related-story links without a demonstrated connection. No claim of an exhaustive press archive. PincusCo's Teams company profile independently describes it as the management company for Frank Pecora holdings but is not counted as a news article.

Original publishers remain primary links. The available Georgia Malone reprint is the featured alternative; do not label subscriber-only publisher pages as free. The supplied archive.is link previously encountered a challenge and is not represented as verified. No paywall bypass mirrors used.

## Verification

TypeScript, two SEO tests, diff whitespace check, and OpenNext build passed. Local rendered Chrome QA passed at 1440, 768, 390 and 320 pixels: eight cards, NYT first, clipping loaded, no horizontal overflow, menu open/Escape/focus, refresh and zero page exceptions. Full-page desktop/mobile screenshots inspected. Local Next server does not serve the separately staged photo variants; verify header/footer logo assets on the Cloudflare candidate. Candidate uploaded: app `b3330a009801ff47eb39b496492dc6df52d798f5`, private Worker `teams-news-review-20261023`, version `303b27f3-d081-4d58-ad4a-38236289168b`, review gateway https://139d168f.teams-management-preview.pages.dev (branch `news-review-20261023`). Only Pages Preview service binding changed; Production service remains the existing stable runtime.

Hosted candidate QA is BLOCKED, not passed: Cloudflare Access redirects the managed browser to its sign-in screen; the existing diagnostic service credential is expired, and its renewal was denied. The authenticated diagnostic probe returned 401 without an application fingerprint. Do not confuse Access HTML/HTTP 200 with an application pass. Stable remains `preview-reviews-5a25b34`, and `/in-the-news` remains 404 there. Restore authorized diagnostic access, run candidate hosted QA including all staged header/footer photo variants and bounded release guards, then promote/recheck the exact artifact. No stable or company production promotion was performed. Company production is a separate target and is not changed by preview publication. No database, mail, credentials or schema changes are required.


## Stable preview publication — October 23, 2026

Jeffrey explicitly requested publication to the stable preview after the candidate Access blocker. Published the already-built application without changing Cloudflare Access: selectively updated only the Pages Production `TEAMS_RUNTIME` service binding to `teams-news-review-20261023`, verified all existing environment variables and D1 bindings were preserved, and uploaded the unchanged gateway on primary branch `preview`.

- Stable URL: https://teams-management-preview.pages.dev/in-the-news
- Canonical Pages deployment: `77dd7210-d38f-4ecb-ade2-ec014595bebe`, environment Production, branch `preview`, application commit `b3330a009801ff47eb39b496492dc6df52d798f5`.
- Served release: `news-b3330a0`; private Worker version remains `303b27f3-d081-4d58-ad4a-38236289168b`.
- Stable hosted Chrome QA passed at 1440, 768, 390 and 320 pixels: eight articles, NYT first, clipping and all header/footer images loaded, no horizontal overflow, mobile menu/Escape/focus, refresh and zero page exceptions. Desktop/mobile full-page screenshots inspected.
- Home and news returned 200 with the intended release; Home contains the new navigation link. Tenant login returned 200; Admin access redirected and anonymous operations overview remained denied (404). Fresh emailed-code login and authenticated workflows were not tested for this public-content release.
- Prior rollback pair retained: Pages `5a67059c-ca38-485f-aea1-a8632cd1137a` with runtime `teams-preview-next16-20261020`, version `c7db359f-fba3-44b3-b2da-0be01095731b`. Restore the service binding too when recovering future uploads.

This supersedes the earlier unpublished/stable-404 status. The protected candidate remains unverified behind Access; no Access policy or credentials were changed. Company production, database/schema, mail and credentials remain unchanged.

## Article imagery — October 23, 2026

At Jeffrey’s request, added the Bisnow deal sheet’s publisher-hosted lead image alongside the existing NYT clipping. Caption identifies Loeb Hall, not Gold Street, and preserves Google Maps/Bisnow attribution. Image links to the source article; 768-pixel WebP is approximately 74 KB, lazy-loaded with explicit dimensions and descriptive alt text. Other publishers denied image access; no substitute properties, invented imagery or paywall bypasses used. Publisher hosting/attribution is not an independent reuse-license verification.

- Application `afea6f7`; build, typecheck and diff checks passed.
- Local and stable Chrome QA at 1440/768/390/320: eight stories, two loaded images, no overflow, safe external links, mobile menu/Escape/focus, refresh, zero page exceptions. Hosted desktop detail/mobile screenshots inspected.
- Existing private runtime updated to `f04df0ec-3314-4233-a056-b0c1d88e325c`; stable served fingerprint `news-images-afea6f7`. Gateway remains `77dd7210-d38f-4ecb-ade2-ec014595bebe`; runtime rollback version `87d14b51-98f4-4b77-bada-e1912638a077`.
- No Pages bindings, Access, database, credentials, mail or company-production changes. Protected candidate and fresh/authenticated login not tested for this public-page image change.

## Featured image enlargement — October 23, 2026

- Owner requested a larger top article image. Increased featured clipping maximum width from 393 to 768 pixels; full aspect ratio, attribution and links retained.
- Application `2b18a6a`; private runtime version `ddd40a5c-236f-4274-9bde-d419bec7cc1b`; stable fingerprint `news-large-2b18a6a`. Gateway unchanged (`77dd7210-d38f-4ecb-ade2-ec014595bebe`). Prior runtime rollback: `f04df0ec-3314-4233-a056-b0c1d88e325c`.
- OpenNext preview build, typecheck and diff checks passed. Local and hosted Chrome checks passed at 1440/768/390/320: images loaded, eight stories, no overflow or page exceptions, menu/Escape/focus and refresh passed. Rendered desktop clipping measured 768 pixels wide; desktop and mobile screenshots inspected. No production-company deployment or authentication changes.

## Full featured article PDF — October 23, 2026

Jeffrey confirmed republication permission and explicitly selected the top NYT article. Added a 128 KB, seven-page searchable text PDF sourced from the Georgia Malone copy, including author/date, original publisher and source links, copyright and published correction. This is a text reproduction, not a higher-resolution scan. Owner confirmation is the permission basis; no independent license-document review was performed.

Build, typecheck and diff checks passed. Local and hosted Chrome QA passed at 1440/768/390/320, including refresh/menu/focus and no page exceptions. PDF first-page rendering inspected; hosted PDF returned 200 application/pdf and matched the local file byte-for-byte via browser fetch. Python HTTP fetch received 403; browser access passed. Release news-pdf-20261023; Worker version bc2e9471-bf34-4d08-8b4c-c4a72c038644. Gateway unchanged. Prior runtime rollback ddd40a5c-236f-4274-9bde-d419bec7cc1b. No company production, D1, mail, secrets or binding changes; authenticated workflows not tested.

## All-story visuals and public interaction polish — October 23, 2026

Owner requested an image for every article and tasteful modern public-site effects. All eight cards now have visuals: original NYT clipping, verified Bisnow lead photo, and six local, clearly labeled topic-specific editorial SVG illustrations. Publishers blocked source-photo access; illustrations do not claim to depict the actual properties. No new packages, external image service, or recurring cost. Desktop uses compact side-by-side image/text cards; tablet/mobile stack. Existing PDF and publisher links remain intact.

Refined the existing progressive-enhancement motion system: softer heading entrance, subtle scrolled-header depth, gold card-edge hover/focus accents and restrained CTA lift. Public Header scope only; private Admin/resident layouts unchanged. Content stays visible without JavaScript; reduced-motion rules suppress transitions and transforms.

Build, typecheck and diff checks passed. Local and hosted news Chrome QA passed at 1440/768/390/320: eight loaded images, no overflow, mobile menu/Escape/focus, refresh and no page exceptions. Hosted desktop/mobile screenshots inspected. Local Next home cannot resolve Cloudflare runtime data (500); local news checks passed, and cross-page checks are performed against the hosted runtime instead.

Private runtime version: 727a94a0-647f-4633-91be-eecbbc6f8a02; served release news-visuals-20261023. Existing Pages gateway unchanged. Prior runtime rollback: bc2e9471-bf34-4d08-8b4c-c4a72c038644. Company production, D1, mail, credentials and bindings unchanged. Authenticated workflows and physical devices not tested.

Hosted cross-page effects QA passed on Home, About, Contact, Rent with Us, Tenant Services and News at desktop/mobile (12 route/viewport checks): HTTP 200, no horizontal overflow, scroll-header feedback and reduced-motion cancellation, zero page exceptions. Each lazy news image was scrolled into view and decoded before asserting load. Initial reduced-motion assertion was corrected to await the browser media-change event; initial all-image check was corrected to request each lazy image, not assume scrolling directly to the final card loads skipped cards. No product change was needed for either harness issue.
