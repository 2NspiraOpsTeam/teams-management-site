import {expect,it,vi} from 'vitest';
import gateway from '../deployment/preview-gateway/_worker.js';

it.each(['/api/admin/session','/api/tenant/session'])('rejects anonymous session reads without framework, RPC or database work (%s)',async path=>{
 const handleRequest=vi.fn();
 const response=await gateway.fetch(new Request('https://site.test'+path),{TEAMS_RUNTIME:{handleRequest}});
 expect(response.status).toBe(401);
 expect(await response.json()).toEqual({error:'Unauthorized'});
 expect(response.headers.get('cache-control')).toBe('private, no-store');
 expect(response.headers.get('x-content-type-options')).toBe('nosniff');
 expect(handleRequest).not.toHaveBeenCalled();
});
it.each(['/api/admin/properties','/api/admin/operations/tenants'])('retains anonymous API concealment (%s)',async path=>{
 const handleRequest=vi.fn();
 expect((await gateway.fetch(new Request('https://site.test'+path),{TEAMS_RUNTIME:{handleRequest}})).status).toBe(404);
 expect(handleRequest).not.toHaveBeenCalled();
});
it('redirects anonymous Admin pages to same-origin access without replaying queries',async()=>{
 const response=await gateway.fetch(new Request('https://site.test/admin/operations?private=ignored'),{});
 expect(response.status).toBe(307);expect(response.headers.get('location')).toBe('https://site.test/access');
});
it.each(['teams_admin_session=valid','teams_admin_session=','other=x; teams_admin_session=invalid','teams_admin_session="quoted"'])('always delegates present Admin cookies to authoritative validation (%s)',async cookie=>{
 const response=new Response('authoritative denial',{status:401});
 const handleRequest=vi.fn(async()=>response);
 expect(await gateway.fetch(new Request('https://site.test/api/admin/session',{headers:{cookie}}),{TEAMS_RUNTIME:{handleRequest}})).toBe(response);
 expect(handleRequest).toHaveBeenCalledOnce();
});
it('does not confuse Tenant identity with Admin identity',async()=>{
 const handleRequest=vi.fn();
 const response=await gateway.fetch(new Request('https://site.test/api/admin/session',{headers:{cookie:'teams_tenant_session=fixture'}}),{TEAMS_RUNTIME:{handleRequest}});
 expect(response.status).toBe(401);expect(handleRequest).not.toHaveBeenCalled();
});
it.each(['POST','DELETE','OPTIONS'])('does not intercept login, logout or preflight (%s)',async method=>{
 const handleRequest=vi.fn(async()=>new Response('delegated'));
 await gateway.fetch(new Request('https://site.test/api/admin/session',{method}),{TEAMS_RUNTIME:{handleRequest}});
 expect(handleRequest).toHaveBeenCalledOnce();
});
it('returns no body on HEAD',async()=>{
 const response=await gateway.fetch(new Request('https://site.test/api/tenant/session',{method:'HEAD'}),{});
 expect(response.status).toBe(401);expect(await response.text()).toBe('');
});
it.each(['/api/admin/session-extra','/api/tenant/session-extra','/api/admin','/access','/administrator','/tenant/login','/api/public'])('does not broaden session matching or intercept public routes (%s)',async path=>{
 const handleRequest=vi.fn(async()=>new Response('delegated'));
 await gateway.fetch(new Request('https://site.test'+path,{headers:{cookie:'teams_admin_session=fixture'}}),{TEAMS_RUNTIME:{handleRequest}});
 expect(handleRequest).toHaveBeenCalledOnce();
});
