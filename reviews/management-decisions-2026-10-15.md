# Teams Management — decisions needed

Prepared for Peter or Lisa. **No tenants have been imported or approved.** This is a local review package, not a live Admin release.

## Start here

1. **NOVITA — 17 source rows:** What is the exact street address? Identify the existing property, or confirm that a separate property must be established. No address will be inferred from tenant details.
2. **349/351 W 46th Street — 13 source rows:** Which building and exact unit belongs to each row? Review the two buildings separately; do not approve the combined label as one property.
3. **Tremont/Bruckner:** Confirm whether the lower-level and street-range labels refer to the existing Tremont property, and supply the Bruckner street number/address. Keep uncertain rows on hold.

## Other decisions

- **Property Mapping:** Review all 19 spreadsheet aliases against proposed existing properties. The screen shows the original label, suggested match, evidence/limitations and Approve/Hold controls. Approval applies only to a mapping—not to a tenant or import.
- **Duplicate/Repeat Review:** Choose which roster is authoritative, especially the repeated 166/170 E 118th lists. There are 90 repeat groups covering 213 source rows and six same-label groups with differing contacts. Similar contact details do not establish that people are the same. Keep unresolved rows separate and on hold.
- **Missing Contact Information:** 108 source rows lack email, 17 lack phone, and 13 lack both. Confirm available contact information where practical. Email is optional for an Admin contact-only tenant. Portal access requires a separately authorized invitation; it is never granted from the spreadsheet.
- **Tenant/Unit Assignment Conflicts:** Confirm exact units for unresolved labels and review existing assignment matches. No collision among resolved suggestions does not clear unresolved rows. Existing assignments, leases and maintenance history remain unchanged.
- **Source Authority:** Identify the original OneDrive/SharePoint workbook and owner; confirm which sheets are current and who may approve name/email/phone updates. The original workbook has not yet been independently verified. Approve field ownership before any synchronization is enabled.

## How to review

Open the private review bundle in Admin → Tenants → Import review. Start in Management dashboard. Choose a mapping, select an exact property, enter reviewer and supporting evidence, and record Approve mapping or Hold mapping. Use record holds for uncertainty. Download the review draft before leaving; reopen it with the same bundle after refresh. Files stay in the current tab, not browser storage or the server. Share private drafts only through the approved internal channel.

**Ready for Review** means a staff-verified property mapping, one exact matching unit, a nonblank proposed tenant name and no detected unresolved identity/source/assignment issue. It is a triage label, not verification of identity or permission to import. Missing email alone does not prevent this label. Everything ambiguous stays **On Hold**. All 407 candidate decisions remain unapproved, including Ready for Review rows.

## What remains inactive

Microsoft Graph preparation is manual and read-only. It can check workbook change tags once authorized, then propose approved contact-field differences for further review. No live Microsoft connection, automatic import, scheduled sync, duplicate merge, Portal activation, remote migration or paid integration has been enabled. Staff review and a separately approved release are required before real data changes.

## Preparation verification (for handoff)

Local only: 116 application tests and three read-only Graph probe tests passed; TypeScript and preview Worker build passed. Synthetic browser QA passed at 1440/768/390px with no overflow/page errors, anonymous/tenant access denial, review validation, retry protection, and download/refresh/reopen recovery. No remote deployment, Microsoft tenant access, production verification or real import was performed. The contact-only schema prerequisite remains prepared and locally rehearsed, not applied remotely.
