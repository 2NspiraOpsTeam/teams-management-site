# Admin usability, Rent Roll, Phone List and exports

## Scope

Uses the existing Teams D1 database, Admin authentication, operational relationships, and Cloudflare Pages/private Worker architecture. No paid service, new database, tenant import, outreach, or automatic activation.

## Implemented

- Grouped desktop navigation and compact mobile menu; consistent tenant subviews; filter persistence and return navigation; draft-discard confirmation.
- Property overview with apartment/occupant/maintenance/expiration counts, superintendent contact information, collapsible detailed lists, related-record navigation, and operational activity.
- Lease selector pagination, building-scoped tenant search, contextual entry, update/renewal history, and explicit verified-data guidance. Private PDF uploads remain disabled without approved private storage.
- Read-only live Rent Roll: one row per apartment, occupants and leaseholders separately, current/future/historical agreement status, rent/deposit only when recorded, superintendent, maintenance, missing-data filters, and overlap warning.
- Tenant Phone List: current by default; historical/all, property, missing-contact, search and sort filters; separate occupant rows, all phones/emails; clickable existing records; building/portfolio printing and CSV/Excel export.
- Secure bounded CSV and XLSX exports for Properties, Apartments, Tenants, Leases, Rent Roll, Phone List, Maintenance and Inquiries. Same-origin POST plus Admin authorization; explicit field allowlists; formula protection; leading-zero preservation in Excel; numeric recorded amounts; complete matching pagination up to 1,000 rows; audit events. Print preparation is also authenticated/audited, not a public download.
- Daily operational dashboard with filtered drill-downs; effective maintenance status used consistently across property/apartment/Rent Roll/dashboard counts.
- Optional confirmed first/last names on the existing tenant profile. No automatic splitting of imported names. Preferred contact now saves; directory contact edits remain separate from login identity and access.

## Data safety

A restricted full D1 export was restored locally and passed foreign-key checks before the scoped additive `tenant-directory-names.sql` migration. Only two nullable profile columns and the migration ledger entry were added. Post-migration comparison of all pre-existing columns across 59 tables found only the expected migration-ledger addition; every existing operational row was unchanged. The new name components are all unpopulated. Unrelated pending legacy migrations must not be bulk-applied. No shared synthetic sessions or operational fixtures are permitted.

The imported roster remains 69 assignments across six buildings: 68 current, one historical. Current occupancy is not inferred for the historical record. Held spreadsheet records remain on hold.

## Verification

Automated coverage includes shared graph preservation, idempotent/stale writes, lease changes in Rent Roll, phone contacts/current/historical/multiple occupants, CSV escaping/formula protection, real XLSX parsing, pagination and export budgets, authorization/origin denial, and effective-status count propagation.

Local rendered QA covers 1440/768/390px, directory return/refresh, lease edit/cancel/renewal/validation, superintendent propagation, maintenance/privacy regressions, all 69 imported records, phone contact propagation, actual CSV/Excel downloads, controlled server-error/retry, mobile navigation, and building/portfolio print reports. Print reports are exercised through browser print CSS and generated multi-page Letter-landscape PDFs; this is not a physical-printer test.

Hosted authenticated QA and stable promotion remain release gates until independently verified. Do not equate local session fixtures, anonymous hosted denial, or deployment success with authenticated hosted workflows. Use only normal Admin sign-in; never bypass authentication. Real lease/superintendent population requires verified management information.

## Staff documentation

See `docs/ADMIN-STAFF-GUIDE.md` for normal workflows, print/export behavior, missing-data handling, and current limitations.
