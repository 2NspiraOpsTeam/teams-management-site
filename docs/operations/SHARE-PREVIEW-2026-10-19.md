# Share preview retrieval fix

- Jeffrey reported Telegram still showing the superseded Premium Property Portfolio / Property Steward card.
- Root and Home metadata already contained the approved New York Property Management wording. Live cookie-persisting GET confirmed it, while cookie-free GET/HEAD repeatedly redirected to the same URL.
- Application `de5ae16` replaces the first-visit redirect with request-cookie forwarding and response cookies. First render receives the intended rotation index; subsequent visit behavior and admin denial remain intact. No user-agent bypass or new dependency.
- Typecheck, three focused regression tests, and OpenNext preview build passed.
- Review gateway: https://c7452507.teams-management-preview.pages.dev . Candidate required existing Cloudflare Access credentials; this is distinct from public crawler access.
- Stable gateway: `4f0c3609-0d10-4c24-8459-f1426df2d3dc`, primary branch `preview`, direct upload, Pages Production environment; canonical https://teams-management-preview.pages.dev . Both service bindings target private runtime `teams-share-preview-20261019`, version `c3c403c0-9445-4f34-b0d6-d77aa217599d`, release header `share-preview-20261019`.
- Candidate and stable: cookie-free TelegramBot, Facebook and Twitter user agents return 200 and updated OG metadata; HEAD returns 200. Preview noindex preserved, old wording absent. Canonical TelegramBot GET additionally verified without Access credentials or cookies.
- Candidate/stable rendered checks passed at 390/768/1440: 17 cards, larger sizing, continuous glide, hover pause, reduced motion/manual navigation, refresh, no overflow or page errors.
- Preserved recovery pair: gateway `3c6e4332-3620-415a-8661-03221dba0ad9`, runtime `teams-city-large-20261019`. Restore matching bindings/gateway, not the database.
- Telegram's already-posted card cache is outside this release; actual regenerated card appearance is not verified. A fresh `?share=20261019` URL is provided to request a new cache key.
- Client production, main, DNS, data, secrets, and authentication unchanged. No fresh OTP or live-send tests.
