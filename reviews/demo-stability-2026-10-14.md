# October 14 demo stability pass

Deadline: 3 PM Eastern. No new features, paid services, public launch, configuration changes or database mutations.

## Findings and safe corrections

- Initial broad candidate sweep encountered Cloudflare Error 1102 resource-limit pages on some property routes. These are real failed checks, not app accessibility/overflow failures: the Cloudflare error pages were being measured.
- Sequential repeated probes of the affected candidate and stable routes subsequently returned 200. A separately instrumented sweep returned all 51 public routes 200, without app exceptions, overflow or accessibility violations; one third-party ArcGIS street tile failed under the aerial layer. The historical Error 1102 subtype remains unproven: do not claim an evidenced CPU/memory root cause.
- Filtered Pages tail during the diagnostic sweep recorded successful invocations, including many speculative RSC requests. Public Next links now disable speculative prefetch (55 instances). Explicit navigation remains unchanged; no persistent caching or changes to publication/authentication gates.
- Existing Leaflet layers now replace failed third-party tiles with a neutral non-geographic tile, never fabricated map detail. Accessible failure feedback directs visitors to existing Google Maps actions; aerial-to-street fallback remains, and refreshing can recover the provider. No replacement provider or subscription.
- A Matter of Health's official website identity/address independently verified via its own public storefront data; applied across matching nearby records, not a property-specific patch.

## Checks to finish before stable release

Typecheck, test/build and whitespace checks; candidate full public sweep, normal navigation/no speculative prefetch, map-provider failure/recovery on desktop/mobile; named nearby destinations; hero timing/controls; stable post-promotion and existing-role regression. Record actual completed evidence below.

## Completed release and stable results

- Implementation c49f6020e45c72e6e9e5aa8ca4f60d9bac33ccc7; final immutable candidate https://d35a6316.teams-management-preview.pages.dev; stable https://teams-management-preview.pages.dev; immutable stable https://03e8354e.teams-management-preview.pages.dev, deployment 03e8354e-669b-4f20-b58b-e58e7a619889. Cloudflare canonical record confirms primary branch preview / Production environment and exact commit. Only unrelated tracked local Wrangler SQLite state remains dirty; no outstanding source edits.
- Typecheck, 62 tests in 10 files, Pages build and whitespace checks passed.
- Final candidate and stable each passed all 51 discovered public pages and 204 desktop/laptop/tablet/mobile layouts (1440/1280/768/390): HTTP 200, one H1, valid in-page anchors, no horizontal overflow, missing image alt, broken loaded images, browser exceptions or automated WCAG A/AA violations. Final candidate and stable had no Error 1102 recurrence. Earlier failing sweep retained; mitigation is observed reduced background work, not a proven historical CPU/memory diagnosis or a guarantee against future provider errors.
- Candidate normal portfolio browsing: 0 speculative RSC requests while idle/scrolling; explicit property click navigated correctly. Eight forced map-tile failure/recovery cases across portfolio, retail, individual street-context and aerial maps at 1440/390 passed: meaningful status, 0 broken tiles, no overflow/exceptions, actual provider tiles loaded again after refresh. Failure screenshot visually reviewed.
- Stable mobile/tablet navigation: menu open, Escape close/focus restoration, Retail navigation and closure passed. Home/Dining feature controls and property Next controls changed displayed content. Rental inquiry valid/invalid/partial, busy-disabled, backend-error/retry, retained fields, success/reset paths passed with intercepted simulated API responses only. Retired application 404 has main-content/recovery links. No real inquiry/email was submitted by this demo pass.
- Read-only existing-session regression: nine Admin pages and two approved QA Tenant pages at 1440/768/390 (33 layouts), HTTP 200/no overflow/no browser errors; anonymous guards and role isolation passed, QA-only tenant unit present. One initial harness expectation incorrectly demanded 401 from the Admin building endpoint; source intentionally hides it behind middleware 404 without a cookie, and the corrected guard assertion passed. No authentication code requested, invalidated or emailed.
- Stable actual external actions, all 176 nearby cards and hero autoplay controls passed; see nearby-named-destinations review. Home mobile and exact A Matter of Health card/Google route screenshots visually inspected.

Not verified in this pass: fresh emailed-code delivery/login, inbox receipt, a new live inquiry submission/notification, public custom-domain production. Existing sessions are not fresh OTP proof. The prior broader inbox-readiness item is not claimed resolved by mocked form QA.

Evidence: /tmp/demo-public-final-candidate.json, /tmp/demo-public-stable.json, /tmp/demo-stability-candidate-qa.json, /tmp/demo-interactions-stable.json, /tmp/demo-role-stable.json, /tmp/demo-stable-deployment-record.json and targeted nearby/hero reports. No remote data/configuration mutation, public production release or spending; source branch pushed without main merge.
