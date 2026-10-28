# Residential address overlay and slideshow correction

Requested: title/address over full-bleed imagery like Dining; repair automatic rotation.

- Reproduced stable hero stopping whenever hovered. Removed hero hover-pause; compact galleries retain it.
- Hero pauses for keyboard-visible focus, not mouse/touch focus left by control clicks.
- Title and canonical full address overlay the top of the hero with a dark readability gradient. Utility actions remain below.
- Four-second interval retained; explicit Pause/Play retained. Reduced motion defaults to stopped, with explicit Play opt-in.
- Typecheck, 59 tests, whitespace check and Pages build passed. Final keyboard-focus delta subsequently typechecked and rebuilt.
- Isolated local rendered component: desktop/tablet/mobile overlay, full-bleed width, no overflow; autoplay while hovered, pause/play, reduced-motion and explicit opt-in passed. Desktop/mobile screenshots visually reviewed.
- Candidate uploads reported success, but candidate domains returned Cloudflare Pages 404; candidate verification NOT VERIFIED. Project environment names/bindings inspected without changes. The tested artifact was published to the already-authorized stable preview, preserving rollback deployment 11d4148b-6161-400d-abe7-38e060a10623.
- Stable rendered QA: 17 residential routes 200 and title/address in hero; 12 route/viewport combinations at 1440/768/390 passed imagery, object-cover, keyboard controls, below-gallery actions, no overflow and no page errors. Stable screenshots reviewed.
- Stable autoplay: four-second change, continuous rotation while hovered, pause/play, reduced-motion default and explicit Play passed. Desktop and touch/mobile controls resume without a separate blur click.
- Existing Admin and QA Tenant sessions each returned 200. This is existing-session regression, not fresh OTP or inbox proof.
- Implementation commits: 4b80f83 and 9c77433. Stable deployment b8cfb4af (primary Pages branch preview). No public custom-domain production release, database or config changes.
