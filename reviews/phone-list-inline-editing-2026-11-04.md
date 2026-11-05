# Phone List inline contact editing

## Request and scope

Make the Phone List a quick way to add/change tenant phone numbers and directory
email addresses without opening the tenant record or entering an edit mode.

- Existing and missing contacts render as directly editable inputs.
- Multiple contacts remain separate records; labels and punctuation are retained.
- Save/Cancel are per phone/email cell. Enter saves and Escape cancels; Tab moves
  between fields. Saving holds inputs read-only, not disabled, to preserve focus.
- Adding another number/email does not change the tenant identity or assignment.
- A blank value removes that contact only when Save is pressed. The existing
  mutation archives removed contacts and records the audited change.
- Unsaved edits block filters, pagination, refresh, export and print controls.
  Background refresh pauses and pending reads abort while drafts are present.
  Browser unload and clicked navigation links warn before discarding drafts.
- Errors retain drafts. Save has a synchronous submission lock; concurrent
  changes are detected before merging and by the existing transactional revisions.

## Contract

The authenticated Phone List response adds a structured `contacts_json` field;
the displayed/printed/exported `phones` and `emails` fields are unchanged.

`PATCH /api/admin/operations/tenants/:id/contacts` accepts only `revision` and
`contacts`. It shares existing admin, feature-flag and same-origin authorization,
contact validation, atomic revision checks, archival and audit behavior. The
contact-only mutation does not update names, preferences, notes, directory status,
login email, portal access or assignments. A legacy profile phone is retained
when an email edit first materializes structured contacts. No schema migration.

The editor reads fresh tenant details before saving, checks the edited contact
type against its original snapshot, preserves the other type's latest values,
and uses current revisions. This supports edits to both cells without false
conflicts caused solely by the first save advancing contact revisions. It does
not split combined raw values or change existing contact-validation policy.

## Verification

- 555 tests / 65 suites passed, including actual handler/SQL mutation round trips,
  preservation of unrelated fields, legacy-phone retention, archive/audit behavior,
  stale retries, foreign-origin requests and anonymous denial.
- Typecheck and production-flags Next build passed.
- Actual PhoneList component rendered locally with compiled application CSS,
  synthetic API fixtures and lightweight Next navigation adapters at 1440, 768
  and 390 pixels. Save, multiple drafts, double submission, Save/Cancel, Enter,
  Escape, Tab, retained save focus, clear/add, reload persistence, failure/retry,
  stale-snapshot conflict, navigation decline, loading/empty/error states, and
  page-width bounds passed. No page exceptions.
- Three axe scans of the edited state passed with no detected WCAG-tagged
  violations. This is scoped automated evidence, not full WCAG certification.
- Desktop/tablet/mobile screenshots visually inspected; narrow tables scroll
  inside their region rather than overflowing the document.

## Publication boundary

Prepared from production release `0adcc65a518828e03167f4ca873db59405e61d5c`.
No production data, credentials, resources or public-site assets changed.
Hosted preview, real authenticated browser round trips and production deployment
are **not verified** for this change. Obtain explicit owner approval for this
concrete production release under the repository operating instructions; then
perform the normal immutable-candidate and production verification gates.
