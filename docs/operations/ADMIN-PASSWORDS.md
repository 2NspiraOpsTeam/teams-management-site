# Optional admin passwords

Everyone continues to use `/tenant/login`. **Email code** stays the default for
residents and staff. **Admin password** signs in only an existing active
`admin_identities` account with a saved credential; it never provisions or
upgrades a tenant. `/admin-login` redirects to this same shared page.

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
share a separate 10-attempt/15-minute per-email and per-network throttle; OTP
counters and provider configuration are unchanged. Same-origin JSON, bounded
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
