# Named nearby destinations and demo-readiness correction

## Shared behavior

- Nearby Residential, Retail, and applicable Dining names use one shared official-name component: verified official HTTPS website in a new tab, otherwise plain text. No Maps/search/source fallback on names.
- Directions use the current property's full navigation address, destination name plus separately stored address, and walking mode. Coordinates remain internal positioning data. Optional verified Google Place ID fields are supported without inventing IDs.
- Missing/coordinate-only addresses fail closed instead of producing an ambiguous route.
- Audited all 129 stored nearby records by mapped identity; 126 retained. Fifteen coordinate-only identities now have separately reviewed street/entrance/corridor addresses. Parks without numbered addresses retain official street boundaries rather than fabricated house numbers or ZIPs.
- Removed the Gristedes identity at 1450 Third Avenue: three independent local reports describe its 2023 closure. Retained the separately mapped Chelsea Gristedes at 225 Eighth Avenue. Removed Poses Park and Edison ParkFast pending a reliable current access/entrance match; no alternate branch substitution.
- Corrected CVS 305 East 86th Street ZIP from 10128 to 10028 to match its official branch page. Both CVS branches retain separate addresses/official branch URLs.
- Added verified official links for Miele Park, Harlem Art Park, John Jay Park, Ramon Aponte Park (name corrected), Titanic Memorial, Caspary Auditorium, Frisson Espresso, and ALDI.
- Society Library official website currently returns 503 maintenance: its name is temporarily plain text; its separately sourced address/directions remain.

## Verification

Typecheck, all 61 tests, whitespace check and Pages preview build passed. Current primary branch `preview`, no Git provider, direct-upload project; existing Production/Preview binding names inspected read-only. Preserve rollback b8cfb4af-b82f-4ead-880f-b5c80b216478 and hero implementation 9c77433.

Evidence: /tmp/nearby-destination-audit.json (complete retained/excluded record audit), /tmp/nearby-live-websites.json (all 44 pre-existing distinct official websites rechecked), prior primary identity/address evidence /tmp/teams-nearby-website-verification.json and reviews/nearby-place-actions-2026-10-14.md. NYC Parks/IHG reject automated Chrome but primary web fetch succeeds; do not describe anti-automation as a broken destination. Maps browser verification and deployment QA will be recorded after completion.

No remote D1, credentials, environment configuration, real communication, billing, public launch or main-branch change.

Requester follow-up `/retail/1374-1st-ave`: A Matter of Health website independently verified through its primary public store-info response (`https://amatterofhealthmarket.com/api/AislezipApi/GetStoreInfo`): store name, 1347 First Avenue, ZIP 10021, telephone 212-396-4500. Applied the official storefront website by shared mapped identity across both matching property records. Directions retain named destination plus complete branch address; name is not a coordinate/search link.

## Final deployed verification

Stable preview https://teams-management-preview.pages.dev; implementation c49f6020e45c72e6e9e5aa8ca4f60d9bac33ccc7; direct Pages deployment 03e8354e-669b-4f20-b58b-e58e7a619889, Production environment / primary branch preview. Candidate d35a6316; source review branch review/demo-readiness-2026-10-14 pushed. Runtime and source preserved; no main merge or public-company-site release.

- Stable 34 Residential/Retail/Dining pages, 176 rendered nearby cards: every official-name/plain-text branch, named destination, complete per-property origin, external tab/rel/accessibility attributes and refresh matched reviewed data. 15 targeted desktop/tablet/mobile nearby layout/focus checks passed; no browser exceptions.
- Stable actual click/touch new-tab actions: CVS official branch site and Google Maps named 305 East 86th Street branch from 1626 Second Avenue; exact requester `/retail/1374-1st-ave` official A Matter of Health site and computed named route to 1347 First Avenue from 1374 First Avenue, desktop and mobile. Google displays “A Matter of Health NYC, Inc” and actual branch address, not only coordinates.
- Separately rendered Google Maps routes confirmed distinct CVS 305 East 86th and 1622 Third Avenue branches, Gristedes 225 Eighth Avenue, Frisson 326 West 47th and Duane Reade 399 East 72nd. Preserve the fuller existing exact addresses; never substitute the closed Gristedes 1450 Third Avenue.
- Stable hero: four-second autoplay, continued hover rotation, manual pause/play, reduced-motion default/explicit opt-in, and desktop/touch Next/resume without a blur click passed. Title/full address overlay and below-gallery map actions checked across all 17 residential routes by the nearby sweep; final broad responsive sweep loaded their imagery without distortion-related CSS changes or overflow.

Evidence: /tmp/nearby-named-stable-qa.json, /tmp/matter-health-stable-qa.json, /tmp/maps-named-qa.json, /tmp/demo-hero-controls-stable.log, /tmp/demo-hero-autoplay-stable.log. Prior candidate responsiveness evidence /tmp/nearby-named-hero-candidate.json: 17 routes and 12 width/route combinations, exact edge-to-edge object-cover imagery and independent keyboard Previous/Next.
