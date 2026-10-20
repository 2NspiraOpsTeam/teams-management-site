# Across the city — larger cards

- Requested by Jeffrey: enlarge the home property carousel boxes.
- Application commit: `e4b0703`; three desktop cards instead of five, 60% tablet cards, 86vw mobile cards. Larger title/address type and padding. Existing continuous-motion behavior unchanged.
- Build: `npm run build:preview:worker` passed, including Next type validation.
- Candidate: https://1d95d79f.teams-management-preview.pages.dev (city-large-review).
- Stable gateway: https://3c6e4332.teams-management-preview.pages.dev; canonical https://teams-management-preview.pages.dev, primary branch `preview`, direct upload.
- Runtime: `teams-city-large-20261019`, version `50030e51-6114-4f21-8390-5dfc28c42ae7`, fingerprint `city-large-20261019`.
- Recovery pair retained: gateway `4e5283cc-6473-48fd-aeba-3b8d5b96750e`, runtime `teams-editorial-motion-20261019`. Restore both Pages bindings and matching gateway if needed; no previous runtime overwritten.
- Candidate browser QA: widths 390/768/1440, card widths 335/422/379px; 17 originals, no page overflow or browser errors, continuous movement, hover pause, reduced-motion manual navigation and refresh passed. Mobile/desktop screenshots visually reviewed.
- Stable browser QA repeated the same responsive and interaction checks successfully, with the intended release fingerprint.
- Client production unchanged. No data, mail or authentication changes.
