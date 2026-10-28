# Teams preview Admin authentication

The Teams preview uses app-native email one-time codes. Cloudflare Zero Trust is not required. `/access` is the sign-in page; anonymous `/admin` redirects there and anonymous `/api/admin/*` remains inaccessible. Every Admin page and API validates a D1-backed, revocable session against the active `admin_identities` allowlist. The cookie contains only an opaque random session token; D1 stores its hash. State-changing Admin APIs check same-origin requests.

The additive schema is in `src/lib/migrations/admin-phase1.sql` and `src/lib/migrations/admin-otp.sql`. The latter was applied to `teams-database-dev` on 2026-10-09. Only `jcortez@2nspira.com` was observed active in that preview database. Do not seed other identities without authorization.

Email OTP delivery requires these **server-side Cloudflare Pages production-environment secrets** on the existing `teams-management-preview` project:

- `RESEND_API_KEY`: a working Resend key for this app.
- `ADMIN_LOGIN_FROM_EMAIL`: a sender on a verified domain authorized for that key.
- `ADMIN_OTP_PEPPER`: a cryptographically random secret of at least 32 characters; configured on 2026-10-09.

No key or sender was configured when this revision deployed. Until both are present, sign-in requests fail closed with HTTP 503 and no code is issued. Never put the key in client code. The inquiry notification path remains separate from authentication. Once delivery is configured, complete authenticated OTP, Admin, upload, and logout QA before treating PR #1 as merge-ready.

Codes expire after 10 minutes, are single-use, are HMAC-hashed in D1, have five verification attempts, and have per-recipient and per-network request limits. New codes invalidate previous ones. Sessions expire after eight hours and are revoked on logout. Rental-application document uploads remain disabled.
