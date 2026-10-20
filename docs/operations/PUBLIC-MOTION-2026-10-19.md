# Public page motion and continuous property rail

Jeffrey requested tasteful modern effects throughout the public website and continuous motion for the 17-property homepage carousel.

Application `526470f` adds progressive-enhancement heading reveals via native IntersectionObserver/Web Animations, scoped to pages with the public Header. Content remains visible with JavaScript unavailable; no added libraries. Existing photo hovers, card feedback and accordion transitions are retained, with refined public navigation, focus and About story-card treatment. Photos, maps, videos, form behavior, media assignments and daily rotation are unchanged. Private Admin/resident surfaces are excluded.

The city rail moves at 28 CSS pixels/second only while visible, with a repeated visual set for seamless wrapping; the second set is omitted from keyboard and screen-reader navigation. Hover/focus pauses temporarily. Touch, wheel and previous/next actions pause autoplay until Play is selected. Pause/Play is explicit; reduced-motion disables autoplay and preserves manual navigation. Background tabs do not accumulate motion. No announcements occur on every automated card change.

Code-only recovery: retain Pages `6e794dc5-7d9f-4b46-86b4-7a39abe0a9dd` with runtime `teams-city-rail-20261019`, version `fefcd67b-6e61-43b5-9da1-68012a2d949e`; no database restore.

## Verification and preview release

- Typecheck and final OpenNext preview build passed. Candidate route sweep completed 49 route/viewport checks: 15 public pages at 390/768/1440 pixels plus one listing-derived Residential and one Retail detail at 390/1440. HTTP status, headings and overflow passed. The initial carousel assertion incorrectly counted decorative `aria-hidden` arrows as duplicate cards (51 versus 17); selector corrected to hidden links, and the complete interaction suite then passed without an application change.
- Candidate and canonical stable passed continuous glide, hover pause, explicit Pause/Play, wrap at the repeat boundary, reduced-motion stop and manual Next. Separate candidate/stable checks passed keyboard-focus pause, live reduced-motion cancellation, mobile navigation/Escape, refresh, release fingerprint and visible content with JavaScript disabled. Stable repeated 10 representative route/viewport checks and observed no page exceptions. Mobile/tablet/desktop screenshots were inspected; physical devices were not tested. Forms, auth and live sends were not changed or exercised.
- New private runtime `teams-editorial-motion-20261019`, version `3b0c7c48-4473-41fd-abf3-0731eb3860b7`, served fingerprint `526470f-editorial-motion-20261019`.
- Candidate `https://6a77f03b.teams-management-preview.pages.dev`; stable Pages deployment `4e5283cc-6473-48fd-aeba-3b8d5b96750e`, `https://4e5283cc.teams-management-preview.pages.dev`, primary branch `preview`, application SHA `526470f`. Canonical `https://teams-management-preview.pages.dev` verified. Selective service binding updates preserved existing environment values and D1 bindings; secrets were not rewritten.
- Client production/main/DNS remain unchanged. Recovery uses the gateway/runtime pair above; this code-only change needs no database restore.
