# Branded sign-in email — Waterbear

Admin and tenant sign-in messages share an email-safe HTML template using the approved Teams Management PNG, warm ivory, charcoal and gold, role-specific copy, canonical portal links, a copyable eight-digit code, and existing ten-minute/single-use guidance. Company name remains readable when images are blocked. Plain text remains equivalent.

Gmail sends multipart/alternative (plain first, HTML second), base64 UTF-8 parts wrapped to 76 columns with CRLF boundaries. Sender, Admin Reply-To, OAuth credentials, authentication policy and portal permissions are unchanged. No new provider/dependency.

## Call-site scope

- Admin session API → `sendAdminOtp` → shared template → Gmail.
- Tenant session API → `sendTenantOtp` → shared template → Gmail.
- Tenant invitation, inquiry notification and work-order notification still use their original plain-text behavior. Application confirmations remain disabled. Household approval sends no mail.

## Verification

218 application tests across 29 suites; TypeScript and OpenNext build. Mocked actual Gmail raw payload decoded for both roles, canonical links, logo, expiry, single-use guidance, Admin Reply-To, invalid code rejection and unchanged inquiry plain-text behavior. No real email sent.

Six synthetic browser previews at 390, 768 and 1440 pixels passed logo decode and overflow checks; mobile tenant and desktop Admin screenshots visually inspected. These are browser checks, not Gmail/Outlook inbox rendering or real emailed-code acceptance.

Pre-release private checkpoint restored all 63 tables/schema exactly with integrity OK and no foreign-key violations. This code-only change requires no database writes or migration. Waterbear only; 2Nspira production untouched.

## Released

Waterbear runtime `e5ca72e4-75b9-4c73-ae6e-dac91704e9b2` verified at 100% traffic, release header `branded-signin-email-20261018`. Live Admin/tenant login and logo returned 200; protected household page redirected to tenant login. Application commit `8bf5704`. Existing gateway, database and credentials preserved. Real Gmail/Outlook inbox acceptance remains unverified; no live sign-in email was requested.
