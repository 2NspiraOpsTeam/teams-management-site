/// <reference types="vite/client" />
import { expect, it, vi } from 'vitest';
const guard=vi.hoisted(()=>({db:vi.fn(()=>{throw Error('Unauthorized request reached database');})}));
vi.mock('../src/lib/admin-auth',()=>({
  requireAdmin:async()=>null,currentAdmin:async()=>null,activeAdmin:guard.db,
  adminDb:guard.db,adminEnv:()=>({PROPERTY_OPERATIONS_ENABLED:'1',TENANT_LEASES_ENABLED:'1'}),
  sameOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,
  unauthorized:()=>new Response('{}',{status:401}),cookieName:'teams_admin_session',
  hash:guard.db,audit:guard.db,
}));
vi.mock('../src/lib/tenant-auth',()=>({currentTenant:async()=>null,tenantDb:guard.db,tenantCookie:'teams_tenant_session',tenantCodeHash:guard.db,randomHex:guard.db}));
const routes=import.meta.glob('../src/app/api/{admin,tenant}/**/route.ts');
for(const [path,load] of Object.entries(routes)){
  if(path.endsWith('/session/route.ts'))continue; // Separate sign-in contract suite.
  it(`denies missing sessions despite forged role cookies before D1: ${path}`,async()=>{
    const module=await load() as Record<string,Function>;
    for(const [method,handler] of Object.entries(module)){
      if(!['GET','POST','PUT','PATCH','DELETE'].includes(method))continue;
      const url='https://site.test/'+path.split('../src/app/')[1].replace('/route.ts','');
      const request=new Request(url,{method,headers:{origin:'https://site.test','content-type':'application/json',cookie:'teams_admin_session=forged; teams_tenant_session=forged'},...(!['GET','HEAD'].includes(method)?{body:'{}'}:{})});
      const response=await handler(request,{params:Promise.resolve({id:'00000000-0000-4000-8000-000000000001',page:'home',path:['overview']})});
      expect([401,403,404],`${method} ${path}`).toContain(response.status);
    }
    expect(guard.db).not.toHaveBeenCalled();
  });
}
