# Optional Google Drive lease PDF links

The Admin lease detail now offers the same paste-a-Drive-file-link pattern used for property videos. PDFs remain optional; saving lease information never requires a document. OneDrive remains available under Other option.

## Privacy and scope

Unlike public video tours, lease files must stay Restricted in Google Drive. The Admin opens the file and confirms the PDF, apartment, lease period and restricted sharing before saving. This is an explicit human check, not a Google API permission or MIME-type verification. No OAuth/app registration, Drive API, sharing changes, file downloads, uploads or paid storage are introduced. Existing Drive storage and hosting/database quotas still apply.

Links are Admin-only. No tenant endpoint, tenant grant or publication behavior changes. Tenant viewing remains separate work requiring verified lease associations and Google file permissions. Google sign-in can be required; file deletion or revoked access is resolved with the file owner. Never make lease PDFs public to imitate video playback.

## Storage and release

Reuses `operations_lease_links` from `lease-onedrive-links.sql`: `drive_id='google-drive'` namespaces Google references and `item_id` is the Drive file ID. No additional schema migration is introduced. Existing tables are not renamed or rebuilt. Runtime requires that prior link table; inspect target schema and follow normal recovery/ledger gates before any application of its pending migration. No remote database changes were performed for local implementation.

Only HTTPS drive.google.com individual file URLs are allowed; folders, alternate hosts, credentials, fragments and unrecognized query parameters are rejected. Canonical links retain optional Drive resourcekey values, which may be necessary for access, but drop tracking `usp`. Metadata is served only through authenticated Admin routes with private/no-store responses. Same-origin writes use existing authorization. Save batches metadata and audit atomically, scopes duplicate detection to lease/provider/file, and retains the receipt when retrying a failed save. Audit excludes the URL/resource key. Google and Microsoft lists filter by provider so Google links are not mislabeled as OneDrive.

## Local verification

424 tests passed across 55 files, including normalization, restricted-sharing acknowledgement, unsafe-link rejection, metadata/audit contract and duplicate-save handling. Responsive rendered checks at 1440/768/390px used simulated APIs: empty/disabled states, clear, backend error retaining draft, same-receipt retry, double-click single write, refresh persistence and no horizontal overflow. This does not establish real Google access, hosted persistence, tenant isolation for Google documents or deployed availability. Verify hosted behavior using an approved QA PDF before client acceptance.
