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

## Resumed verification — 18 October, 17:12 Pacific

Resumed existing source without rebuilding or redeploying. Remote branch HEAD matched `e3669a8d380800d91a9ea8303216a739ecafe4a2`; implementation remains `8bf57049a823aeeb37adfe55ac7c9f83035df9a7`. Cloudflare deployment history confirms runtime `e5ca72e4-75b9-4c73-ae6e-dac91704e9b2` at 100% traffic. Stable Admin/Tenant login and public PNG return HTTP 200 with `branded-signin-email-20261018`. Waterbear account, D1 ID, sender, Google secret names, gateway RPC entrypoint and OTP pepper names match the existing contract; no configuration or secrets changed.

Re-ran all 218 tests in 29 suites and TypeScript successfully. Re-ran six existing synthetic responsive previews; logo decoded and no horizontal overflow at 390/768/1440 pixels. HTML/plain-text MIME tests pass. No template changes required.

One controlled request per role was made through the deployed Waterbear session API to previously documented owner QA destinations. Both returned 200, and a bounded read-only challenge-state check confirmed fresh unconsumed challenges, with no delivery-failure invalidation at that check. Generic API responses alone are not inbox receipts.

Admin: actual new message received in the approved Gmail inbox. Inspected the received HTML: Teams logo loaded through Google's image proxy, branding and prominent eight-digit code were present, expiry/single-use guidance readable, and CTA pointed to the Waterbear Admin portal. Visually inspected a private screenshot with the code redacted. Saved Gmail API read authorization was expired, but an existing authenticated browser session allowed this inbox check.

Tenant: deployed request completed without a reported delivery error. Independent receipt and Gmail inbox rendering remain unverified because the approved recipient mailbox is not authenticated in the available browser, and saved Gmail API authorization is expired. No blind resend. Recipient confirmation or authorized inbox access is needed to close this gate.

No new deployment, production promotion, provider, authentication infrastructure, secret overwrite, tenant-record change or schema change. Only normal sign-in challenge/throttle writes occurred. The existing Waterbear release predates this resumed verification; the 2Nspira-hosted preview remains untouched. Retain the inbox gate before any further promotion. Private sample previews and redacted received-message evidence remain outside Git.
