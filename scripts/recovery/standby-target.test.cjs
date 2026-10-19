const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { validate, account, database } = require('./standby-target.cjs');
const config = () => JSON.parse(fs.readFileSync('wrangler.waterbear.jsonc', 'utf8'));
test('accepts only the explicit isolated Waterbear target', () => assert(validate(config(), undefined, account).targetVerified));
test('rejects the preserved client database', () => {
  const c = config(); c.d1_databases[0].database_id = '29dfe758-69b1-4465-b74e-101d48c53f7e';
  assert.throws(() => validate(c, undefined, account));
});
test('rejects implicit or primary-account execution', () => {
  assert.throws(() => validate(config(), undefined, ''));
  assert.throws(() => validate(config(), undefined, '36a7807b2d8726b889873bab8b572113'));
});
test('rejects a second data binding or importer mismatch', () => {
  const c = config(); c.d1_databases.push({ binding: 'OTHER', database_id: database });
  assert.throws(() => validate(c, undefined, account));
  const d = config(); d.vars.TENANT_MANUAL_IMPORT_DATABASE_ID = 'old';
  assert.throws(() => validate(d, undefined, account));
});
test('rejects remote metadata that secretly points at another store', () => {
  assert.throws(() => validate(config(), { resources: { bindings: [{ type: 'd1', name: 'DB', id: 'old' }] } }, account));
});
