# Property operations — implementation boundaries

Extends existing Admin, tenant identity/assignment tables, D1, Gmail and the canonical OpenNext runtime. No parallel app or duplicate maintenance database.

## Model

- Existing buildings/units/accounts/assignments remain authoritative stable identities. Companion profiles add operational fields without overwriting legacy schema or tenant emails.
- Unit identifiers are unique per property after trimming/case normalization. An existing unit cannot be moved to another property; create a distinct reviewed unit instead.
- Tenant assignments support multiple occupants in a unit and preserve old assignment IDs during moves. Reassignment is revision-guarded, audited atomically, and revokes that tenant's sessions. Rejoining a former unit reuses its stable assignment key (legacy uniqueness) and records a new audit event rather than rewriting the linked maintenance unit. Current assignment dates are a summary; prior changes remain in the audit history.
- Unassigned does NOT mean vacant. Vacancy needs an explicit confirmation; active assignments prevent a vacant flag. Occupancy counts omit labeled QA accounts. These are operational counts, not claims about publicly available rentals or accounting occupancy.
- Superintendent records have many property associations, active/inactive state, private contact fields and explicit per-property tenant-contact approval. Nothing is exposed publicly.
- Leases belong to one stable unit; many independently permissioned leaseholder/occupant associations, historical inactive associations, predecessor links and append-only audits. Renewals create NEW records; prior dates/rent/documents remain intact. No billing automation or automatic renewals.
- Maintenance views join existing request→assignment→unit→property. New companion workflow status distinguishes Scheduled/In Progress and Cancelled while preserving legacy request CHECK values: in_progress→scheduled, cancelled→closed. Old rows retain current In Progress semantics through a fallback projection. No request or event history is rebuilt. Staff/superintendent assignment creates private history/audit, not an automatic dispatch/email.

## Authorization

All operations APIs require the existing active Admin session, explicit feature enablement and same-origin writes. Current staff authority remains the existing Admin role; the single operations authorization boundary is the extension point for future property-manager/leasing/maintenance permission policies. New staff roles are NOT claimed to be implemented.

Tenant leases require: authenticated active account, active matched unit assignment, active lease association, explicit lease publication, enabled tenant-lease feature and functioning private backend. Private document downloads additionally require the per-leaseholder document permission. Rent is omitted unless individually approved. Contacts require explicit per-property approval. Staff notes, storage keys, unrelated leaseholders and management metadata are never returned by Tenant APIs.

## Private documents

D1 stores metadata/checksum only; never PDF bytes. No `/public` files or public object URLs. An optional private R2 binding implements the storage abstraction; no bucket/account/billing activation occurs in this implementation. Hosted uploads stay disabled without an approved backend. Local synthetic PDF tests may use Wrangler's local-only R2 simulator. 5 MB/PDF limit, PDF signature check, no-store/nosniff attachment downloads, receipt suppression and newly-written orphan cleanup. Malware scanning, retention/deletion policy, data-residency approval and operational ownership still require production decisions. No automatic document email.

## Concurrency / efficiency

Create receipts guard double-click/retry and payload reuse. Unit, tenant, lease and superintendent updates use revision CAS with transaction rollback on conflict; assignment mutation shares the tenant revision. Audit writes are in the same D1 batch. Existing legacy unit mutations and account/assignment changes direct staff to the operations editor when enabled, avoiding stale metadata/history bypasses; invitation and session revocation continue through existing MailService/auth.

Lists use 50-row pages plus a sentinel, fixed allowlisted sort SQL, indexed property/unit/assignment/expiration joins and prefix search. No per-row photo reads or polling. A 400-unit fixture verifies pagination and lookup plans. Administrative history/documents and individual household lists currently cap their displayed recent rows (100 history/assignment/doc metadata,20 documents per tenant lease), while preserving all stored rows; longer-history pagination is a future enhancement.

## Release

Apply only `src/lib/migrations/property-operations.sql`, after a read-only duplicate-unit/schema preflight and a protected backup. Do not replay historical schema, seed, rent-roll, media or work-order migrations against the remote database. The new unique index must fail rather than silently merge pre-existing duplicates.

Development feature flag: `PROPERTY_OPERATIONS_ENABLED=1` on the isolated Worker. `TENANT_LEASES_ENABLED` is separate and stays off on hosted preview without storage approval. Existing Pages secrets/bindings are preserved through the release-specific Worker bridge. Never update the already-serving frozen security Worker; create a fresh operations candidate Worker and service binding. Promote only after candidate authorization, UI, data integrity and regression evidence pass.
