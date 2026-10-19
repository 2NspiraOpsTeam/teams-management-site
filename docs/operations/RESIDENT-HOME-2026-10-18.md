# Resident home, household and contacts — 18 October 2026

## Owner requirements and implementation

Jeffrey confirmed **three portal users total per apartment**, not three additional users. This is a portal-access limit, not an occupancy limit: never remove existing residents, history, or assignments to enforce it.

- Home and Household list current, building-matched apartment members. Names and explicit current leaseholder roles are read-only. Other members' contacts, notes and private lease permissions are not returned. No leaseholder role is inferred from imported names or account creation order.
- Existing approved-occupant request/review remains the admission workflow. The tenant form shows the current count and disables requests for full apartments. Server approval rechecks capacity inside the transaction, across **all** current apartments belonging to the target identity. This prevents indirect fourth-user activation through another apartment. Concurrent admission, new-account creation and active-account reassignment are guarded. Pre-existing over-capacity accounts are shown for management review, not automatically revoked.
- My account edits the signed-in resident's own primary contact email and phone, never name, login identity, lease terms, or another member's contacts. Explicit Save/Cancel, removable contacts, bounded validation, no autosave, client submission lock, optimistic contact snapshot and atomic audit guard. Saves preserve contact history, invalidate stale staff-editor revisions, and keep login email unchanged. No verification claim is assigned to resident-entered contact data.
- The welcome panel uses the assigned building's existing residential cover selection through the established published-media policy. No invented building image, media publication, or gallery assignment. Missing/unavailable images use the branded fallback, including errors occurring before hydration.
- Restrained card lift, short entrance transitions, and a slight photo zoom apply only with reduced motion disabled. Mobile uses a stacked cover; reduced motion disables all resident animation/transition effects.
- Lease summary publication is independent of private PDF availability. Staff explicitly publishes verified dates/terms to individually associated leaseholders with active matching assignments. The tenant sees start, expiration, renewal/status, and rent only if permitted. Nothing is automatically published. PDF access remains separately permissioned and authenticated; absent storage/documents show an honest unavailable state.

## Storage limitation

The Waterbear account has no configured LEASE_DOCUMENTS binding. A read-only R2 check returned Cloudflare code 10042, requesting that R2 be enabled through the Dashboard. No billing settings, buckets, secrets or real documents were changed. Full private lease-PDF upload/download remains **blocked by storage activation and document availability**. Existing document APIs and per-leaseholder guards remain in place. No public document URL or substitute public media storage was introduced.

## Verification before release

- 226 application tests / 29 suites pass, including capacity races, multi-apartment activation, assignment rollback, own-contact isolation/immutability, audit failure, stale snapshots and household role/privacy tests.
- TypeScript, Next production compilation and OpenNext bundling pass. The local machine's default pnpm 11 differs from the original build workflow; the equivalent canonical build was executed directly with Next's standalone/output-tracing environment, followed by OpenNext `--skipNextBuild`. No dependency, lockfile or build-policy change.
- Local isolated schema-only synthetic D1: 18 rendered checks across six tenant pages at 1440/768/390; contact validation/cancel/failure/save/clear/refresh, disabled submission, household approval, third-user acceptance/fourth-user rejection, role denial, reduced motion and missing-photo fallback observed. No browser page errors. The early-photo-error fallback was reproduced and fixed during QA.
- Prechange Waterbear checkpoint: all 63 tables and schema restore exactly, integrity OK, no FK violations, export bookmark unchanged. No stable tenant record mutation or schema migration is required.

Hosted candidate and stable release results are recorded below when verified. Development only; no 2Nspira release, DNS change or authentication-provider change.
