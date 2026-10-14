# Teams Management — Maintenance Work-Order MVP

## Release status

**Implemented and verified on the isolated review preview. Not yet promoted to the stable demo preview or released to public production.**

- Review: https://work-order-mvp-review.teams-management-preview.pages.dev
- Immutable tested deployment: https://6a5c8ee1.teams-management-preview.pages.dev
- Pages deployment: `6a5c8ee1-9a53-43f0-b72b-04e13891166e` (Pages Preview environment, direct upload).
- Implementation commit: `d33c2dd24463a92e844f4213a595d07524b5492f`.
- Source branch: `review/work-order-mvp-2026-10-14`.
- Stable preview remains the preceding verified demo release (`03e8354e-669b-4f20-b58b-e58e7a619889`). Public company production is unchanged.
- Remaining email gate: the deployed Gmail provider accepted all 10 QA notices, with one attempt and a provider ID for each. Human inbox confirmation of management notices and tenant confirmation/status emails is still pending. Provider acceptance is not inbox delivery proof.

## A. Existing-system audit and reuse

The existing platform already had email-OTP tenant/admin authentication, independent role sessions, active tenant/apartment authorization, D1 maintenance persistence, UUID retry receipts, audit logging, and primitive admin read/update APIs. The tenant form and history list worked but lacked details, references, photos, consent, timelines and notifications. There was no dedicated admin maintenance screen. Admin status and audit writes were separate, allowing inconsistent results on partial failure.

Reused rather than replaced:

- Existing tenant/admin authentication, approved identities and backend authorization.
- Existing tenant accounts, building/unit assignments, request table and UUID identifiers.
- D1, Gmail transport, Teams typography/colors/navigation and styling.
- Existing image dimension parser and image-resizing helper; its prior default upload limit remains unchanged for existing consumers.

Existing tools/libraries were sufficient. No new dependency, paid service, SMS provider, object-storage activation, translation or dispatch integration was introduced.

## B. Features completed

### Tenant experience

- Navigation: **My Apartment | Maintenance Requests | Contact Management**.
- Prominent Submit New Request; paginated previous requests with unique numeric reference, submitted/updated dates, category, short description and clear status.
- Account email/name and authorized building/apartment populated from the authenticated account; browser-supplied tenant identity is not trusted.
- All eight requested maintenance categories and a helpful description prompt.
- Optional multiple JPEG/PNG/WebP photos with previews/removal and automatic resizing of normal phone photos.
- Explicit Yes/No permission to enter, preferred contact and optional access instructions. Notice/access obligations remain explicit.
- Emergency notice does not invent a property emergency number; it directs tenants to their designated lease/building contact and appropriate emergency services.
- Success and reference shown only after atomic database persistence. Failed saves retain the draft for retry.
- Request details, original description/photos, chronological status and public updates, completion date, and retained closed history.
- Follow-up text and additional photos on an existing non-closed request, with independent retry receipts.
- Status labels: Submitted, Under Review, In Progress, Completed, Closed. Legacy database values remain compatible and are never shown as confusing tenant labels.
- First-click readiness protection: the new-request button remains disabled until its client behavior is hydrated.

### Admin experience

- Dedicated Maintenance navigation and centralized dashboard.
- Building/apartment/status filters, exact work-order-number search and pagination.
- Tenant/account details, original request, private photos, consent/access instructions and complete activity history.
- Status changes, tenant-visible updates and append-only private internal notes.
- Every management mutation is timestamped and attributed to the authenticated administrator. Internal notes never enter tenant JSON/UI.
- Optimistic revisions reject stale edits; status, activity, notifications and audit are committed atomically.
- Clear save/error feedback and outbox visibility. Pending/known-failed deliveries may be deliberately retried; ambiguous/sending outcomes require provider review, not blind resend.

### Notifications and integrity

- Submission queues office and tenant notices atomically with the saved request.
- Tenant follow-up queues an office notice; status/public management updates queue tenant notices. Internal-only notes do not send email.
- Shared module delivery boundary reuses Gmail. Sender uses `WORK_ORDER_FROM` or existing `TENANT_AUTH_FROM`; office destination uses `WORK_ORDER_NOTIFY_TO` or existing `INQUIRY_NOTIFY_TO`.
- No request body may choose a recipient. Notices contain references, not descriptions/photos/access instructions.
- Outbox stores attempt timestamps, provider IDs and safe failure categories. Provider/network failure cannot undo a saved request.
- Labeled QA accounts produce explicit QA/no-action-required emails.
- Bounded input, validated image type/dimensions/size, active-assignment write authorization, private no-store/nosniff photo routes and receipt/revision guards.

## Bugs corrected

- Missing references, detail/history routes, consent, photos and notifications.
- Missing dedicated office workflow and usable filters.
- Non-atomic admin status/audit writes.
- Potential lost updates or duplicate administrative actions during concurrent edits/retries.
- Completion dates now clear when a request is reopened while its historical completed event remains intact.
- First click could be lost before hydration on the deployed page: reproduced and fixed; JavaScript-disabled/loading and first-click behavior verified separately.
- Avoided costly per-byte callback allocations while decoding private photos; reused the existing validated image parser.

## C. Database readiness and preservation

Scoped additive migration: `src/lib/migrations/work-orders-mvp.sql`.

