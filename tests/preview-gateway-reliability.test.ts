import {afterEach,expect,it,vi} from 'vitest';
import gateway, {publicLogoVariants} from '../deployment/preview-gateway/_worker.js';
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
 expect(JSON.parse(log.mock.calls[0][0])).toEqual({event:'teams_runtime_unavailable',method:'POST',family:'tenant-api',requestId:response.headers.get('x-teams-request-id')});
});
it('fails closed with no binding',async()=>{
 const response=await gateway.fetch(new Request('https://site.test/'),{});
 expect(response.status).toBe(503);expect(response.headers.get('cache-control')).toContain('no-store');
});
it('preserves successful authentication response, cookies and private caching policy',async()=>{
 const expected=new Response('{}',{headers:{'set-cookie':'session=opaque; Secure; HttpOnly','cache-control':'private, no-store'}});
 const handleRequest=vi.fn(async(_request:Request,_configuration:Record<string,string>)=>expected);
 const response=await gateway.fetch(new Request('https://site.test/api/admin/session',{headers:{cookie:'teams_admin_session=fixture'}}),{TEAMS_RUNTIME:{handleRequest},GOOGLE_CLIENT_SECRET:'configured',UNRELATED:'not-forwarded'});
 expect(response).toBe(expected);
 expect(handleRequest.mock.calls[0][1]).toEqual({GOOGLE_CLIENT_SECRET:'configured'});
});

