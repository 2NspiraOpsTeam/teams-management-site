# Optional lease sharing links

## Current Admin workflow (29 October 2026)

Lease information can be saved without a document. Paste an optional HTTPS lease sharing URL when adding an agreement or on its detail page. Document labels and links do not need a `.pdf` suffix; secure links are accepted regardless of provider or file/folder pattern. Embedded credentials and non-HTTPS schemes are rejected. Existing Google Drive file identities retain canonical normalization and resource keys.

At the owner's request, instructions now say **Share → Anyone with the link → Can view → Copy link** for future sharing with tenants. The review checkbox asks staff to verify the apartment, lease period and view access. This is a human review, not provider permission verification. The portal does not change OneDrive/Drive permissions or automatically publish links to tenants. Admin authentication, same-origin write checks and private/no-store responses remain unchanged.

Use **Open link** to check the URL in a new tab without saving. **Clear** clears the unsaved draft. **Remove link** next to a saved link asks for confirmation, removes only that lease/link metadata association, and atomically records an audit event without the URL. It does not delete the original file or lease. Repeat removal is a safe no-op; failed removal retains the displayed link for retry. The direct PDF upload controls and unavailable-storage notices have been removed; existing backend document storage is not deleted.

## Storage and verification

Reuses `operations_lease_links`; no schema migration, paid storage, provider API call, OAuth or file upload is introduced. Save batches metadata and audit atomically, with lease-scoped duplicate detection and safe retry. Removal uses an authenticated same-origin DELETE route scoped to both lease and link ID.

Regression tests cover normalization, unsafe inputs, metadata/audit, duplicate save, selected-link removal, missing-link retries and SQLite transaction rollback. Responsive fixture-browser QA covers removed upload UI, sharing instructions, removal cancel/error/retry/success and refresh. Hosted checks and real provider access must be reported separately from fixture-browser and local database results.

Lease start is optional on both create and edit. An unknown start is stored as an empty string in the existing non-null text column (no invented date or schema migration), displayed as not supplied, and can be filled later. Supplied dates remain validated; expiration and rent remain required. Active/expiring status and expiration continue to determine whether an undated-start agreement is current. Renewal expiration must still extend the previous agreement.
