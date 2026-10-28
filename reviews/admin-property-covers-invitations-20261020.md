# Admin property covers and manual tenant invitations

## Changes
- Property directory thumbnails and overview cover use the existing Residential cover selection, or legacy property cover when no Residential settings exist. No gallery substitutions or media mutations.
- A single page-scoped media query enriches up to 50 displayed properties; authenticated Admin image delivery is reused. Missing/failed covers render a neutral fallback.
- Tenant Services access exposes Send/Resend invitation only for an enabled login identity with a current matching apartment assignment. The target login email is displayed and confirmed; contact-only email is never substituted.
- Invitations remain manual. Existing code-based login and account/assignment state are unchanged. In-flight UI locking and a server-side 60-second successful-send cooldown protect common retries. The cooldown is not a cross-request transactional mail queue.
- Failed delivery does not record a successful invitation or claim access changed. Invitation requests cannot combine account mutations.

## Verification
- TypeScript passed. Full suite: 381 tests across 49 files passed.
- Real components rendered with synthetic intercepted APIs, existing built CSS, and synthetic image: directory and overview at 390/768/1440 (6 checks); invitation panel eligible/missing-email/inactive/unassigned/resend/busy at all three widths (18 checks). Images decoded, no document overflow; eligible buttons clicked, blocked states disabled. Mobile screenshots visually inspected.
- Invitation route tests intercept delivery: success, identity target and same-host code-login URL, authorization/origin denial, eligibility denial, rapid resend, mixed action denial, provider unavailable and delivery failure. No real email sent.
- Preview build reproduced the existing OpenNext refusal of unsupported Next.js 15.5.28. No bypass flag used.

## Release state
Locally verified only. Not deployed; actual authenticated preview media, invitation delivery and tenant code sign-in remain unverified. Existing preview and production remain unchanged. Supported-framework remediation is required before release.
