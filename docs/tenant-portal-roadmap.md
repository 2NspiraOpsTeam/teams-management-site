# Teams Resident Services Portal — phased architecture

## Current scope: Phase 1 (preview only)
Tenant identity is provisioned explicitly by an authenticated Admin, never inferred from a property or unit. An active account and active, building-matched unit assignment are required for login and every tenant resource. Admin and tenant sessions use separate cookies and guards. The dashboard shows assigned property/unit and functional maintenance only. Staff notes are never returned by tenant APIs. Deactivation and assignment changes revoke sessions.

The Admin Tenant Access area owns identity, assignment, activation, invitations, and session revocation. The controlled QA identity is marked `QA / TEST` and assigned to `[QA] Test Building / QA-ONLY-01`; do not confuse it with a real resident.

## Phase 2: verified lease summary and private documents
Use the existing `tenant_accounts`, `tenant_assignments`, and `tenant_documents` model as the identity and authorization anchors. Add a lease record tied to an assignment, with verified dates, rent, lease type, renewal state, and management contact only when approved data exists. Keep accounting and management notes in Admin-only tables/fields. Add Admin lease review/edit and document publication controls. Store document bytes privately; serve through a tenant-authorized route, never public object URLs. Scope tenant-specific, unit-specific, building-specific, and all-tenant notices explicitly. Show Lease and Documents cards only when there is authorized, published content and working routes.

## Phase 3: building-configured services, messaging, and profile
Add service types and building availability as separate Admin-controlled records. Optional appointment windows and requests reference both service type and the tenant's active assignment. Statuses: requested, scheduled, in progress, completed, cancelled. Never list a service for a building without explicit Admin configuration. Extend the existing tenant contact-request model to a threaded inquiry with tenant-visible responses and separately stored staff notes. Allow only safe contact preferences in Profile; tenant identity, assignment, lease terms, rent, and roles remain Admin-controlled. Show cards only once their workflows have passed end-to-end QA.

## Later, only after Teams chooses a provider/workflow
Payments and rent history; third-party accounting integrations; maintenance photos and document uploads. No paid services or tenant uploads are part of the current rollout.

## Security and launch gates for each module
Every query must bind the signed-in tenant ID and join an active assignment and its building-matched unit. A resource ID alone is never authorization. Test anonymous denial, cross-tenant and cross-unit denial, Admin/tenant separation, staff-note omission, revocation, and deactivation. Keep private files behind authorized responses with no public URL. Use the approved QA tenant on preview for each phase. Do not promote the portal to production until Phase 1 passes full authenticated QA and Admin management is verified.
