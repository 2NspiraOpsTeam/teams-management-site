# Login email history

Adds Admin → Login emails and a dashboard shortcut. Existing audit_log storage persists send intent for both OTP request routes before invoking Gmail, then records provider acceptance or unknown outcome. It stores metadata only, never code, body, or provider error payload. No migration, account activation change, sender change, or throttle change.

Provider acceptance is not inbox delivery or completed sign-in. Prior login-code rows do not establish sends and are not backfilled. Tracking starts when the code is deployed. Pending rows can represent unconfirmed outcomes after interruption or a failed final history write. Accepted sends still succeed if the final history update fails, avoiding an erroneous failure/retry prompt.

Admin-only, no-store API returns at most 50 items plus a next-page cursor. Portal filtering and rowid keyset pagination avoid offset growth. Manual refresh only; no polling or automatic resend.

Verification: Next build passed and includes both new routes; TypeScript passed; 13 targeted tests passed covering sender metadata, failure cases, authorization, result bounds, filter validation, no provider ID leakage, and existing Admin throttling. SQLite rehearsal checked portal filtering and nonoverlapping pages. Isolated rendered component with synthetic API checked 1440/768/390 widths, no horizontal overflow, portal filter, refresh, empty state, server failure/retry and reload. Screenshots/results are private outside Git. This is not hosted authentication/D1 integration proof. No real email sent, no deployment, production unchanged. Existing next lint command remains a previously documented independent issue.
