import {expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({db:{prepare:vi.fn(()=>{throw Error('Must reject before database');})}}));
vi.mock('../src/lib/admin-auth',()=>({requireAdmin:async()=>({email:'qa@example.test',db:state.db}),sameOrigin:()=>true,unauthorized:()=>new Response('{}',{status:401})}));
import {POST as content} from '../src/app/api/admin/website-content/[page]/route';
import {POST as review} from '../src/app/api/admin/import-review/route';
it.each([[content,100000],[review,12000]] as const)('bounds authenticated streams even without Content-Length',async(post,limit)=>{
  let cancelled=false;
  const stream=new ReadableStream({pull(c){c.enqueue(new Uint8Array(limit+1));},cancel(){cancelled=true;}});
  const r=await post(new Request('https://site.test/api/admin/test',{method:'POST',headers:{origin:'https://site.test','content-type':'application/json'},body:stream,duplex:'half'} as RequestInit),{params:Promise.resolve({page:'home'})});
  expect(r.status).toBe(413);expect(cancelled).toBe(true);expect(state.db.prepare).not.toHaveBeenCalled();
});
