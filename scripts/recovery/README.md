# Recovery tools

Python 3.9 or later is required. Run without `-O`; verification assertions are mandatory. The tools do not execute Cloudflare restores, deploy code, delete resources, or change database bindings. `capture.py` runs remote read-only export/metadata commands. It writes a new private directory and runs a complete local restore rehearsal.

Use a protected directory **outside this public checkout**. SQL input must be a trusted owner-controlled export. Checkpoints contain tenant data and application source. Never commit their output, logs or real target profile.

## Capture and verify

Install the approved Wrangler version and authenticate normally without copying tokens into arguments. Supply the correct Node directory and isolated Wrangler configuration directory. The Worker config must be strict JSON, as in `wrangler.waterbear.jsonc`, and agree with all three explicit target arguments.

```sh
python3 scripts/recovery/capture.py \
  --wrangler "$WRANGLER_PATH" --config-home "$WRANGLER_CONFIG_HOME" \
  --node-directory "$NODE_DIRECTORY" --repository "$PWD" \
  --worker-config "$PWD/wrangler.waterbear.jsonc" \
  --account "$VERIFIED_ACCOUNT_ID" --database "$VERIFIED_DATABASE_ID" \
  --worker teams-development-runtime --output "$PRIVATE_CHECKPOINT_DIRECTORY"
```

The output directory must not exist. The capture stores deployed version metadata, a local build, public files and source changes; the local build is not assumed to equal the deployed version. Commit the release and retain the actual deployed artifact separately when exact code recovery matters. The capture can only inventory storage it knows about; add explicit backups for future external storage.

To verify a trusted export independently and generate ordered bounded batches:

```sh
python3 scripts/recovery/verify_and_package.py \
  --sql "$PRIVATE_EXPORT_SQL" --output "$NEW_PRIVATE_PACKAGE_DIRECTORY" \
  --account "$VERIFIED_ACCOUNT_ID" --database "$VERIFIED_DATABASE_ID"
```

This rebuilds every table twice locally, compares typed row and schema fingerprints, checks foreign keys and integrity, and handles oversized media values through bounded updates. Cyclic foreign-key schemas or large rows without a stable primary key fail closed and require a dedicated plan.

## Generate a restore plan

Copy `targets.example.json` to a private location and replace the placeholders with independently verified current resource identifiers. This file does not grant permission to restore.

```sh
python3 scripts/recovery/restore_plan.py \
  --checkpoint "$PRIVATE_CHECKPOINT_DIRECTORY" --targets "$PRIVATE_TARGETS_JSON" \
  --target waterbear --output "$PRIVATE_RESTORE_PLAN_JSON"
python3 -m unittest discover -s scripts/recovery -p 'test_*.py' -v
```

The plan requires an aligned, retained bookmark for its quick path and a single version receiving 100 percent of traffic. Weighted deployments require a dedicated plan. Checksum matching is an integrity check, not a cryptographic signature: protect the manifest itself. The planner checks listed files; it does not certify credentials, live service availability or future retention.

Follow [the complete recovery procedure](../../docs/operations/BACKUP-AND-RESTORE.md) before executing any reviewed restore commands. Keep `CLOUDFLARE_ACCOUNT_ID` set explicitly when invoking Wrangler. An old checkpoint or example target must never select the live target implicitly.
