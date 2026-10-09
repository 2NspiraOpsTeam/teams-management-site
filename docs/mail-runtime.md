# Teams mail runtime

The Cloudflare Pages application sends mail through `MailService` and the Gmail API. No agent-local configuration is needed after the Pages environment is configured. OTP and inquiry messages use the same server-side provider; application confirmations can be added as a separate, approved template when that workflow exists.

Configure each Pages environment independently. Store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` as encrypted Cloudflare secrets. The refresh grant must belong to the intended Workspace sender and include Gmail send permission. Never place these values in Git or client-visible variables.

Set non-secret runtime variables `MAIL_PROVIDER=gmail` and `ADMIN_AUTH_FROM` to a verified Gmail send-as identity. `ADMIN_AUTH_REPLY_TO` is optional. Inquiry notifications also require `INQUIRY_NOTIFICATION_EMAIL` and a verified `INQUIRY_FROM_EMAIL`. Do not set `Admin@TeamsManagement.com` until its send-as authorization is verified for the connected account. A different approved sender may be used, but must be reported and verified first.

The current Teams preview has only `ADMIN_OTP_PEPPER` set as a production-environment secret. It has no Google mail secrets or verified sender binding, so OTP requests fail closed. The separate Pages preview environment has no secrets listed. Existing OAuth tokens in the local Google CLI failed refresh and are not application runtime credentials. No credential values were inspected or copied.

Once configured, verify a real OTP delivery and sender header, then valid/reused/invalid/expired codes, limits, logout/revocation, unauthorized identity, and the Admin media workflow before treating the integration as ready.
