# Future production promotion to 2Nspira

Promote the approved application build after Waterbear development is complete. Keep production customer data and production credentials. The development migration is not a plan to overwrite the production database. No production promotion is authorized or executed by this handoff.

## Prepare a reviewable release

1. Reconcile the deployed `d22a754` baseline and the Waterbear changes with the intended release branch. Resolve the older default-main history deliberately. Record the exact reviewed commit, dependency lockfile, build settings and migration IDs.
2. Re-inventory current 2Nspira resources. The migration comparison used account `36a7807b2d8726b889873bab8b572113`, database `2d04fbea-8af6-4d6d-b5bf-cf758666d55e`, Worker `teams-d1-efficient-d22a754`, and `https://teams-management-preview.pages.dev`. These describe the old preview, not an automatically selected future production deployment or domain.
3. Confirm the production domain, sender, Google OAuth authorization, admin access policy, storage, bindings and feature flags. Use production secrets already owned by 2Nspira or a separately authorized setup. Keep development credentials in Waterbear.
4. Capture and rehearse a fresh production checkpoint. Compare the current production schema with the new code's requirements and review any incremental migration. Production may have changed since the October source copy; preserve those changes.
5. Build from the approved commit with the production portal origin set at compile time. The development artifact embeds its development origin and must be rebuilt. Preserve the private Pages RPC contract where that architecture is used.
6. Test an isolated staging deployment with a safe database copy and approved email recipients. Verify the full admin/tenant/property/contact/rent/maintenance/import flows, images, access denial, observability and rollback compatibility.

## Release after owner approval

Present the exact target resources, release commit, domain, database changes, checkpoint, expected downtime and rollback procedure for approval. Approve billing changes separately if any are needed.

After approval, freeze writes when required, capture a final undo checkpoint, apply only reviewed schema/data migrations, deploy the intended private runtime and gateway configuration, verify release identity and business checks, then reopen writes. Monitor sign-in delivery, authorization and application errors. Retain the previous Worker and checkpoints until acceptance.

## Roll back safely

Determine whether the previous code is compatible with the new schema before rolling it back. If a coordinated data rollback is required, stop writes and use the approved checkpoint; review any customer writes made after it before choosing to discard or reconcile them. Use the [backup and restore procedure](BACKUP-AND-RESTORE.md), verify all tables and images, then reopen access. Never copy the development database over production as a shortcut.
