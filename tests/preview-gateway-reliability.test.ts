import {afterEach,expect,it,vi} from 'vitest';
import gateway from '../deployment/preview-gateway/_worker.js';
afterEach(()=>vi.restoreAllMocks());
it('contains asynchronous backend failure without retrying a potentially committed write or leaking secrets',async()=>{
 const log=vi.spyOn(console,'error').mockImplementation(()=>{});
 const handleRequest=vi.fn(async()=>{throw new Error('private credential and tenant data');});
 const request=new Request('https://site.test/api/tenant/session?private=value',{method:'POST',body:'private',headers:{cookie:'secret'}});
 const response=await gateway.fetch(request,{TEAMS_RUNTIME:{handleRequest},GOOGLE_CLIENT_SECRET:'secret'});
 expect(response.status).toBe(503);
 expect(response.headers.get('cache-control')).toBe('private, no-store');
 expect(response.headers.get('retry-after')).toBe('30');
 expect(handleRequest).toHaveBeenCalledTimes(1);
 expect(await response.text()).not.toContain('private');
 expect(log.mock.calls).toEqual([[JSON.stringify({event:'teams_runtime_unavailable',method:'POST'})]]);
});
it('fails closed with no binding',async()=>{
 const response=await gateway.fetch(new Request('https://site.test/'),{});
 expect(response.status).toBe(503);expect(response.headers.get('cache-control')).toContain('no-store');
});
it('preserves successful authentication response, cookies and private caching policy',async()=>{
 const expected=new Response('{}',{headers:{'set-cookie':'session=opaque; Secure; HttpOnly','cache-control':'private, no-store'}});
 const handleRequest=vi.fn(async()=>expected);
 const response=await gateway.fetch(new Request('https://site.test/api/admin/session'),{TEAMS_RUNTIME:{handleRequest},GOOGLE_CLIENT_SECRET:'configured',UNRELATED:'not-forwarded'});
 expect(response).toBe(expected);
 expect(handleRequest.mock.calls[0][1]).toEqual({GOOGLE_CLIENT_SECRET:'configured'});
});
