# Teams gold emblem — preview update

Jeffrey supplied and approved the replacement artwork on October 29, 2026. This change targets the existing `teams-management-preview.pages.dev` site, not the client-production domain.

- Unmodified original: `public/brand/teams-management-gold-emblem.png`, 1254 × 1254 pixels.
- Original SHA256: `808f0067fe7825659db3e3c4073a2849cc9ae6cc1d82bf414e9cc97edc719ec5`.
- Legacy `/brand/teams-management-logo.png` remains an identical compatibility copy for previously generated emails or saved links.
- Header, footer, portal brand, admin dashboard, organization structured data and future sign-in email templates reference the descriptive new path.
- Browser icon: a proportional 512-pixel PNG derived from the supplied artwork, replacing the SVG that embedded the previous logo. Black background and artwork remain intact; no generative editing or cropping.
- Responsive delivery: locally resized lossless WebP variants at 160, 480, 960 and 1254 pixels; no upscaling. Only the Teams logo records/derivatives are changed; property, dining and nearby-business artwork is unchanged.

Release baseline is the actually serving private Worker commit `066f2c281ba57991350ef9ddad5032b934545ec1`, not stale main. The previous Pages gateway metadata identifies `f8772939d1741cd9cbdb9973c5955bae0d2122b8`, an ancestor of the serving runtime. Preserve all newer sign-in and mail diagnostics.

Existing sign-in emails cannot be recalled or rewritten. Their legacy image URL now resolves to the replacement logo after deployment. Authenticated dashboard visual QA requires an authorized session; source coverage must not be represented as signed-in runtime validation.

## Owner-requested image timing

Residence and retail shared galleries advance every 8 seconds (previously 4). Homepage Across the City now holds each card for 8 seconds before advancing one card, as explicitly confirmed by Jeffrey. Pause, focus, reduced-motion and manual controls are preserved. Dining timing is unchanged.
