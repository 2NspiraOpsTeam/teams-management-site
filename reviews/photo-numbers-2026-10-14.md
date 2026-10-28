# Property photo labels

Added property-scoped Photo N labels to source thumbnails, assignment cards, Residential/Retail cover and add-image dropdowns, selected cover previews and gallery entries. Gallery position is explicitly separate.

Numbers are computed over the full property assignment pool ordered by first association timestamp and asset ID, before approval/search filtering. Reorder, context selection, visibility and search do not renumber photos. No schema, files, source approvals or stored selections changed. Removing a source assignment can change the remaining pool's numbering; these are selection aids, not permanent asset identifiers.

Source commit: f89fc1f. Candidate: https://daa525b2.teams-management-preview.pages.dev. Stable: https://e6eec46f.teams-management-preview.pages.dev (Pages primary branch preview); https://teams-management-preview.pages.dev.

Checks: 56 existing tests passed, typecheck and Pages preview build passed. Authenticated browser checks on candidate and stable at 1440, 768, 390: matching dropdown labels in both contexts, source-thumbnail numbers, cover preview selection/cancel, refresh, unchanged saved settings, filtered search retains numbers, no overflow or browser errors. Stable source images decoded successfully. No live data mutations performed. Existing Admin session regression tested; no new OTP or production/custom-domain release claimed.
