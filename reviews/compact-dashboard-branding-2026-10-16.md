# Compact dashboard and portal branding

- Reuse approved Teams Management artwork in shared PortalBrand component: desktop/mobile Admin navigation, tenant portal header, Admin sign-in and tenant sign-in. Existing dashboard seal retained.
- Compact overview retains nine renewal metrics, all twelve month drilldowns, review and follow-up links. Calculation rules/reminders and recent operational activity use native expandable details. No calculation, authorization, data, notification or lease changes.
- Desktop hero/shortcuts/portfolio metrics tightened; tablet/mobile retain readable wrapping and natural vertical scrolling.

## Verified

- 164 automated tests / 22 files; OpenNext preview Worker build and embedded typecheck; git diff check.
- Local rendered Admin: 1440x900, 1366x768, 1280x720, 1024x768: no page scrolling or horizontal overflow with optional details closed. All nine renewal metrics, twelve month links and portfolio/maintenance/operations groups retained.
- Local tablet 768x1024 and mobile 390x844: no horizontal overflow; mobile menu open/navigation/close, expansion/collapse, chart drilldown and refresh passed. Natural vertical scroll retained.
- Admin and tenant sign-in and authenticated tenant portal: logo loaded at widths 1440, 768, 390 and 320. No browser errors. Sign-in handlers unchanged; no OTP requested or email sent.
- Visual inspection: laptop dashboard and mobile tenant portal/sign-in screenshots.

## Release scope

Publish isolated review only. Authenticated hosted QA remains pending legitimate shared-browser sign-in; do not promote stable preview or production based on local sessions. No remote database mutations or configuration-secret changes.
