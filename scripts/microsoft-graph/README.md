# Microsoft 365 preparation — inactive, read-only

Existing-option preflight: Microsoft Graph v1.0 driveItem metadata supplies change tags without a paid connector, SDK, separate app, database or scheduler. Use Python's maintained standard library for this single GET. Do not use Excel createSession (a POST) or Power Automate/paid connectors. No automatic synchronization is installed.

## Connection contract

Management must identify the original OneDrive/SharePoint workbook, source owner, authoritative sheet/roster and exact drive/item IDs. Verify the original bytes and preserve each version privately before reconciliation. The received review workbook is not yet an independently verified original.

Use an existing organization-approved Microsoft Entra delegated application with `Files.Read`, not write permissions or application-wide file access. Tenant policy may require administrator consent; no credential or consent has been configured or claimed working here. Do not provision a paid service. Tokens remain server/operator-side environment only; never paste them in Admin, commit them, print them or put them in command arguments.

Manual probe after authorization: set `TEAMS_GRAPH_READ_TOKEN` securely, then run `python3 scripts/microsoft-graph/check-workbook.py --drive-id DRIVE --item-id ITEM`. Optional `--previous PRIVATE_METADATA_JSON` compares tags. Save output only to a restricted private directory if needed. This GET does not download workbook contents, alter the source, or write D1. Permission scope must be verified in the actual delegated consent, not inferred from token presence. Change detection alone grants no import approval.

## Future reviewed synchronization, not activated

1. Confirm source ownership and all property mappings. Separately approve field ownership (name/email/phone), exact source-row to existing entity crosswalks, and conflict handling. Never match identities by contact values.
2. A changed eTag/cTag triggers a manual immutable version download/review, not an import. Missing/deleted rows, blank cells, conflicting Admin edits and repeat groups go on hold; never delete tenants or clear contacts automatically.
3. `proposeContactChanges` is offline preparation: accepts only explicitly approved contact fields and emits review-required differences. Its supplied gates are not authenticated authorization. No lease, unit, assignment, login, invitation, maintenance or activation field is allowed. Blank proposals require staff review.
4. Reuse the guarded import planner, exact revisions, audit and rollback only after separate real-release authorization. No scheduled job, endpoint, subscription or writer exists in this preparation.

Official references checked for this design: [driveItem GET](https://learn.microsoft.com/en-us/graph/api/driveitem-get?view=graph-rest-1.0), [permissions](https://learn.microsoft.com/en-us/graph/permissions-reference#filesread), [driveItem resource / eTag / cTag](https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0). Live tenant connectivity and permissions remain unverified.
