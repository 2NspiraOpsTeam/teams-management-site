# October 5, 2003 clipping readability

Source: https://www.gmaloneco.com/oct5nyt.htm (retrieved 2026-10-27). Owner previously authorized republication. Original 393 × 312 JPEG retained unchanged.

Built-in image tool restoration was rejected: it changed Frank Pecora to Pucora, invented opening paragraphs and reconstructed facial detail. Rejected image remains outside repository; not published. Prompt: conservative 4x archival restoration; exact headline/byline/date; preserve photos, architecture and all lettering; no invented small print or detail.

Published candidate uses deterministic Sharp Lanczos3 4x resampling and gentle sharpening (sigma 0.55, m1 0.3, m2 0.7), WebP quality 94. This improves display sampling, not recovered historical detail. No generative pixels used. Full original frame retained; maximum desktop display reduced from 768 to 640 CSS pixels.

Clear-text reader transcribes the accessible reprint verbatim, including historical spelling and its October 12 correction. Whitespace and HTML formatting normalized only. Original/publisher/reprint/PDF links retained. Reader is native HTML details/summary; no JavaScript required.

## Verification and release

- Application commit: c008504, based on live favicon/source fab50cb (not an older checkout).
- Site SEO tests: 2 passed. TypeScript and OpenNext build passed. 1,333 checksum-verified existing photo derivatives staged unchanged.
- Candidate private Worker: teams-news-readability-20261027, version 84e7805a-4bca-4554-b583-c971db6e8869. Pages review https://dd0a1f90.teams-management-preview.pages.dev ; primary branch remains preview, direct upload, no Git provider.
- Candidate rendered QA: desktop, 768px tablet, 390px and 320px mobile; 57 text blocks, correct correction, 1572×1248 image decoded, no overflow. Keyboard Enter closes/reopens reader. No page errors.
- Stable runtime-only release: teams-news-review-20261023 version 6dcb7528-097e-4fa7-979b-45179b899947. Existing Pages gateway 77dd7210-d38f-4ecb-ade2-ec014595bebe and Production bindings/secrets unchanged. Fingerprint news-readability-20261027. Rollback runtime 9822a8a5-3fcc-4b71-852f-bd5474245afe.
- Stable browser verified at desktop/320px: reader opens, all 57 blocks present, image decoded, refresh restores normal closed state, no overflow or browser errors. Image GET 200 / 239,046 bytes. Public buildings API 200; protected data endpoint 401. No authenticated login, email, database edits, or company-production release performed.
- Local direct runtime URL returned its deliberate RPC-only 404; local rendered QA not claimed. Python HTTP client received Cloudflare 403; hosted verification used the actual managed browser.
- Image quality improvement is modest sampling/sharpening only. Small print in the historical scan is not recovered; full-text reader provides legibility without fabricated historical text.
