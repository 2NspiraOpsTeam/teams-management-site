# Lease Renewals & Expirations

## Daily workflow

1. Open **Admin Dashboard → Lease Renewals & Expirations**. Click any month or metric to open its matching renewal worklist, or use **Rent Roll → Renewals**.
2. Use **Imported / missing-date review** to compare the workbook values with actual agreements. Open the apartment to review its current tenant assignments and create a verified lease using the existing lease editor. Supply real dates and leaseholders; do not invent a lease start, occupancy, or legal meaning for a source code.
3. On a verified lease, use **Update renewal status** to assign an active staff identity, record the actual last contact date, set/clear a follow-up date, and save private notes. Reload to confirm. An error retains the draft; a stale edit must be reloaded and reconciled. Nothing is emailed.
4. For a completed renewal, use **Create associated renewal**. Preserve the original agreement and enter the new agreement's actual dates, amount, and holders. Its predecessor is retained; saving the linked renewal marks the predecessor renewed, advances its revision, records completion and audit history atomically. Duplicate receipt retries do not create agreements twice. A tracking-only Renewed status requires an associated agreement.
5. Record actual departures through the tenant's existing assignment workflow, not merely the renewal status dropdown. Historical assignments/agreements remain; absence of a lease does not imply vacancy.
6. Export CSV/Excel or **Print filtered report** for the whole filtered worklist, not just the visible page. Printed reports include private notes; handle them as staff-only documents.

## Calculation rules

- Business date is America/New_York. Only complete, validated ISO calendar dates qualify; invalid dates and arbitrary text never become forecast dates.
- A confirmed upcoming lease has saved active/expiring status, has begun, has not ended, has an active leaseholder with a matching current unit assignment, has no linked successor, and is the single overlapping current agreement for that apartment. Future, terminated, renewed, expired, unmatched, and overlapping agreements are excluded from confirmed counts; inspect the review/history views instead.
- Each eligible lease ID appears once in one calendar month. The 12-month chart starts with the current month. “This month” includes upcoming expirations in that month; it does not resurrect already-ended agreements.
- 30/60/90-day windows include today and their ending day. They are cumulative and overlap, and must not be added. Each metric and export uses the same worklist filter.
- A Non-Renewal / Move-Out tracking status alone does not remove an active agreement from expiration counts or end occupancy. Authorized changes to the underlying agreement/assignment control those counts.
- Renewed counts require an associated successor and a recorded completion timestamp within the selected completion-reporting month. Future renewal agreements enter the active forecast when they begin.
- Missing Verified Expiration counts occupied apartments without a qualifying verified current agreement, excluding explicit recorded month-to-month arrangements. A valid imported date is still unverified.
- Recorded month-to-month values are recognized literally (Month to Month, month/month, month-to-month, M/M); they are shown separately and do not drive confirmed active-lease metrics. Recorded vacancy and ended assignments are not counted as month-to-month active occupancy.
- Source status codes (including D/S/RC), legal-rent text, commercial square-footage/bedroom descriptions, blank cells, zero amounts, and original tenant-name strings remain source values. They do not change identity, occupancy or lease status. Full original row values and source SHA/sheet/row are retained privately alongside the apartment, not in another lease database.

## Internal reminders and workflow

**Configure internal reminders & workflow** changes day thresholds, status labels, in-progress flags, and optional additional staff workflow steps. Defaults are 90/60/30 days. Standard status keys remain available and used custom steps cannot be removed. Settings use revision guards and audit history.

These are internal planning reminders, not statutory notice deadlines. No recurring third-party scheduler, paid platform, tenant notification, renewal offer or legally consequential notice is created. Peter must approve any later mail process, recipients, and templates separately.

The dashboard/worklists are recalculated from D1 when loaded, refreshed, or the worklist regains focus. They are not a background push feed. Changes saved through the existing assignment/lease workflows affect the next read automatically; no monthly spreadsheet regeneration is required.
