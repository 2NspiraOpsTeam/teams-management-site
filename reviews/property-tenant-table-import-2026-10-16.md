# Property tenant table import

Extends the existing reviewed XLSX importer; no schema or tenant-record changes.

- Property dashboard: Import tenants opens the importer with property preselected.
- Downloadable values-only XLSX template: Property, Unit, Tenant Name, Main Phone, Alt Number, Email.
- Paste tab-separated spreadsheet cells with named headers; strict column validation prevents shifting blank phone/email cells.
- Template preserves leading zeros and both phone values verbatim, including contact labels.
- Existing held-identity, mapping, duplicate, resumable commit, and no-access-grant protections retained.
- Combined names remain intact and require existing identity review. No automatic split/merge.
- Existing workbook headers remain supported. Shared XLSX writer also retains export behavior.

Verified: 153 tests, typecheck, OpenNext preview build. Rendered local Chrome at 1440, 768, 390: property selection, template enabled state, invalid paste, clear, property persistence on refresh, no page overflow. Mobile fieldset min-width corrected during QA. Parser round-trip verifies alternate contacts and blank trailing cells.

Hosted authenticated import remains unverified; no supplied real roster imported, no tenant outreach, no stable/production promotion. Spreadsheet paste requires actual tab-separated clipboard cells, not space-delimited chat prose. Property column in pasted rows must be blank or match selected property ID; template prepopulates that ID.
