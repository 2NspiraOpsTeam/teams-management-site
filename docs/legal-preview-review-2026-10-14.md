# Teams public legal layer — preview review record (2026-10-14)

This document is an internal implementation/provenance note, not public-site copy. The new pages are concise publication drafts for the existing Pages preview, not a legal opinion or approval for the client-production site.

## Implementation facts checked

- Public inquiries persist name, email, optional phone, property interest, and message in D1 (`src/app/api/contact/route.ts`). Notifications are asynchronous. The public rental application route is disabled; the downloadable PDF is a separate handoff.
- Tenant/admin sign-in uses emailed codes and session cookies. Tenant maintenance stores category, description, urgency, preferred contact, tenant ID, and assignment ID. API queries scope records to active assignments (`src/app/api/tenant/maintenance/route.ts`).
- Pages and D1 are on Cloudflare (`deployment/pages-preview/wrangler.toml`). `MailService` supports Gmail delivery when environment bindings are configured (`docs/mail-runtime.md`). The policy does not claim it is presently configured.
- Functional session and featured-property-rotation cookies exist (`src/middleware.ts`, tenant/admin session routes). No analytics/ad cookie assertion is made.
- Published retail pedestrian count is a nearby NYC DOT measurement, not storefront traffic or a forecast (`src/components/nearby-highlights.tsx`, `src/lib/retail-pedestrian-data.json`).
- No `$100` application-fee language was found in `src/` or the public rental PDF text. `docs/rental-application-field-map.md` retains a historical internal warning and is not site copy.

## Fair-housing research

- [New York State Division of Human Rights — source-of-income guidance](https://dhr.ny.gov/source-income-discrimination): lawful housing assistance and vouchers are protected.
- [NYC Fair Housing — protected classes](https://www.nyc.gov/site/fairhousing/rights-responsibilities/what-are-the-protected-classes.page): includes lawful source of income.
- [HUD Equal Housing Opportunity graphics](https://www.hud.gov/contactus/hudgraphics): official artwork reference. The preview uses text treatment, not a modified HUD logo.

## Final business/legal review before client production

- Confirm the policy contact email and actual Workspace mail routing, the desired records-retention schedule, and any additional processors or analytics added later.
- Review privacy rights wording against actual operational request handling.
- Review the Fair Housing statement and any approved corporate policy. Audit D1-authored public property/unit copy in addition to repository content before production.
- Counsel/business owner to decide whether limitation of liability, indemnification, arbitration, dispute resolution, or governing-law language is needed. No aggressive clauses were invented here.
- Review the downloadable application PDF and broker workflow for current fee and fair-housing compliance before client production.
