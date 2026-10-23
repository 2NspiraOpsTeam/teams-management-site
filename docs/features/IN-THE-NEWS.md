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
