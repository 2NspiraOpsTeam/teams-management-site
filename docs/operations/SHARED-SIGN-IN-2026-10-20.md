# Shared Sign in — stable preview promotion, 20 October 2026

Jeffrey explicitly requested promotion and accepted the existing function without repeating fresh OTP tests. Integrated only shared sign-in into the current compact-analytics source; preserved published-content wrappers, property facts, sample toggle, all 1,333 verified photo derivatives and existing hardened role handlers.

- Application SHA `f8a017a`; fingerprint `preview-shared-signin-f8a017a`.
- Stable https://teams-management-preview.pages.dev uses existing gateway deployment `eeba1806-e555-476f-b2f0-ad55e5fceaf3`, primary branch `preview`, Production environment. Runtime-only release: `teams-preview-analytics-20261020`, version `e26f7af9-accc-4cb6-8a55-2f4aae5b885a`. Gateway metadata remains the earlier analytics SHA; both stable and review gateways now use the updated runtime.
- Rollback runtime version `1ead88a9-aaa6-4407-8560-ef4c2b9ce147`; unchanged gateway and private pre-sign-in configuration retained.
- Pages configuration compared unchanged; Worker binding names preserved. No database/account/mail changes or email sends.
- 26 focused shared-sign-in, analytics, inquiry-mail and link tests passed; TypeScript and canonical preview OpenNext build passed.
- Stable shared page rendered; legacy `/access` reaches `/tenant/login`. Invalid-address shared API returns400/no-store without sending. Existing authenticated Admin session and analytics return200 with new fingerprint. Mobile shared page visually reviewed at390px without overflow. Fresh emailed Admin/tenant code delivery and authenticated role routing were not repeated; role-routing and cookie contracts covered by focused tests.

## Tenant Services presentation restored

Jeffrey requested restoration of the Tenant Services public entrance with no Admin portal wording. Application commits `5037863` and `1598c24` restore desktop/mobile navigation to `/tenant-services` and replace the shared login's role explanation with neutral account/services copy; shared authentication handlers remain unchanged.

Runtime version `a62eb67c-a48c-4ce8-84bc-cb1ba4f54d55`, fingerprint `preview-tenant-services-1598c24`; Pages gateway/bindings unchanged. Prior runtime version `e26f7af9-accc-4cb6-8a55-2f4aae5b885a` retained for rollback. No database, accounts, mail configuration or original media changes. Build staged all 1,333 verified derivatives. 22 focused tests and TypeScript passed. Stable desktop navigation → Tenant Services → sign-in observed; mobile menu visually reviewed at390px without overflow. Login copy has no Admin reference. Existing Admin session and analytics both200 with new fingerprint. Fresh OTP not repeated for this presentation-only change.
