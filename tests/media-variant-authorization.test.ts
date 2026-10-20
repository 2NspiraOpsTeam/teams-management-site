import {expect,it,vi} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import type {D1Database} from '@cloudflare/workers-types';
import {mediaResponse} from '../src/lib/media-response';
import {privatePhotoPath} from '../deployment/preview-runtime/private-photo-path.mjs';
it('checks live publication before loading prepared bytes and denies revoked, private and wrong-version sources',async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE media_assets(id TEXT,storage_key TEXT,file_type TEXT,visibility TEXT,checksum TEXT);CREATE TABLE media_assignments(id TEXT,asset_id TEXT,building_id TEXT,unit_id TEXT);CREATE TABLE media_publications(assignment_id TEXT,published INTEGER);CREATE TABLE buildings(id TEXT,publication_state TEXT,slug TEXT);CREATE TABLE units(id TEXT,building_id TEXT);CREATE TABLE media_home_assignments(asset_id TEXT,published INTEGER);CREATE TABLE dining_venues(id TEXT,property_id TEXT,hero_media_asset_id TEXT,publication_state TEXT);CREATE TABLE dining_venue_photos(venue_id TEXT,asset_id TEXT);
 INSERT INTO media_assets VALUES('photo','source-key','image/png','public','checksum');INSERT INTO buildings VALUES('b','published','qa');INSERT INTO media_assignments VALUES('assignment','photo','b',NULL);INSERT INTO media_publications VALUES('assignment',1);`);
 const db={prepare(query:string){let args:any[]=[];const s={bind(...values:any[]){args=values;return s;},async first(){return sql.prepare(query).get(...args)??null;}};return s;}} as unknown as D1Database;
 const load=vi.fn(async()=>new Response('prepared bytes',{headers:{'Content-Type':'image/webp'}}));
 try{
  expect((await mediaResponse(db,'photo',false,false,undefined,load)).status).toBe(200);expect(load).toHaveBeenCalledOnce();load.mockClear();
  sql.exec('UPDATE media_publications SET published=0');expect((await mediaResponse(db,'photo',false,false,undefined,load)).status).toBe(404);expect(load).not.toHaveBeenCalled();
  sql.exec("UPDATE media_publications SET published=1;UPDATE media_assets SET visibility='internal'");expect((await mediaResponse(db,'photo',false,false,undefined,load)).status).toBe(404);expect(load).not.toHaveBeenCalled();
  sql.exec("UPDATE media_assets SET visibility='public'");expect((await mediaResponse(db,'photo',false,false,'stale-version',load)).status).toBe(404);expect(load).not.toHaveBeenCalled();
 }finally{sql.close();}
});
it.each(['/_photo-variants/hash.webp','/%5fphoto-variants/hash.webp','//_photo-variants/hash.webp','/%255fphoto-variants/hash.webp','/_photo-variants%2fhash.webp'])('blocks direct/encoded requests to guarded-only bytes: %s',path=>expect(privatePhotoPath(path)).toBe(true));
it('does not block ordinary assets or the existing guarded API',()=>{expect(privatePhotoPath('/photo-variants/logo.webp')).toBe(false);expect(privatePhotoPath('/api/media/example')).toBe(false);});
