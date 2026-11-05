import { describe,it,expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import type { D1Database } from '@cloudflare/workers-types';
import { contentPage,defaultContent,validateContent,websitePages } from '@/lib/website-content';
import { mutateContent,readContent,publishedWebsiteContent } from '@/lib/website-content-store';
function fixture(){const sql=new DatabaseSync(':memory:');sql.exec(readFileSync('src/lib/migrations/website-content.sql','utf8'));sql.exec('CREATE TABLE audit_log(id TEXT PRIMARY KEY,action TEXT,entity_type TEXT,entity_id TEXT,record_before_json TEXT,record_after_json TEXT,user_actor TEXT)');
 const prepare=(query:string)=>{let values:unknown[]=[];const statement={bind(...args:unknown[]){values=args;return statement;},async first(){return sql.prepare(query).get(...values as never[])??null;},async all(){return {results:sql.prepare(query).all(...values as never[])};},async run(){const result=sql.prepare(query).run(...values as never[]);return {success:true,meta:{changes:Number(result.changes)}};}};return statement;};
 const db={prepare,async batch(statements:ReturnType<typeof prepare>[]){sql.exec('BEGIN');try{const output=[];for(const stmt of statements)output.push(await stmt.run());sql.exec('COMMIT');return output;}catch(e){sql.exec('ROLLBACK');throw e;}}} as unknown as D1Database;return {db,sql};}
const operation=(action:string,revision:string|null,values?:unknown)=>({action,revision,values,operationId:crypto.randomUUID(),approved:true});
describe('Website Content publication contract',()=>{
 it('keeps FAQ wording editable when saved versions contain retired government-link fields',async()=>{
  const {db,sql}=fixture();
  const legacy={...defaultContent('rent-with-us'),'rent-with-us.text-1':'NYC HPD','rent-with-us.text-7':'NYS HCR','rent-with-us.text-41':'Staff question'};
  const previous={...legacy,'rent-with-us.text-41':'Earlier staff question'};
  sql.prepare('INSERT INTO website_content(page_id,revision,draft_json,published_json,previous_json,updated_by) VALUES(?,?,?,?,?,?)').run('rent-with-us','legacy',JSON.stringify(legacy),JSON.stringify(legacy),JSON.stringify(previous),'qa');
  const loaded=await readContent(db,'rent-with-us');
  expect(loaded.published['rent-with-us.text-41']).toBe('Staff question');
  expect(loaded.published).not.toHaveProperty('rent-with-us.text-1');
  expect(loaded.previous).not.toHaveProperty('rent-with-us.text-7');
  expect(validateContent('rent-with-us',loaded.published)).toEqual(loaded.published);
  const saved=await mutateContent(db,'rent-with-us','qa',operation('save',loaded.revision,{...loaded.published,'rent-with-us.text-41':'Updated question'}));
  expect((await readContent(db,'rent-with-us')).published['rent-with-us.text-41']).toBe('Updated question');
  const restored=await mutateContent(db,'rent-with-us','qa',operation('restore',saved.revision));
  expect(restored.published['rent-with-us.text-41']).toBe('Staff question');
  expect(await publishedWebsiteContent(db)).not.toHaveProperty('rent-with-us.text-1');
 });
 it('removes all government reference anchors and their required editor slots from the FAQ',()=>{
  const source=readFileSync('src/app/rent-with-us/page.tsx','utf8');
  const faq=source.slice(source.indexOf('const faq = ['),source.indexOf('async function RentWithUsPage'));
  expect(faq).not.toMatch(/<a\b|https:\/\//);
  expect(faq.match(/question:/g)).toHaveLength(13);
  for(let number=1;number<=11;number++)expect(defaultContent('rent-with-us')).not.toHaveProperty(`rent-with-us.text-${number}`);
 });
 it('defines unique approved fields and valid defaults on every familiar page',()=>{const keys=websitePages.flatMap(page=>page.fields.map(field=>field.key));expect(new Set(keys).size).toBe(keys.length);for(const page of websitePages){expect(page.fields.length).toBeGreaterThan(0);expect(validateContent(page.id,defaultContent(page.id))).toEqual(defaultContent(page.id));}expect(contentPage('admin')).toBeUndefined();});
 it('rejects blank, partial, extra, markup and overlong text without changing published content',()=>{const initial=defaultContent('home'),key=Object.keys(initial)[0];for(const values of [{...initial,[key]:''},{...initial,[key]:'<script>x</script>'},{...initial,[key]:'x'.repeat(4000)},{...initial,property_address:'duplicate'},{[key]:'partial'}])expect(()=>validateContent('home',values)).toThrow();});
 it('saves directly to public wording and restores the exact previous version atomically',async()=>{const {db,sql}=fixture();const initial=await readContent(db,'home');const values={...initial.published,'home.text-2':'QA revised heading'};const saved=await mutateContent(db,'home','qa@example.test',operation('save',null,values));expect(saved.draft).toEqual(values);expect(saved.published).toEqual(values);expect(saved.previous).toEqual(initial.published);expect((await publishedWebsiteContent(db))['home.text-2']).toBe(values['home.text-2']);const restored=await mutateContent(db,'home','qa@example.test',operation('restore',saved.revision));expect(restored.published).toEqual(initial.published);expect(restored.draft).toEqual(initial.published);expect(restored.previous).toEqual(values);expect(sql.prepare('SELECT count(*) AS total FROM audit_log WHERE user_actor=?').get('qa@example.test')?.total).toBe(2);});
 it('rejects stale updates from a second editor and unknown pages',async()=>{const {db}=fixture(),values=defaultContent('home');const one=await mutateContent(db,'home','qa',operation('save',null,values));await expect(mutateContent(db,'home','other',operation('save',null,{...values,'home.text-2':'Stale'}))).rejects.toThrow('Another admin');expect((await readContent(db,'home')).revision).toBe(one.revision);await expect(mutateContent(db,'unknown','qa',operation('save',null,values))).rejects.toThrow('Unknown');});
 it('makes a lost-response retry idempotent, without a duplicate audit or version flip',async()=>{const {db,sql}=fixture(),values={...defaultContent('home'),'home.text-2':'Changed'};const request=operation('save',null,values);const saved=await mutateContent(db,'home','qa',request);expect(await mutateContent(db,'home','qa',request)).toEqual(saved);expect(saved.previous).toEqual(defaultContent('home'));expect(sql.prepare('SELECT count(*) AS total FROM audit_log').get()?.total).toBe(1);});
 it('removes the publish step and guards recovery',async()=>{const {db}=fixture();await expect(mutateContent(db,'home','qa',operation('restore',null))).rejects.toThrow('no previous');await expect(mutateContent(db,'home','qa',operation('publish',null))).rejects.toThrow('Invalid');const saved=await mutateContent(db,'home','qa',operation('save',null,{...defaultContent('home'),'home.text-2':'Changed'}));await expect(mutateContent(db,'home','qa',{...operation('restore',saved.revision),approved:false})).rejects.toThrow('Review');});
 it('rolls back the content update if audit persistence fails',async()=>{const {db,sql}=fixture();sql.exec("CREATE TRIGGER audit_failure BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'forced audit failure'); END");await expect(mutateContent(db,'home','qa',operation('save',null,defaultContent('home')))).rejects.toThrow('forced audit');expect((await readContent(db,'home')).revision).toBeNull();});
 it('preserves the source-approved site before the additive schema is installed',async()=>{const {db,sql}=fixture();sql.exec('DROP TABLE website_content');expect(await publishedWebsiteContent(db)).toEqual({});});
});
