import {beforeEach,expect,it,vi} from 'vitest';
const auth=vi.hoisted(()=>({admin:null as any}));
vi.mock('../src/lib/admin-auth',()=>({requireAdmin:async()=>auth.admin,sameOrigin:(r:Request)=>r.headers.get('origin')===new URL(r.url).origin,unauthorized:()=>new Response('{}',{status:401})}));
import {GET,POST} from '../src/app/api/admin/import-review/route';
beforeEach(()=>{auth.admin=null;});
it('denies anonymous and tenant-only review reads and writes',async()=>{expect((await GET()).status).toBe(401);expect((await POST(new Request('https://example.test/api/admin/import-review',{method:'POST'}))).status).toBe(401);});
it('rejects cross-origin writes before touching D1',async()=>{auth.admin={email:'staff@example.test',db:{}};expect((await POST(new Request('https://example.test/api/admin/import-review',{method:'POST',headers:{origin:'https://evil.test'}}))).status).toBe(401);});
it('does not expose internal loading failures',async()=>{auth.admin={email:'staff@example.test',db:{prepare(){throw Error('private data');}}};const r=await GET();expect(r.status).toBe(503);expect(await r.text()).not.toContain('private data');expect(r.headers.get('cache-control')).toContain('no-store');});
it('reloads authenticated shared history without SQLite LIKE-pattern limits',async()=>{
 const {sha}=await import('../src/lib/operations/import-review');
 const payload={format:'teams-import-review-1',baseline_sha256:'synthetic',inventory_sha256:'synthetic',summary:{},properties:[{id:'p',name:'Synthetic'}],aliases:[{property_map_key:'m'}],records:[{record_id:'r',decision:'review'}],repeat_groups:[],source_archive:[],candidate_approval_enabled:false,import_enabled:false};
 const bundle={...payload,bundle_sha256:await sha(payload)};
 const event={sequence:1,at:'2026-10-15T00:00:00Z',key:'alias:m',before:null,after:{outcome:'hold',property_id:'',note:'Confirm source',reviewer:'staff@example.test'}};
 const queries:string[]=[];
 auth.admin={email:'staff@example.test',db:{prepare(sql:string){queries.push(sql);if(sql.includes(' LIKE '))throw Error('LIKE pattern too complex');return {bind(){return {all:async()=>({results:sql.includes('bundle_chunk')?[{record_after_json:JSON.stringify({text:JSON.stringify(bundle)})}]:[{record_after_json:JSON.stringify(event)}]})};}};}}};
 const r=await GET();expect(r.status).toBe(200);expect((await r.json()).draft.events).toEqual([event]);expect(queries[1]).toContain('entity_id >= ?');
});
