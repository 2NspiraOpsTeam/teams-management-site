# Backup and restore procedure

Recover a chosen business state together with its compatible application version, configuration and media. A SQL export alone cannot recover mail authorization, bindings, code, static files or external storage. Use [the read-only recovery tools](../../scripts/recovery/README.md) to prepare and verify each checkpoint.

## Capture a checkpoint

1. Confirm the intended account, database, Worker, website and source revision. Save a current remote deployment inventory and its traffic percentages.
2. Pause application writes when consistency across multiple resources matters. Stop other direct writers as well. A database export can still be a valid snapshot during normal use, but an exact Time Travel bookmark is eligible only when the before/after bookmark is unchanged.
3. Capture the full D1 export, bookmark before and after, Worker version metadata, configuration, secret names, source revision/changes, dependency lockfiles, public assets and built assets. Keep separate encrypted records for credentials; the tool captures names only. Commit the release source before capture and retain the exact deployed Worker artifact or a separately verified reproducible build.
4. Run a full local restore. Compare every table's typed contents, indexes, triggers, schema and SQLite sequence. Require integrity `ok` and zero foreign-key violations. Generate normalized parent-first batches and their checksums for portable cloud recovery. Raw exports can contain INSERT statements too large for D1; do not assume a raw file can be reimported unchanged.
5. Save the checkpoint in an owner-approved encrypted location off the development computer, verify its archive checksum after transfer and restrict access. This off-device destination and recurring schedule still need configuration. Keep pre-change, post-change and original-source checkpoints distinct. Never publish them in this public repository.

The 18 October owner archives include an original 2Nspira recovery package, original application source, Waterbear pre-migration package, completed-migration package, and a SHA256 catalog. Private working evidence and portable batches remain with the owner. Do not infer backup availability merely because a procedure exists in GitHub.

## Restore quickly within Time Travel retention

1. Obtain owner approval for the exact environment and checkpoint. A historical migration approval is not permission for a later destructive restore.
2. Pause writes and capture a new verified undo checkpoint. Record the current Worker version, configuration and database bookmark.
3. Run `restore_plan.py` against the selected checkpoint and a privately verified target profile. It checks every listed checksum, database/account/Worker identity, local restore proof, timestamp, bookmark alignment and deployment traffic shape. Review the generated plan.
4. Confirm Cloudflare still retains that exact bookmark. The planner uses a conservative seven-day window; verify the account's current retention rather than assuming availability from age alone.
5. Execute only the reviewed database Time Travel restore under the explicit account. Coordinate the matching Worker version, bindings, flags and static assets. Worker rollback alone does not roll back D1, and D1 restoration alone does not restore credentials. Preserve existing secrets unless a separately approved recovery requires changing them.
6. Export again and compare every table/schema fingerprint to the chosen checkpoint. Verify media, admin and tenant access, apartment associations, contacts, rent roll, maintenance and import history. Confirm environment-specific email links and the correct sender.
7. Reopen writes only when checks pass. Keep the undo checkpoint until the restored state is accepted.

The planner emits commands for operator review; it cannot mutate Cloudflare. No live Time Travel rollback was performed during migration QA. A recovery time target has not been benchmarked.

## Restore an older or portable checkpoint

Create a separately named empty database in the approved account. Apply the normalized batches in numbered order, validating their checksums. Keep each row with its large-field reconstruction in one atomic group. Stop at the first unexpected failure; reconcile the actual state before resuming. Do not replay INSERT batches into a populated database.

Re-export the isolated database and require exact fingerprints, schema and integrity checks. Test a private application deployment against it. Obtain approval before switching the live binding, then verify the website and reopen writes. Keep the prior binding and undo checkpoint available until acceptance. The 18 October cloud drill verified this path using the pre-migration snapshot; it did not switch live bindings.

## Retention and readiness

Keep at least a fresh checkpoint before each risky change and a verified completed-state checkpoint afterward. Agree on recovery point and recovery time targets, encrypted off-device storage, access ownership and recurring retention before production launch. Repeat an isolated cloud restore after material schema/storage changes. Include external object storage and secret recovery when those services become part of the application.
