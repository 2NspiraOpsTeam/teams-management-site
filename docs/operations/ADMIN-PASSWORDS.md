# Private email-first sign-in and optional passwords

Everyone enters `/tenant/login` through **Email address → Continue**. There is
no public role selector, password button, admin copy or query-string shortcut.
`/access` and `/admin-login` redirect to the neutral page. Legacy role-specific
session POST URLs delegate to the same shared handler rather than exposing a
second account-discovery surface.

The first unrecognized-browser request returns identical status, headers and
neutral copy for admin, tenant and unknown addresses. Account lookup and mail
sending run using Next `after`/Workers `waitUntil`, after that response. Provider
failures, account cooldowns and role-specific limits do not alter the public
request response. Shared atomic limits apply before account lookup: six requests
per email / thirty per IP per hour, one dispatch per email per minute (including
concurrent requests), ten verification attempts per email / fifty per IP per
15 minutes, plus the existing five guesses per code and ten-minute code expiry.
A suppressed request intentionally returns the same generic acknowledgement;
provider acceptance/inbox delivery must be diagnosed privately.

Successful code verification immediately creates the appropriate server session
and redirects to its portal. A password is never an additional step. Roles and
destinations are determined only on the server, not by caller input.

**Remember this browser for 30 days** is optional and unchecked by default. It is
shown neutrally during code entry for everyone, but only successful active-admin
verification issues a discovery credential. The credential is a random 256-bit
opaque token in a `__Host-` Secure/HttpOnly/SameSite=Strict cookie, with no Domain
and Path=/; only its SHA-256 hash, email, fixed expiry and revocation state are
stored in `admin_remembered_browsers`. It is not an authenticated session and is
never accepted by admin authorization. It is neither a local-storage flag nor a
self-asserted role. It only allows **Sign in with password / Send sign-in code**
following Continue for the same active identity with a saved password. Password
login itself requires that credential and rechecks it, active role and password
revision inside the session INSERT. An unrecognized, expired, revoked, tampered
or other-account token never reveals the options. Tokens do not renew on use.
**Forget this browser** revokes the current token on the server and clears its
cookie. Every password change/reset revokes all of the target's remembered
browsers, in the same transaction as the credential change and audit event.
After setting/changing a password, use a fresh code login with Remember checked
to opt in again. Disabling an identity makes its tokens unusable immediately.

Migration: apply only `remembered-browsers.sql` additively after backup, actual
schema/ledger inspection and populated restore rehearsal; do not bulk-apply
unrelated legacy migrations. Existing password prerequisites remain below.

In the Admin navigation, **Passwords** lets any active admin set/change their own
password or reset another active admin team member's password. This matches the
owner-approved peer-admin policy. No tenant password controls exist. First-time
setup/recovery uses an email-code login, then this page. Passwords must be 14–128
characters and are not trimmed. Password managers and long passphrases work.

Changes require the acting admin's current password or an email-code session
created in the preceding 15 minutes. The target's current password is never used
to authorize the actor. A reset revokes the target's existing sessions; a self
change preserves only the current session. Admins share a reset password privately;
the app sends no reset email and exposes no password/hash in its API or audit.
Email-code recovery remains available if an admin forgets their password.

## Persistence and security

Apply only `src/lib/migrations/admin-passwords.sql` after inspecting the actual
target schema/ledger and capturing a private backup. It adds `admin_passwords`
(email-keyed salted scrypt credentials and random revision) and
`admin_password_sessions` (method marker for step-up checks). It neither alters
existing identities/sessions nor enrolls accounts. The migration is idempotent;
legacy migration-directory pending entries are not authorization for bulk apply.
The local QA setup includes it.

Use built-in `node:crypto` scrypt (N=32768, r=8, p=3, random 32-byte salt,
32-byte result, 64 MiB maxmem), supported by the current Workers compatibility
date. Compare derived keys with `timingSafeEqual`, and do dummy derivation for
missing/inactive accounts. Password-login attempts and change authorizations
share a separate 10-attempt/15-minute per-email and per-network throttle; Existing role-specific OTP
counters and provider configuration are unchanged; the shared limits above also apply. Same-origin JSON, bounded
bodies, server-side active-account/session checks and no-store responses apply.
Session cookies match existing HttpOnly/Secure/SameSite=Strict behavior. Login
rechecks credential revision and active identity at the session write, preventing
a concurrent credential reset from issuing a stale session. Password/reset,
session revocation and credential-free audit event commit in one D1 batch.

No password is assigned to any real admin during release. An admin must complete
initial setup through a verified code session, or another authorized admin can
reset that account. Password hashes and database backups remain private.

## Verification

`tests/admin-password.test.ts` runs the actual handlers against isolated SQLite:
self setup, peer reset, persistence, method-specific step-up, revocation, login,
active role isolation, wrong passwords, throttles, origin/body guards, salted
hashing and atomic rollback. Keep hosted fresh-password QA, rendered shared-login
QA and actual email delivery separate; none proves the others. Use only labelled
synthetic accounts for release exercises and remove their credentials/sessions
and identities after verification. Never reset a real admin just to test.
