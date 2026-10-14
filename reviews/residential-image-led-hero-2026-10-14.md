# Residential image-led property standard

Source: 8e4839d1ea3de98705cc39d50681e1ae5480a46b. Shared residential detail template; no retail layout or database edits.

Title and full canonical address precede one large gallery, up to 1344px wide in a 1440px layout. Desktop 16:9, tablet 4:3, mobile 4:5; object-cover preserves proportions. Approved residential cover is first, deduplicated from gallery while retaining its caption. Hero autoplay disabled; manual arrows/thumbnails remain available. Other gallery instances retain previous behavior and image links stay separate from control buttons. No breadcrumb, actions, or metadata crowd the hero.

Dedicated wrapping utility row immediately follows gallery: View on Map, Map & Directions, Explore Street View, Contact Teams Management. Secondary content constrained to readable width; existing Overview, Property details, Amenities, Living Nearby, Neighborhood and portfolio content retained/reordered without invented facts.

Typecheck, 59 existing tests, diff whitespace check and Pages build passed. Candidate https://cd8f5f02.teams-management-preview.pages.dev. Stable https://teams-management-preview.pages.dev, immutable https://569e8710.teams-management-preview.pages.dev; deployment 569e8710-894d-4819-8d94-325a073ed592, production environment, direct-upload primary branch preview, clean commit 8e4839d. Prior stable rollback point f084c17c-4f93-4707-8126-9fd5b1609235. Both deployment environments inspected: matched existing D1 and binding names; no configuration changes.

Candidate: all 17 listing-emitted residential detail routes return 200 and have shared hero/action order. 12 representative width/page combinations (1440, 768, 390; Flushing, E83, E110, Sarasota) pass image loading, dominant dimensions, object-fit, no horizontal overflow, action order, visible keyboard focus and keyboard gallery navigation without URL changes. Desktop/tablet/mobile screenshots visually reviewed for architectural and interior crops. Images use existing approved source resolution; no replacement imagery introduced.

Stable verification recorded separately in /tmp/residential-hero-stable-qa.json and /tmp/residential-hero-regression.log. Stable cover remains first after five seconds and refresh, map/directions address hrefs match Flushing address, listing image still navigates to detail, existing Admin/Tenant sessions return 200. No fresh OTP, email send, data write, main merge or public company-domain production rollout performed.

Evidence: /tmp/residential-hero-{candidate,stable}-qa.json, /tmp/residential-hero-*.png, /tmp/residential-hero-build.log, /tmp/residential-hero-tests.log.
