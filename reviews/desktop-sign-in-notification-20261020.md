# Desktop sign-in notification cleanup

- Requested: no duplicated code in notification; retain code-first phone subject.
- App revision: 951b545. Isolated from undeployed media-query optimization.
- Admin and Tenant subject: `01234567 — Sign-in code` (synthetic example).
- Preview: `Expires in 10 minutes. Never share this code.` Hidden padding prevents body headings/code from extending the HTML snippet. Plain-text fallback starts with the same safety message; visible email body retains one usable code.
- Sender display name: Teams Management; existing From address and Reply-To retained.
- Verification: 375 tests, typecheck, OpenNext build, 1,333 checksum-verified image variants, six rendered email checks at 390/768/1440; desktop/mobile email screenshots inspected.
- Runtime-only preview follow-up: teams-preview-analytics-20261020 version 806d9af1-5292-461b-a12f-50efa124dbec. Existing Pages gateway/config unchanged; prior runtime 8c9d9d3a-fc7a-4b89-8b1b-44f870977525 retained for rollback.
- No fresh email sent. Native desktop/phone notifications and received sender display remain unverified; client snippet handling can vary. Company production unchanged.