Four companion tables: `work_order_details`, `work_order_events`, `work_order_photos`, `work_order_notifications`; supporting indexes and one request-creation compatibility trigger. Existing request table/status CHECK/UUIDs are unchanged. The trigger gives submissions from the preceding release a reference and initial timeline during rollout/code rollback.

- A restricted full database export was imported into disposable SQLite; integrity, foreign keys, backfill and exact preservation checked before application.
- The remote migration was scoped to this file and its ledger/audit record; unrelated legacy scripts were not bulk-applied. The pre-existing ledger was empty despite existing platform tables; no attempt was made to replay those schemas.
- All **four original request rows remain identical**, including after live QA.
- Protected counts unchanged: **2 tenants, 3 assignments, 20 buildings, 244 units, 205 media assets**.
- Exactly **two labeled QA work orders (#5 and #6)** were added, tested and closed; not deleted. Three private issue photos total **1,166,530 bytes**.
- Foreign-key checks remain clean. Migration and live admin/tenant changes are auditable.
- Legacy history imports only evidenced submission and known current status facts. Unrecorded intermediate transitions are explicitly not invented.

Future assignments, dispatch responses, localized text, escalation/reporting and satisfaction data can attach through companion records keyed to the existing request UUID/event IDs. Authentication and transport remain separate. No speculative SMS/dispatch tables or workflows were implemented.

## D. QA performed and results

### Local verification — passed

- Typecheck, Pages preview build and whitespace checks.
- **73 automated tests**, including real SQLite persistence/atomicity and stubbed mail: OTP single use/expiry/revocation, role separation, tenant isolation, save/retry receipts, multiple photos, validation, status lifecycle, private notes, failed audit/save rollback, outbox rejection/retry safety, pagination and compatibility-trigger behavior.
- Separate local tenant/admin/other-tenant browser sessions at **1440, 768 and 390 pixels**: request creation, photo previews/removal, follow-up, management updates, persistence after refresh and account isolation.
- Six local tenant/admin responsive/accessibility checks had no overflow, browser errors or automated WCAG A/AA violations.
- A synthetic **7.4 MB phone-sized image** was automatically prepared; Cancel cleared the draft/photos.
- Mail was deliberately not configured for local browser tests; error/retry behavior was tested in the database-backed suite.

### Deployed review verification — passed

- Fresh tenant and admin email codes were actually received and supplied by the owner, consumed successfully and not saved in source/reports. Protected sessions and role separation verified; both consumed codes were rejected on reuse, real cookies were Secure/HttpOnly/SameSite=Strict, and foreign-origin tenant/admin writes were denied.
- **Two actual QA requests saved** through the rendered UI: desktop without photos; mobile with two automatically resized phone-sized photos. Refresh preserved records/photos.
- One actual tenant follow-up with an additional photo; office review, public update and private notes.
- Complete Submitted → Under Review → In Progress → Completed → Closed timeline; completion date and closed records remain accessible.
- Live cross-tenant request read denied; anonymous photo read denied; authorized tenant/admin photo reads passed. Other-tenant photo denial also passed in local backend/browser QA.
- An actual submission retry returned the existing record; no duplicate request/notice. Internal-only note produced no additional notification.
- **Six live responsive/accessibility views** at desktop/tablet/mobile: no overflow, automated WCAG A/AA violations or browser errors; rendered screenshots inspected.
- **27 additional public/tenant responsive views** across nine relevant routes: HTTP 200, no overflow/browser errors. This is targeted module regression, not a rerun of every historical public-site test.
- Outbox/D1 proof: **3 management + 7 tenant notices**, all `sent`, exactly one attempt and nonempty provider ID each. **Actual inbox receipt of these work-order notices remains pending human confirmation.** Fresh OTP inbox receipt is separately confirmed.
- Both new QA work orders are closed, explicitly no-action-required and retained for audit/history. No real tenant request was modified.

## E. Remaining limitations and production setup

1. Confirm actual management and tenant work-order inbox receipts before stable promotion/readiness signoff. Do not infer this from Gmail acceptance.
2. Preview office routing currently reuses the configured QA notification mailbox. The owner must designate the real production management recipient before public rollout. No environment values were changed.
3. Approved property-specific emergency contacts have not been supplied/stored in the inspected tenant data. The safe lease/building-notice guidance remains; no number is invented. Direct per-property display requires those approved facts.
4. Photo storage uses bounded private D1 records to stay within the existing $0 setup: up to four photos per submission, 650 KB each after resizing, twelve per request; supported dimensions up to 12000 pixels per side. Review storage capacity/retention before broader rollout. No paid storage has been enabled.
5. Existing account data supplies the tenant display name when present; missing names are not invented. Phone preference relies on the number supplied in access instructions/management records; verified account email remains available.
6. No SMS login, superintendent dispatch, translation, contractor management, analytics, or satisfaction workflow is included. These are future phases, not unfinished MVP features.
7. Automated accessibility checks and rendered browser QA are not a full assistive-technology/user study. A broad public production launch, platform/runtime migration and unrelated readiness findings remain outside this module release.

Recommended next phases: approved operational contacts and storage/retention review first; then assignment/superintendent transport through the shared notification/event boundaries, followed by translation and operational reporting only when authorized. No new paid service is recommended for activation in this release.
