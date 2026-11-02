import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe('showcase publication transition', () => {
 it.each([false, true])('preserves publication and media authorization (preview=%s)', async preview => {
  vi.stubEnv('NEXT_PUBLIC_PREVIEW_PORTFOLIO', preview ? '1' : '0');
  vi.resetModules();
  const { eligibleShowcases } = await import('./page-showcase');
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE buildings(id TEXT,name TEXT,slug TEXT,address_json TEXT,publication_state TEXT);
   CREATE TABLE media_assignments(id TEXT,building_id TEXT,unit_id TEXT,asset_id TEXT,alt_text TEXT,is_cover INTEGER,order_index INTEGER,created_at TEXT);
   CREATE TABLE media_publications(assignment_id TEXT,published INTEGER);
   CREATE TABLE media_assets(id TEXT,visibility TEXT,file_type TEXT,storage_key TEXT,checksum TEXT,alt_text TEXT);`);
  const cases = [
   ['live','1365-1st-ave','published','public',1,null],
   ['draft','1374-1st-ave','draft','public',1,null],
   ['archived','225-e-83rd-st','archived','public',1,null],
   ['private','171-e-74th-st','published','private',1,null],
   ['unapproved','61-gold-st','published','public',0,null],
   ['unit','166-e-118th-st','published','public',1,'unit-1'],
   ['outside','outside-preview','published','public',1,null],
  ] as const;
  for (const [id,slug,state,visibility,published,unit] of cases) {
   db.prepare('INSERT INTO buildings VALUES (?,?,?,?,?)').run(id,id,slug,'{}',state);
   db.prepare('INSERT INTO media_assignments VALUES (?,?,?,?,?,?,?,?)').run(id,id,unit,id,null,1,0,'');
   db.prepare('INSERT INTO media_publications VALUES (?,?)').run(id,published);
   db.prepare('INSERT INTO media_assets VALUES (?,?,?,?,?,?)').run(id,visibility,'image/jpeg','objects/'+id,null,null);
  }
  const adapter = { prepare(sql:string) { return { bind(...args:string[]) { return { async all() { return { results: db.prepare(sql).all(...args) }; } }; } }; } } as unknown as D1Database;
  try {
   const rows = await eligibleShowcases(adapter,false);
   expect(rows.map(row=>row.property_id).sort()).toEqual(preview ? ['draft','live'] : ['live','outside']);
  } finally { db.close(); }
 });
});
