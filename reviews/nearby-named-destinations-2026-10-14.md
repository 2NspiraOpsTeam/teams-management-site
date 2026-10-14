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
