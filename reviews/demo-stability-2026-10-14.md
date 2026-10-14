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
