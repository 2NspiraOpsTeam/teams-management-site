import { createRequire } from 'node:module';
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite');
import { readFileSync } from 'node:fs';
import { describe,it,expect } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { appendUploadedGallery,presentationCandidates,presentationState,savePresentation,validPresentation,type PresentationInput } from '../src/lib/media-presentation';
import { propertyMedia,propertyUnitMedia } from '../src/lib/media-management';
import { eligibleShowcases } from '../src/lib/page-showcase';
import { approvedRetailGallery } from '../src/lib/retail-profile';
function fixture(){
 const sql=new DatabaseSync(':memory:');
 for(const file of ['schema.sql','retail-profiles.sql'])sql.exec(readFileSync('src/lib/migrations/'+file,'utf8'));
 sql.exec(readFileSync('src/lib/migrations/media-management.sql','utf8').split(/^INSERT /m)[0]);
 sql.exec(`INSERT INTO buildings(id,name,slug,address_json,publication_state) VALUES ('b','QA property','qa','{}','published'),('other','Other','other','{}','published'); INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES ('u','b','QA',1);`);
 for(const [id,visibility,unit,building,published] of [['a','public',null,'b',1],['b','public',null,'b',1],['private','internal',null,'b',1],['unpublished','public',null,'b',0],['unit','public','u','b',1],['foreign','public',null,'other',1]] as const){sql.prepare('INSERT INTO media_assets(id,storage_key,file_type,visibility) VALUES (?,?,?,?)').run(id,'uploads/'+id+'.jpg','image/jpeg',visibility);sql.prepare('INSERT INTO media_assignments(id,asset_id,building_id,unit_id,is_cover,order_index) VALUES (?,?,?,?,?,?)').run(id,id,building,unit,id==='a'?1:0,id==='b'?1:0);sql.prepare('INSERT INTO media_publications(assignment_id,published) VALUES (?,?)').run(id,published);}
 sql.exec("INSERT INTO retail_media_approvals VALUES ('b','b','storefront',1,0)");
 const migration=readFileSync('src/lib/migrations/media-presentation-contexts.sql','utf8');sql.exec(migration);
 const prepare=(query:string)=>{let args:unknown[]=[];const statement={bind(...v:unknown[]){args=v;return statement;},async all(){return {results:sql.prepare(query).all(...args as never[])};},async first(){return sql.prepare(query).get(...args as never[])||null;},async run(){const r=sql.prepare(query).run(...args as never[]);return {meta:{changes:Number(r.changes)}};}};return statement;};
 const db={prepare,async batch(statements:ReturnType<typeof prepare>[]){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}} as unknown as D1Database;
 const input=(context:'residential'|'retail',cover:string|null,gallery:string[],revision=0):PresentationInput=>({context,cover_asset_id:cover,fallback_to_property_cover:false,revision,gallery:gallery.map(asset_id=>({asset_id,kind:'storefront'}))});
 return {sql,db,input,migration};
}
describe('independent property media presentations',()=>{
 it('preserves legacy covers/galleries and seeds idempotently without restoring removed selections',async()=>{const {db,sql,migration,input}=fixture();expect((await eligibleShowcases(db)).find(x=>x.property_id==='b')?.media_asset_id).toBe('a');expect((await approvedRetailGallery(db,'b'))).toHaveLength(1);await savePresentation(db,'b',input('retail',null,[]));sql.exec(migration);expect((await presentationState(db,'b')).contexts.retail.gallery).toEqual([]);expect(sql.prepare('SELECT COUNT(*) n FROM media_assets').get()?.n).toBe(6);});
 it('appends explicit upload sections without erasing existing covers or order; repeat upload is idempotent and old editors conflict',async()=>{
  const {db,input}=fixture();
  await appendUploadedGallery(db,'b','b',['residential','retail']);
  let state=await presentationState(db,'b');
  expect(state.contexts.residential.cover_asset_id).toBe('a');
  expect(state.contexts.residential.gallery.map(x=>x.asset_id)).toEqual(['a','b']);
  expect(state.contexts.residential.revision).toBe(0); // already in that gallery
  expect(state.contexts.retail.revision).toBe(0);
  await appendUploadedGallery(db,'b','a',['retail']);
  state=await presentationState(db,'b');
  expect(state.contexts.retail.gallery.map(x=>x.asset_id)).toEqual(['b','a']);
  expect(state.contexts.retail.revision).toBe(1);
  expect(await savePresentation(db,'b',input('retail',null,[],0))).toBe(false);
  await appendUploadedGallery(db,'b','a',['retail']);
  expect((await presentationState(db,'b')).contexts.retail).toEqual(state.contexts.retail);
 });
 it('registers all 29 existing website photos once, keeps apartment photos unit-scoped, and does not resurrect later removals',async()=>{
  const {sql,db}=fixture();
  sql.exec("INSERT INTO buildings(id,name,slug,address_json,publication_state) VALUES ('sarasota','The Pearl','609-golden-gate-pt','{}','published'),('east110','71 E 110th','71-e-110th-st','{}','published'); INSERT INTO units(id,building_id,unit_identifier,floor_number) VALUES ('unit1b','east110','1B',1),('unitpha','east110','PHA',6);");
  const migration=readFileSync('src/lib/migrations/existing-website-photos.sql','utf8');
  sql.exec(migration);
  expect((await presentationCandidates(db,'sarasota'))).toHaveLength(19);
  expect((await propertyMedia(db,'609-golden-gate-pt'))).toHaveLength(19);
  expect((await propertyUnitMedia(db,'71-e-110th-st'))).toHaveLength(10);
  expect((await presentationCandidates(db,'east110'))).toHaveLength(0);
  const photo='website-609-golden-gate-pt-property-01';
  sql.prepare('DELETE FROM media_presentation_gallery WHERE asset_id=?').run(photo);
  sql.exec(migration);
  expect((await presentationState(db,'sarasota')).contexts.residential.gallery).toHaveLength(18);
  expect(sql.prepare("SELECT COUNT(*) n FROM media_assets WHERE uploaded_by='website-import'").get()?.n).toBe(29);
 });
 it('allows one asset as both covers and in both galleries, without duplicate files',async()=>{const {db,input,sql}=fixture();await savePresentation(db,'b',input('residential','a',['a']));await savePresentation(db,'b',input('retail','a',['a']));const state=await presentationState(db,'b');expect(state.contexts.retail.cover_asset_id).toBe('a');expect(state.contexts.residential.gallery).toEqual([{asset_id:'a',kind:'storefront'}]);expect(sql.prepare('SELECT COUNT(*) n FROM media_assets').get()?.n).toBe(6);});
 it('changes retail cover, gallery membership and order without changing residential',async()=>{const {db,input}=fixture();await savePresentation(db,'b',input('retail','b',['b','a']));expect((await eligibleShowcases(db,true,'retail')).find(x=>x.property_id==='b')?.media_asset_id).toBe('b');expect((await eligibleShowcases(db)).find(x=>x.property_id==='b')?.media_asset_id).toBe('a');expect((await approvedRetailGallery(db,'b')).map(x=>x.src)).toEqual(['/api/media/b','/api/media/a']);expect((await propertyMedia(db,'qa')).map(x=>x.id)).toEqual(['a','b']);});
 it('allows an approved deliverable gallery asset to become a cover without upload',async()=>{const {db,sql,input}=fixture();sql.exec("UPDATE media_assets SET storage_key='/preview-properties/1365-1st-ave/image-01.jpg' WHERE id='b'");await savePresentation(db,'b',input('retail','b',['b']));expect((await eligibleShowcases(db,true,'retail')).find(x=>x.property_id==='b')?.storage_key).toBe('/preview-properties/1365-1st-ave/image-01.jpg');});
 it('keeps a cover-only selection out of the Residential gallery and honors gallery order',async()=>{const {db,input}=fixture();await savePresentation(db,'b',input('residential','a',['b']));let media=await propertyMedia(db,'qa');expect(media.find(x=>x.id==='a')?.in_gallery).toBe(0);expect(media.filter(x=>x.in_gallery).map(x=>x.id)).toEqual(['b']);await savePresentation(db,'b',input('residential','a',['b','a'],1));media=await propertyMedia(db,'qa');expect(media.filter(x=>x.in_gallery).map(x=>x.id)).toEqual(['b','a']);});
 it('honors explicit retail fallback and never picks a gallery photo as an unselected cover',async()=>{const {db,input}=fixture();await savePresentation(db,'b',input('retail',null,['b']));expect((await eligibleShowcases(db,true,'retail')).find(x=>x.property_id==='b')).toBeUndefined();await savePresentation(db,'b',{...input('retail',null,['b'],1),fallback_to_property_cover:true});expect((await eligibleShowcases(db,true,'retail')).find(x=>x.property_id==='b')?.media_asset_id).toBe('a');});
 it('excludes private, unpublished, unit-only, foreign and revoked images',async()=>{const {db,sql,input}=fixture();expect((await presentationCandidates(db,'b')).map(x=>x.id)).toEqual(['a','b']);await savePresentation(db,'b',input('retail','b',['b']));sql.exec("UPDATE media_assets SET visibility='internal' WHERE id='b'");expect(await approvedRetailGallery(db,'b')).toEqual([]);expect((await eligibleShowcases(db,true,'retail')).find(x=>x.property_id==='b')).toBeUndefined();});
 it('rejects stale and double-submit writes without partially erasing the gallery',async()=>{const {db,input}=fixture();expect(await savePresentation(db,'b',input('retail','b',['b','a']))).toBe(true);expect(await savePresentation(db,'b',input('retail','a',[]))).toBe(false);const s=(await presentationState(db,'b')).contexts.retail;expect(s.cover_asset_id).toBe('b');expect(s.gallery.map(x=>x.asset_id)).toEqual(['b','a']);expect(s.revision).toBe(1);});
 it('rolls back every context write if a gallery insert fails',async()=>{const {db,input}=fixture();await expect(savePresentation(db,'b',input('retail','a',['missing']))).rejects.toThrow();const s=(await presentationState(db,'b')).contexts.retail;expect(s.revision).toBe(0);expect(s.gallery.map(x=>x.asset_id)).toEqual(['b']);});
 it('validates malformed selections, duplicates and context values',()=>{const {input}=fixture();expect(validPresentation(input('retail','a',['a']))).toBe(true);for(const value of [{...input('retail','a',['a','a'])},{...input('retail','a',[]),context:'unit'},{...input('residential','a',[]),fallback_to_property_cover:true},{...input('retail','a',[]),revision:0.5},{...input('retail','a',[]),gallery:[{asset_id:'a',kind:'unknown'}]}])expect(validPresentation(value)).toBe(false);});
 it('does not emit archived-property image URLs publicly while retaining Admin library access',async()=>{
  const {db,sql}=fixture();
  expect((await propertyMedia(db,'qa')).map(x=>x.id)).toEqual(['a','b']);
  expect(await propertyUnitMedia(db,'qa')).toHaveLength(1);
  sql.exec("UPDATE buildings SET publication_state='archived' WHERE id='b'");
  expect(await propertyMedia(db,'qa')).toEqual([]);
  expect(await propertyUnitMedia(db,'qa')).toEqual([]);
  expect((await propertyMedia(db,'qa',true)).map(x=>x.id)).toEqual(expect.arrayContaining(['a','b','private','unpublished','unit']));
  expect(sql.prepare('SELECT COUNT(*) n FROM media_assignments').get()?.n).toBe(6);
 });

});
