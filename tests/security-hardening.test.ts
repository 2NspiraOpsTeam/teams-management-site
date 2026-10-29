import {expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';
import {middleware} from '../src/middleware';
const mocks=vi.hoisted(()=>({db:vi.fn(()=>{throw Error('Database must not be reached');})}));
vi.mock('../src/lib/admin-auth',()=>({adminDb:mocks.db,adminEnv:mocks.db,activeAdmin:mocks.db,currentAdmin:mocks.db,hash:mocks.db,cookieName:'teams_admin_session',sameOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,unauthorized:()=>new Response('{}',{status:401})}));
vi.mock('../src/lib/tenant-auth',()=>({tenantDb:mocks.db,currentTenant:mocks.db,tenantCodeHash:mocks.db,randomHex:mocks.db,tenantCookie:'teams_tenant_session'}));
import {POST as adminLogin} from '../src/lib/admin-code-session';
import {POST as tenantLogin} from '../src/lib/tenant-code-session';
it.each([adminLogin,tenantLogin])('bounds sign-in bodies before parsing or querying, including chunked bodies',async post=>{
 for(const chunked of [false,true]){
  const raw='{"email":"'+ 'x'.repeat(5000)+'"}';
  const body=chunked?new ReadableStream({start(c){c.enqueue(new TextEncoder().encode(raw));c.close();}}):raw;
  const r=new Request('https://site.test/api/session',{method:'POST',headers:{origin:'https://site.test','content-type':'application/json',...(!chunked?{'content-length':String(raw.length)}:{})},body,duplex:'half'} as RequestInit);
  expect((await post(r)).status).toBe(413);
 }
 expect(mocks.db).not.toHaveBeenCalled();
});
it.each([adminLogin,tenantLogin])('rejects cross-origin, malformed and non-JSON sign-in without side effects',async post=>{
 for(const [headers,body,status] of [[{origin:'https://other.test','content-type':'application/json'},'{}',401],[{origin:'https://site.test','content-type':'text/plain'},'{}',415],[{origin:'https://site.test','content-type':'application/json'},'{',400]] as const){expect((await post(new Request('https://site.test/api/session',{method:'POST',headers,body}))).status).toBe(status);}
 const r=await post(new Request('https://site.test/api/session',{method:'POST',headers:{origin:'https://site.test','content-type':'application/json'},body:JSON.stringify({action:'request',email:'invalid'})}));expect(r.status).toBe(200);expect(r.headers.get('cache-control')).toContain('no-store');expect(mocks.db).not.toHaveBeenCalled();
});
it('keeps private/API routes non-indexable and private data uncached without blocking public services',()=>{
 for(const path of ['/admin','/api/admin/session','/api/tenant/session','/tenant/login','/access']){const r=middleware(new NextRequest('https://site.test'+path));expect(r.headers.get('x-robots-tag')).toContain('noindex');expect(r.headers.get('cache-control')).toContain('no-store');expect(r.headers.get('content-security-policy')).toContain("object-src 'none'");}
 const r=middleware(new NextRequest('https://site.test/tenant-services',{headers:{cookie:'teams_feature_visit=0'}}));expect(r.headers.get('x-robots-tag')).toBeNull();expect(r.headers.get('x-frame-options')).toBe('SAMEORIGIN');
});
it('exposes only password sign-in POST to anonymous users, not password management',()=>{
 const post=middleware(new NextRequest('https://site.test/api/admin/password',{method:'POST'}));expect(post.status).toBe(200);expect(post.headers.get('cache-control')).toContain('no-store');
 for(const method of ['GET','PUT'])expect(middleware(new NextRequest('https://site.test/api/admin/password',{method})).status).toBe(404);
});
