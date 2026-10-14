# Teams mail runtime

The Cloudflare Pages application sends mail through `MailService` and the Gmail API. No agent-local configuration is needed after the Pages environment is configured. OTP and inquiry messages use the same server-side provider; application confirmations can be added as a separate, approved template when that workflow exists.

Configure each Pages environment independently. Store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` as encrypted Cloudflare secrets. The refresh grant must belong to the intended Workspace sender and include Gmail send permission. Never place these values in Git or client-visible variables.

Set non-secret runtime variable `MAIL_PROVIDER=gmail` and `ADMIN_AUTH_FROM`/`TENANT_AUTH_FROM` to verified Gmail send-as identities. `ADMIN_AUTH_REPLY_TO` is optional.

## Inquiry routing and QA

Centralized, server-only runtime variables:

- `INQUIRY_FROM`: authorized sender identity.
- `INQUIRY_NOTIFY_TO`: notification destination.
- `INQUIRY_QA_TO`: approved recipient for a bounded preview QA copy.
- `INQUIRY_QA_ID`: exact approved synthetic inquiry receipt UUID; only this receipt uses the QA subject and extra recipient. No public request field enables QA or changes routing. Remove this optional gate after QA, or leave it tied to the completed receipt (which is never resent).

The approved preview sender and destination are `jcortez@2nspira.com`; the approved QA copy recipient is `jeffrey.cortez06@gmail.com`. These are environment values, not inquiry-route constants. Do not switch routing to `Admin@TeamsManagement.com` until that address and sender authorization are confirmed and explicitly approved.

The designated QA fixture emits one Gmail message addressed to the configured notification destination and QA recipient with subject `[QA] Teams Management Website Inquiry Test`. It contains only the synthetic receipt ID and an Admin-review link instruction, never visitor name, message, phone, or other private content. Ordinary notifications use the standard subject and only `INQUIRY_NOTIFY_TO`.

D1 atomically commits inquiry, details, and pending notification before scheduling mail. Visitor success remains authoritative even if Gmail or scheduling fails. An atomic attempts=0 claim precedes the Gmail request. Browser retries and concurrent jobs cannot send twice. Explicit Gmail rejection is `failed`; ambiguous timeout/network delivery is `unknown` and is not blindly resent. Gmail acceptance records `sent` and its provider ID; this means provider acceptance, not independently proven recipient inbox delivery. No automatic pending backlog replay is enabled.

Inspect the actual Pages environment before configuration: this project uses branch `preview` as its Pages production-environment alias, but remains the existing preview-only hostname. Merge variables without removing OTP secrets, map keys, D1 bindings or compatibility flags. Do not infer mail readiness from configured secret names. Verify actual Gmail acceptance and sender headers; independent inbox receipt requires authorized mailbox-read access or recipient confirmation.
