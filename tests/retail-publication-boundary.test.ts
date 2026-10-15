import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
const state = vi.hoisted(() => ({ db: null as any, preview: false }));
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: () => ({ env: { DB: state.db } }) }));
vi.mock('@/lib/preview-portfolio', () => ({ get previewPortfolioEnabled() { return state.preview; } }));
import { listPublicRetail, getPublicRetail } from '@/lib/public-retail';
function fixture() {
 const sqlite = new DatabaseSync(':memory:');
 sqlite.exec(`CREATE TABLE buildings(id TEXT,name TEXT,slug TEXT,address_json TEXT,retail_status TEXT,retail_notes TEXT,latitude REAL,longitude REAL,map_verified INTEGER,geocode_status TEXT,has_retail INTEGER,retail_published INTEGER,publication_state TEXT)`);
 for (const status of ['draft','published','archived']) sqlite.prepare('INSERT INTO buildings VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(status,status,status,'{"street":"QA","city":"New York","state":"NY"}','commercial_component',null,null,null,0,null,1,1,status);
 state.db = { prepare(sql:string) { const s=sqlite.prepare(sql); let args:any[]=[]; return { bind(...values:any[]) {args=values;return this;}, async all(){return {results:s.all(...args)};}, async first(){return s.get(...args)||null;} }; } };
 return sqlite;
}
describe('Retail publication boundary', () => {
 beforeEach(() => { state.preview=false; });
 it('does not publish draft or archived retail through listing or direct detail', async () => {
  const sqlite=fixture(); expect((await listPublicRetail()).map(x=>x.slug)).toEqual(['published']);expect(await getPublicRetail('draft')).toBeNull();expect(await getPublicRetail('archived')).toBeNull();expect((await getPublicRetail('published'))?.slug).toBe('published');sqlite.close();
 });
 it('keeps draft review available only in the preview build', async () => {
  const sqlite=fixture();state.preview=true;expect((await getPublicRetail('draft'))?.slug).toBe('draft');expect(await getPublicRetail('archived')).toBeNull();sqlite.close();
 });
});
