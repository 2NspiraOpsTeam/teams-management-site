# Rent-roll source facts and lease renewal management

## Scope

Adds apartment-attached source metadata to the existing D1 operational graph, not another lease/tenant directory. Existing units, tenants, occupancy assignments, canonical leases, contacts and work orders retain their IDs. Private renewal tracking references existing lease IDs; settings reference no external service. No public APIs project these tables.

Workbook: 257 candidate rows across 14 properties; 243 match existing exact apartment IDs, including explicit parenthetical leading unit labels. Fourteen commercial mappings remain held (duplicate STORE labels, shared address, unnamed storefront and unresolved suites). Raw names remain unsplit. Original formulas are rejected in source-data fields; total formulas outside candidate rows are not imported.

A fresh complete remote D1 backup was restored to SQLite, cloned into a separate local D1 store, and reconciled before the scoped additive schema and source import. All 243 source inserts have per-row atomic audit via an AFTER INSERT trigger. A forced audit failure was exercised in actual local D1; no source row survived. Shared migration/import updates only source metadata/audits and the migration ledger, not operational facts. Twelve protected tables were fingerprinted before/after and match exactly.

## Features

- Main dashboard: confirmed renewal metrics, clickable 12-month forecast, separate source/missing-information review, internal follow-up count and configurable reminder thresholds.
- Rent Roll: preserves workbook tenant/status/square footage/bedrooms/expiration/security/legal rent/rent and period, exports alongside existing operational values, links to Renewals.
- Apartment details: source values kept distinct from confirmed profile and canonical agreements.
- Renewals: property/month/status/search/window/sort filters, URL-persisted state, current/all-history/review/month-to-month/missing/in-progress/completed/follow-up views, paginated lists, linked apartment/tenant/lease actions, revision-guarded tracking saves, staff assignment/contact/follow-up/notes.
- Associated renewal creation retains predecessor and historical holders, guards duplicate/racing successor creation, marks completion/audits atomically. Actual move-out updates through existing authorized assignment workflow.
- Staff-only CSV/XLSX and full-filter Letter-landscape monthly print reports; internal notes stay private.

## Calculation and security

See `docs/LEASE-RENEWAL-STAFF-GUIDE.md` for precise eligibility, reporting-period and timezone rules. Rolling windows overlap; calendar forecast counts each qualifying lease once. Source status codes and source dates do not assert a verified active agreement. Non-renewal tracking does not end occupancy. Counts change on the next underlying-record read, not via an unaudited materialized rent roll.

Every new API path uses existing Admin authorization, private/no-store responses and same-origin writes. Assignment access, email and existing portal document gates are unchanged. No outbound tenant communication or scheduling service is enabled.

## Verification

Automated tests cover source preservation, validated/leap dates, rolling/month boundaries, duplicate-free counts and drilldowns, historical/future/overlap exclusion, linked renewal history, move-outs, non-renewal tracking, stale saves, audit rollback, contact/follow-up clearing, settings, print/export equivalence and authorization/origin denial. Canonical OpenNext preview build and TypeScript checks are required for release.

Local D1/rendered evidence and deployment IDs are kept privately. Hosted authenticated QA remains a separate gate: anonymous protection or local synthetic sessions do not establish hosted staff access or fresh email login. Stable promotion requires authenticated candidate QA, followed by stable verification. Do not claim this release promoted merely because the source import succeeded or the isolated gateway is published.
