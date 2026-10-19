// Fail closed before uploading or activating the Waterbear synthetic standby.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const account = '8fbe09502d38e82ab1b3d51f8eb7a1c6';
const database = '8d1aa9bb-8370-4569-97b5-c1a61eb9406e';
function validate(config, version, selectedAccount = process.env.CLOUDFLARE_ACCOUNT_ID) {
  assert.equal(selectedAccount, account, 'Explicit Waterbear account selection required');
  assert.equal(config.account_id, account, 'Wrong account');
  assert.equal(config.name, 'teams-development-runtime', 'Wrong runtime');
  assert.equal(config.main, 'deployment/preview-runtime/entry.mjs', 'Wrong RPC entrypoint');
  assert.equal(config.workers_dev, false, 'Public Worker endpoint must stay disabled');
  assert.equal(config.preview_urls, false, 'Worker preview URLs must stay disabled');
  assert(!config.env && !config.routes && !config.services, 'Unexpected environment, route or service override');
  assert.equal(config.d1_databases?.length, 1, 'Exactly one isolated database required');
  assert.equal(config.d1_databases[0].binding, 'DB');
  assert.equal(config.d1_databases[0].database_id, database, 'Preserved client databases are forbidden');
  assert.equal(config.vars.TENANT_MANUAL_IMPORT_DATABASE_ID, database, 'Importer target mismatch');
  assert.equal(config.vars.NEXT_PUBLIC_TEAMS_PORTAL_ORIGIN, 'https://teams-management-development.pages.dev');
  if (version) {
    const bindings = version.resources?.bindings;
    assert(Array.isArray(bindings), 'Missing remote version binding evidence');
    const stores = bindings.filter(b => ['d1', 'r2_bucket', 'kv_namespace', 'service', 'durable_object_namespace'].includes(b.type));
    assert.equal(stores.length, 1, 'Unexpected remote datastore or cross-service dependency');
    assert.equal(stores[0].name, 'DB');
    assert.equal(stores[0].type, 'd1');
    assert.equal(stores[0].id, database, 'Remote version connects to a forbidden database');
    for (const name of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']) {
      assert(bindings.some(b => b.name === name && b.type === 'secret_text'), 'Missing mail secret binding: ' + name);
    }
    assert.equal(bindings.find(b => b.name === 'TENANT_MANUAL_IMPORT_DATABASE_ID')?.text, database);
  }
  return { account, database, runtime: config.name, version: version?.id ?? null, targetVerified: true };
}
module.exports = { validate, account, database };
if (require.main === module) {
  const config = JSON.parse(fs.readFileSync('wrangler.waterbear.jsonc', 'utf8'));
  const version = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : undefined;
  console.log(JSON.stringify(validate(config, version)));
}
