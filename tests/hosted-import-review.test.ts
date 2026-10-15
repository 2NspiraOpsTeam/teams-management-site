import {beforeEach,expect,it,vi} from 'vitest';
const auth=vi.hoisted(()=>({admin:null as any}));
vi.mock('../src/lib/admin-auth',()=>({requireAdmin:async()=>auth.admin,sameOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,unauthorized:()=>new Response('{}',{status:401})}));
import {GET,POST} from '../src/app/api/admin/import-review/route';
beforeEach(()=>{auth.admin=null;});
it('denies anonymous and tenant-only review reads and writes',async()=>{expect((await GET()).status).toBe(401);expect((await POST(new Request('https://example.test/api/admin/import-review',{method:'POST'}))).status).toBe(401);});
it('rejects cross-origin writes before touching D1',async()=>{auth.admin={email:'staff@example.test',db:{}};expect((await POST(new Request('https://example.test/api/admin/import-review',{method:'POST',headers:{origin:'https://evil.test'}}))).status).toBe(401);});
it('does not expose internal loading failures',async()=>{auth.admin={email:'staff@example.test',db:{prepare(){throw Error('private data');}}};const r=await GET();expect(r.status).toBe(503);expect(await r.text()).not.toContain('private data');expect(r.headers.get('cache-control')).toContain('no-store');});
