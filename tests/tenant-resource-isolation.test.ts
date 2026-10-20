import {expect,it,vi} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import type {D1Database} from '@cloudflare/workers-types';
vi.mock('../src/lib/admin-auth',()=>({adminEnv:()=>({})}));
import {authorized} from '../src/lib/work-orders/server';
import {photoResponse} from '../src/lib/work-orders/photo-response';
it('enforces record/photo ownership, active assignments and building/unit consistency in the actual SQL',async()=>{
 const sql=new DatabaseSync(':memory:');
 sql.exec(`CREATE TABLE units(id TEXT PRIMARY KEY,building_id TEXT); CREATE TABLE tenant_assignments(id TEXT PRIMARY KEY,tenant_id TEXT,unit_id TEXT,building_id TEXT,active INTEGER); CREATE TABLE tenant_maintenance_requests(id TEXT PRIMARY KEY,tenant_id TEXT,assignment_id TEXT); CREATE TABLE work_order_photos(id TEXT PRIMARY KEY,request_id TEXT,mime TEXT,content_base64 TEXT);
 INSERT INTO units VALUES('unit-a','building-a'),('unit-b','building-b');
 INSERT INTO tenant_assignments VALUES('home-a','resident-a','unit-a','building-a',1),('home-b','resident-b','unit-b','building-b',1);
 INSERT INTO tenant_maintenance_requests VALUES('request-a','resident-a','home-a'),('request-b','resident-b','home-b');
 INSERT INTO work_order_photos VALUES('photo-a','request-a','image/png','AQID');`);
 const db={prepare(query:string){let args:any[]=[];const statement={bind(...values:any[]){args=values;return statement;},async first(){return sql.prepare(query).get(...args)??null;}};return statement;}} as unknown as D1Database;
 try{
  expect(await authorized(db,'request-a','resident-a')).toBeTruthy();expect(await authorized(db,'request-a','resident-b')).toBeNull();
  expect((await photoResponse(db,'photo-a','resident-a')).status).toBe(200);expect((await photoResponse(db,'photo-a','resident-b')).status).toBe(404);
  const owner=await photoResponse(db,'photo-a','resident-a');expect(owner.headers.get('cache-control')).toContain('no-store');expect(owner.headers.get('content-security-policy')).toContain('sandbox');expect(new Uint8Array(await owner.arrayBuffer())).toEqual(new Uint8Array([1,2,3]));
  sql.exec("UPDATE tenant_assignments SET active=0 WHERE id='home-a'");expect(await authorized(db,'request-a','resident-a')).toBeNull();expect((await photoResponse(db,'photo-a','resident-a')).status).toBe(404);
  sql.exec("UPDATE tenant_assignments SET active=1,unit_id='unit-b' WHERE id='home-a'");expect(await authorized(db,'request-a','resident-a')).toBeNull();expect((await photoResponse(db,'photo-a','resident-a')).status).toBe(404);
 }finally{sql.close();}
});
