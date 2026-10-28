# Owner-approved property highlights

Jeffrey supplied the following public additions on October 23, 2026: Restaurant Row context for 349–351 West 46th Street; completed 2024 gut renovation at 307 West 39th Street; current renovation and planned 109 apartments, two stores, doorman, gym, lounge and rooftop/views at 61 Gold Street; 2001 development and 2021 Learning Experience renovation/11,000-square-foot school space at 3425 East Tremont Avenue; Frank Pecora’s 1983 founding of Delizia 73 and expanded neighborhood history.

Source copy lives in `src/lib/approved-property-highlights.ts`. Preview residential, retail and dining projections use it without database writes or changing publication eligibility. Replaced the obsolete 90-residence Gold Street plan; future amenities remain explicitly planned. Production publication remains separate.

## Verification and preview release

- Application commit: `eae5649`.
- OpenNext preview build with photo staging passed; typecheck and whitespace checks passed.
- Local built-Worker QA used isolated local records (no real tenants). Five affected routes at 1440, 768, 390 and 320 pixels: 20 route-width checks passed, expected copy present, no horizontal overflow or page exceptions, dining refresh passed. Local fixture photos intentionally absent.
- Updated existing private preview runtime `teams-news-review-20261023`, version `87d14b51-98f4-4b77-bada-e1912638a077`, served fingerprint `highlights-eae5649`.
- Stable URL: https://teams-management-preview.pages.dev . Existing Pages gateway deployment remains `77dd7210-d38f-4ecb-ade2-ec014595bebe`; its commit metadata describes the gateway, not this later runtime revision.
- Hosted Chrome QA passed the same 20 route-width checks and refresh; zero page exceptions. Gold Street desktop/mobile screenshots inspected; hosted gallery retained. Protected candidate Access was not changed or bypassed.
- Prior runtime version for rollback: `303b27f3-d081-4d58-ad4a-38236289168b` (`news-b3330a0`).
- Database, secrets, login, mail, bindings and company production unchanged. Fresh emailed-code login and authenticated workflows were not tested for this copy-only change.
