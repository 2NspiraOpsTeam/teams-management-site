# Optional OneDrive lease PDFs

Lease fields are sufficient. Documents and Microsoft connection are optional. R2 stays disabled; no paid resources or billing enrollment are needed for this implementation. Existing Microsoft OneDrive entitlement and normal free hosting/database quotas still apply; this does not promise unlimited free operation.

Uses Microsoft's File Picker v8 and maintained MSAL browser library (authorization code + PKCE). Work/school Microsoft 365 OneDrive is supported; personal consumer accounts and cross-organization libraries are not included in this first release.

## Microsoft prerequisite

Register a single-tenant SPA in the client's existing Microsoft Entra tenant. No client secret. Register each approved origin's `/onedrive-callback` as a SPA redirect URI. Grant delegated **SharePoint MyFiles.Read** only; no write, application-wide, sharing, or directory permissions. Obtain tenant approval/consent if required by organizational policy. No paid Entra tier or Azure subscription is requested by the code.

Runtime public configuration (not credentials):

- `ONEDRIVE_CLIENT_ID`: app registration UUID
- `ONEDRIVE_TENANT_ID`: organization UUID
- `ONEDRIVE_BASE_URL`: exact OneDrive origin, e.g. `https://contoso-my.sharepoint.com` (no trailing slash)

Do not invent these values or activate paid resources. Configure only the approved preview runtime first. Until configured, the picker says setup is pending; normal lease editing works.

## Persistence/release

Apply additive `src/lib/migrations/lease-onedrive-links.sql` only after existing backup/restore and migration-ledger checks, per operations instructions. Stores permanent file web URL, file name, drive/item IDs, lease association and actor. Unique association makes retries and concurrent duplicate selection safe. No bytes, access tokens, refresh tokens or temporary download URLs go to D1. Audit history excludes file URLs and tokens. Metadata routes require existing Admin authorization and same-origin writes.

Selection is explicitly reviewed before Save PDF link. Links remain Admin-only, with no tenant API changes or automatic sharing. Microsoft controls file access. Deleted files or revoked access cannot be repaired by this portal. OneDrive opening may require Microsoft sign-in. No createLink/download/upload calls are made. Popup messaging verifies window, origin and random channel; token requests are restricted to the configured Microsoft origin. Tokens use in-memory MSAL cache and are cleared after selection.

Before hosted acceptance: verify real Microsoft sign-in/consent, first-click popup behavior, PDF selection, cancellation, popup-block recovery, non-PDF rejection, save/reload, duplicate retry, tenant isolation and revoked Microsoft access using approved QA files. Local mocks cannot prove Microsoft integration. No real lease PDF is required for QA.
