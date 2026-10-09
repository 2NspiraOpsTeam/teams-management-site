# Rental application: gated implementation plan

Status: design only. The preview at `/rent-with-us/apply` remains an in-memory walkthrough. Do not add persistence, uploads, sensitive fields, consent capture, or submission until the security and legal decisions below are approved. Keep `src/config/rental-application-fields.ts` as the shared field definition; do not fork rules across web, PDF, Admin, and storage.

## Secure drafts

- Create a server-owned draft ID and an opaque, short-lived resume token bound to one applicant session. Store only a hash of the token; rotate it on resume. Require re-verification before access from another device. Do not use browser storage for draft content.
- Encrypt application values at the application layer with a managed KMS envelope key, in addition to database encryption. Separate keys and access policy by environment; rotate keys and record key version. Minimize plaintext lifetime in memory.
- Default to applicant-only read/write. Staff access is separate, role-based, and only after submission unless a documented support exception is approved. Enforce ownership on every read and write, not only in the UI.
- Set draft inactivity and absolute expiration, purge expired drafts and associated objects, and define a deletion/retention schedule before launch. Log only actor, draft ID, action, timestamp, and outcome—not field values or tokens.
- Resume at the last completed step after server-side ownership validation; show expiration and recovery states. Prevent concurrent stale writes with a version check. Never infer a saved draft from an unsaved preview answer.

## Removed typed identifiers

SSN, applicant date of birth, driver's-license number, and occupant date of birth are removed from the current application. Their keys remain only in the registry's historical record. Do not add typed controls, API acceptance, PDF output, or storage for them. Any future reconsideration requires a verified business/legal reason and a separate approved change; occupant date of birth is not automatically collected.

## Documents

- Require one Government-Issued Photo ID when secure uploads are enabled: driver's license, state ID, passport, or other valid government-issued photo identification. Accept only approved JPEG, PNG, or PDF formats after server-side content verification. This document is highly sensitive and private; the preview Documents step remains disabled.
- Use private object storage with random keys and application ownership metadata; never public object URLs. Generate short-lived, single-purpose upload/download grants only after authentication and server authorization.
- Never store document bytes in D1 blobs, email the document, or log its filename/content unnecessarily.
- Validate allowed type by content signature, extension, and size; cap count and total bytes. Quarantine uploads until asynchronous malware scan and file normalization pass. Block viewing/downloading while pending or failed; safely retry scanner failures.
- Restrict applicant uploads to their own draft; staff downloads to approved roles. Log metadata-only access and changes. Set object lifecycle expiration, legal hold rules, deletion handling, and backup retention before launch.

## Screening and consent

- Keep screening questions inactive until counsel approves exact wording, purpose, jurisdictional applicability, timing, and adverse-action workflow. Do not quietly reuse legacy PDF questions.
- Version each approved disclosure. Record the version and immutable rendered text/hash, applicant acknowledgment or signature evidence, UTC timestamp, authenticated session reference, and request metadata permitted by policy. Preserve an append-only audit trail and a generated PDF snapshot tied to the submitted version. Legal review must decide acceptable signature method and record-retention period.

## Submission transaction

1. Revalidate the entire shared schema on the server, plus property eligibility and conditional/repeatable rules. Ignore client claims about prior step completion.
2. Require a one-time idempotency key. Atomically create the application, snapshot the approved disclosure/schema versions, attach only scanned documents, assign a random non-sequential confirmation number, mark the draft submitted, and enqueue staff notification. A retry returns the same confirmation, never a duplicate application.
3. Show a confirmation page with only the confirmation number and next-step guidance. Email staff only that number and a secure authenticated Admin link; never applicant values, documents, or a PDF attachment.
4. Admin review changes status through a controlled workflow with role checks and audit events. Failed notification does not roll back the accepted application; retry it independently and visibly.

## Admin application review concept

`Applications` list → application summary → property → status → documents → secure details → notes → audit history.

- List view: confirmation number, applicant display name, property/unit, submitted date, status, and assigned reviewer. No raw identifiers, document previews, screening answers, or sensitive values.
- Once secure uploads are active, show only “Government Photo ID — Uploaded” for the identity-document status in summary/list views; only authorized application reviewers may open the file.
- Detail view: summary and property first; role-gated documents and secure details behind explicit access actions. Show scan state and disclosure version. Notes are staff-only, attributed, timestamped, and excluded from applicant exports.
- Statuses: submitted, in review, more information needed, decision pending, closed; exact decision labels and applicant messaging require business/legal approval. Record actor, timestamp, old/new status, and reason. Do not make email delivery the status source of truth.
- Search and exports must respect the same field-level permissions as detail views. Audit history is append-only and includes access to secure details, downloads, edits, and status changes without raw values.

## Approval decisions still open

**Security:** identity/resume verification method; KMS and key ownership; staff roles and reveal policy; draft/object/identifier retention and deletion; malware scanning service and failure policy; audit-log retention; incident and backup handling.

**Legal/business:** exact screening questions and when asked; disclosures and e-signature method; consent/PDF retention; jurisdictional rules and fees; status/decision workflow and applicant communications; whether previous rental-history address means landlord mailing address or rented property address; whether the legacy PDF must be revised for repeatable entries.

## Release gates

Before enabling collection: approved threat model and legal copy; isolated test environment; server authorization and idempotency tests; encryption/rotation and deletion proof; scanner failure tests; applicant isolation and staff-role tests; audit and analytics redaction verification; mobile/keyboard QA; generated-PDF field-by-field verification. Production submission remains off until these gates pass.
