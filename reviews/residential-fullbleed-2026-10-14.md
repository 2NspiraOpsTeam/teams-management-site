# Residential full-bleed gallery and autoplay

Supersedes the stationary, constrained hero in residential-image-led-standard: Jeffrey requested screen-edge-to-screen-edge imagery and automatic four-second rotation. Source commit 2110fd0. Shared residential template now places hero outside all padded/max-width containers; title, action row, thumbnails, captions and secondary content retain readable gutters. Hero has no perimeter border. Existing approved images and cover-first order preserved; no media or D1 edits.

Hero now uses existing 4000ms slideshow timer. Manual arrows/thumbnails remain independent. Pause/Play provided; pointer hover and keyboard focus pause rotation; reduced-motion preference disables automatic rotation. Single-image/empty galleries create no timer. Refresh returns to approved cover.

Typecheck, 59 tests, Pages build and whitespace checks passed. Candidate https://5f46a372.teams-management-preview.pages.dev: all 17 listing-emitted residential pages passed; 12 responsive combinations at 1440/768/390 passed exact image x=0 and viewport width, image loading/object-cover, action ordering, keyboard arrows/focus and no overflow. Desktop Flushing, mobile Flushing and tablet Sarasota screenshots visually reviewed. Separate normal-motion browser test verified unchanged before interval, advance after four seconds, hover pause, manual pause/play, reduced motion and refresh.

Stable direct upload: https://11d4148b.teams-management-preview.pages.dev, branch preview, source 2110fd0. Previous stable rollback point https://569e8710.teams-management-preview.pages.dev. Public company domain and main branch unchanged; no configuration changes, paid operations, data writes or communications.

Evidence: /tmp/fullbleed-{candidate,stable}.json, /tmp/autoplay-{candidate,stable}.log, /tmp/residential-fullbleed-{build,tests,stable-deploy}.log.

Stable verification: all 17 routes and all 12 responsive combinations passed after deployment propagation. Initial immediate stable check briefly encountered prior constrained layout; repeat after confirming new HTML passed. Stable normal-motion autoplay/pause/play/reduced-motion/refresh test passed. No application page errors.
