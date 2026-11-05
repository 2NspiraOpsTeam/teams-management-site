# Tenant / apartment workflow — 5 November 2026

## Scope and source

Jeffrey paused TrueListing and requested clearer support for multiple occupants in a building/apartment, an unused-test-tenant delete control, and assignment without leaving Add Tenant.

Base: `release/production-preparation-20261101` at `5ae5f357ab180a2d9c493e0111439bbce8e6a7aa`. Feature branch: `feature/unit-occupants-20261105`.

## Findings and implementation

- The authoritative graph already supports many people per apartment. Tenant creation previously ignored building/apartment input; staff had to open the saved tenant and use a separate assignment form. Apartment-directory associations were loaded but not rendered.
- Add Tenant now offers building, dependent apartment, occupant role and optional move-in date. Assign later remains available. A building selection requires an apartment; changing buildings clears the previous selection. Loading, empty and retry states are explicit.
- The tenant, contacts, residence assignment, role, mutation receipt and audit entries commit in one batch. Building/apartment matching and non-archived status are rechecked in the transaction. Failed writes leave no half-created tenant; retries are fingerprinted and idempotent.
- New people remain directory-only: no login activation, notification, lease creation or permission changes. The existing three-enabled-portal-user rule is unchanged and is not a directory occupancy cap. Four directory occupants are verified in one apartment.
- Apartments now show linked occupants with current/historical/proposed and portal states. Tenant columns distinguish residence from portal access. Buildings distinguish occupied-apartment counts from current-occupant counts.
- Tenant details include Delete tenant record. Deletion requires the exact name and explicit confirmation, rejects enabled accounts and any login/lease/request/document history, and uses foreign-key restrictions to protect imports and raced dependencies. A revision guard protects against stale edits. Deletion removes only this person's unused contacts/residence links/profile/account, preserving the apartment, building, other occupants and full audit snapshot. Repeated confirmed deletion is idempotent.
- No migrations, credentials, mail, real tenant edits or production resource changes.

## Local verification

- Clean `npm ci` from the committed lockfile.
- `npm test`: 566 tests / 65 suites passed, including combined creation, four occupants, invalid/partial/mismatched/archived selection, transaction failure/retry, assign later, unchanged existing-edit behavior, confirmation/auth/origin/stale deletion, protected login/lease history, deletion audit failure and racing dependencies.
- `npm run typecheck`: passed.
- Recovery Python suite: 6 passed. Integrity Python suite: 7 passed.
- Full npm, production-only npm and pnpm 11.14.0 audits: no known vulnerabilities.
- `npm run build:preview:worker`: passed; 1,466 checksum-verified photo variants staged and artifact gate passed. Initial build with a cross-worktree node_modules symlink failed resolution; a clean local install resolved it. No build configuration workaround or dependency change.
- Actual RecordEditor, DeleteTenant and Directory JSX plus compiled stylesheet rendered using a local synthetic API harness at 1440, 768 and 390 pixels. Valid/invalid/partial/clear, assign later, changing building, apartment loading/empty/server failure/retry, save error/draft retention, same-receipt retry/double-click, cancel confirmation, refresh reset, delete name confirmation/cancel/focus/error/retry/double-click, and four linked occupant links passed. No page exceptions or viewport overflow. Nine WCAG A/AA axe scans passed. Screenshots inspected. Cancellation initially failed to restore focus to the remounted trigger; fixed and reverified.
- Database verification uses the actual application handler with isolated SQLite schemas and enforced foreign keys. Browser response mocks are not an authenticated database round trip.

## Release boundaries

Local production-target Worker artifact verified. Hosted preview, authenticated hosted save/delete/refresh and production behavior are **not verified**. PR is for review, not automatic publication. Repository AGENTS requires concrete owner approval for production release. Before any approved release, inspect actual production bindings/schema, checkpoint/rollback state, run the configured production build and verify the resulting live identifier and affected rendered routes. Do not delete Jeffrey's test record on his behalf.

Private synthetic screenshots, scripts and logs are outside Git. Source diff contains only the intended UI, handler/mutations, tests and this review record; no dependency/configuration/media changes.
