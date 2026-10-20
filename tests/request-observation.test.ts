import {expect,it} from 'vitest';
import {observeRequest} from '../deployment/preview-runtime/request-observation.mjs';
it('contains runtime errors and emits a correlatable classification without sensitive error/request data',async()=>{
 const events:string[]=[];
 const r=await observeRequest(new Request('https://site.test/api/tenant/session?email=private',{method:'POST',headers:{cookie:'secret','x-teams-request-id':'attacker'}}),'release',async()=>{throw Error('secret database error and private email');},(e:string)=>events.push(e));
 expect(r.status).toBe(503);expect(r.headers.get('cache-control')).toContain('no-store');
 expect((await r.json()).requestId).toBe(r.headers.get('x-teams-request-id'));
 expect(events).toHaveLength(1);expect(JSON.parse(events[0])).toMatchObject({event:'teams_server_failure',family:'tenant-api',status:503});
 for(const sensitive of ['secret','private','email','attacker'])expect(events[0]).not.toContain(sensitive);
});
it('observes returned 500s and invalid login POSTs but not normal anonymous GETs',async()=>{
 const events:string[]=[];
 for(const [method,status] of [['GET',401],['POST',401],['GET',500]] as const){
  const r=await observeRequest(new Request('https://site.test/api/admin/session',{method}),'release',async()=>new Response('{}',{status}), (e:string)=>events.push(e));expect(r.status).toBe(status);
 }
 expect(events.map(e=>JSON.parse(e).event)).toEqual(['teams_login_rejected','teams_server_failure']);
});