it('serves repeat anonymous news HTML without invoking the backend twice',async()=>{
 const entries=new Map();
 const cache={match:vi.fn(async key=>entries.get(key.url)?.clone()),put:vi.fn(async(key,response)=>{entries.set(key.url,response);})};
 vi.stubGlobal('caches',{open:async()=>cache});
 const handleRequest=vi.fn(async()=>new Response('<html>Public news</html>',{headers:{'content-type':'text/html','cache-control':'private, no-store','vary':'RSC, Next-Router-State-Tree, Accept-Encoding','x-teams-request-id':'old'}}));
 const request=()=>new Request('https://site.test/in-the-news',{headers:{accept:'text/html'}});
 const first=await gateway.fetch(request(),{TEAMS_RUNTIME:{handleRequest}});
 expect(first.headers.get('x-teams-public-cache')).toBe('MISS');
 const second=await gateway.fetch(request(),{TEAMS_RUNTIME:{handleRequest}});
 expect(second.headers.get('x-teams-public-cache')).toBe('HIT');
 expect(second.headers.get('cache-control')).toBe('private, no-store');
 expect(second.headers.has('x-teams-request-id')).toBe(false);
 expect(await second.text()).toBe('<html>Public news</html>');
 expect(handleRequest).toHaveBeenCalledTimes(1);
 expect(cache.put.mock.calls[0][1].headers.get('cache-control')).toBe('public, max-age=60');
 vi.unstubAllGlobals();
});
it('never shares cookie, authorization, RSC, query, mutation, refresh or private-route requests',async()=>{
 const open=vi.fn();vi.stubGlobal('caches',{open});
 const handleRequest=vi.fn(async()=>new Response('ok'));
 for(const [path,method,headers] of [
  ['/in-the-news','GET',{cookie:'session=private'}],['/in-the-news','GET',{authorization:'Bearer private'}],
  ['/in-the-news','GET',{rsc:'1'}],['/in-the-news','GET',{'next-router-state-tree':'private'}],
  ['/in-the-news','GET',{'cache-control':'no-cache'}],['/in-the-news?search=private','GET',{}],
  ['/in-the-news','POST',{}],['/api/admin/session','GET',{cookie:'teams_admin_session=fixture'}],['/tenant','GET',{}],['/properties','GET',{}],
 ] as const){await gateway.fetch(new Request('https://site.test'+path,{method,headers:{accept:'text/html',...headers}}),{TEAMS_RUNTIME:{handleRequest}});}
 expect(open).not.toHaveBeenCalled();expect(handleRequest).toHaveBeenCalledTimes(10);
 vi.unstubAllGlobals();
});
it.each([
 [200,{'content-type':'text/html','set-cookie':'session=private'}],
 [503,{'content-type':'text/html'}],
 [200,{'content-type':'application/json'}],
 [200,{'content-type':'text/html','vary':'Cookie'}],
 [200,{'content-type':'text/html','vary':'*'}],
])('does not cache unsafe or failed responses (%s)',async(status,headers)=>{
 const put=vi.fn();vi.stubGlobal('caches',{open:async()=>({match:async()=>undefined,put})});
 await gateway.fetch(new Request('https://site.test/in-the-news',{headers:{accept:'text/html'}}),{TEAMS_RUNTIME:{handleRequest:async()=>new Response('test',{status,headers})}});
 expect(put).not.toHaveBeenCalled();vi.unstubAllGlobals();
});
it('cache outages preserve one backend invocation and its response',async()=>{
 vi.stubGlobal('caches',{open:async()=>{throw Error('cache down');}});
 const handleRequest=vi.fn(async()=>new Response('ok'));
 const response=await gateway.fetch(new Request('https://site.test/in-the-news',{headers:{accept:'text/html'}}),{TEAMS_RUNTIME:{handleRequest}});
 expect(await response.text()).toBe('ok');expect(handleRequest).toHaveBeenCalledTimes(1);vi.unstubAllGlobals();
});
it.each(['/_next/static/chunks/hashed.js','/images/news/clipping.webp','/brand/logo.png','/documents/news/clipping.pdf'])('serves public static assets without starting the backend (%s)',async path=>{
 const handleRequest=vi.fn();const asset=new Response('public');
 expect(await gateway.fetch(new Request('https://site.test'+path),{ASSETS:{fetch:async()=>asset},TEAMS_RUNTIME:{handleRequest}})).toBe(asset);
 expect(handleRequest).not.toHaveBeenCalled();
});
it.each(['/photo-variants/not-a-logo.webp','/_photo-variants/private.webp','/api/media/private','/api/admin/media/private','/tenant/lease.pdf'])('never uses direct assets for private or publication-gated paths (%s)',async path=>{
 const fetch=vi.fn();const handleRequest=vi.fn(async()=>new Response('guarded',{status:401}));
 expect((await gateway.fetch(new Request('https://site.test'+path,{headers:{cookie:'teams_admin_session=fixture'}}),{ASSETS:{fetch},TEAMS_RUNTIME:{handleRequest}})).status).toBe(401);
 expect(fetch).not.toHaveBeenCalled();
});
it('falls back once for a missing newer static chunk',async()=>{
 const handleRequest=vi.fn(async()=>new Response('new chunk'));
 const response=await gateway.fetch(new Request('https://site.test/_next/static/new.js'),{ASSETS:{fetch:async()=>new Response('missing',{status:404})},TEAMS_RUNTIME:{handleRequest}});
 expect(await response.text()).toBe('new chunk');expect(handleRequest).toHaveBeenCalledTimes(1);
});

it.each([...publicLogoVariants])('delivers public logo derivative from gateway branding assets (%s)',async file=>{
 const handleRequest=vi.fn();const fetch=vi.fn(async(request:Request)=>{expect(new URL(request.url).pathname).toBe('/brand/variants/'+file);return new Response('logo',{headers:{'Content-Type':'image/webp'}});});
 const response=await gateway.fetch(new Request('https://site.test/photo-variants/'+file),{ASSETS:{fetch},TEAMS_RUNTIME:{handleRequest}});
 expect(await response.text()).toBe('logo');expect(response.headers.get('Content-Type')).toBe('image/webp');expect(handleRequest).not.toHaveBeenCalled();
});
it('retains runtime fallback when a public logo derivative is absent',async()=>{
 const file=[...publicLogoVariants][0];const handleRequest=vi.fn(async()=>new Response('fallback'));
 expect(await (await gateway.fetch(new Request('https://site.test/photo-variants/'+file),{ASSETS:{fetch:async()=>new Response('missing',{status:404})},TEAMS_RUNTIME:{handleRequest}})).text()).toBe('fallback');
 expect(handleRequest).toHaveBeenCalledTimes(1);
});
