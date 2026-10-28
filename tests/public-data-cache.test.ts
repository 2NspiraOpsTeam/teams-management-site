import {afterEach,expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({release:'test-release'}));
vi.mock('@opennextjs/cloudflare',()=>({getCloudflareContext:()=>({env:{TEAMS_RELEASE_SHA:state.release}})}));
import {publicDataCache} from '../src/lib/public-data-cache';
afterEach(()=>{vi.unstubAllGlobals();state.release='test-release';});
it('caches only explicit public projections under a release-specific namespace',async()=>{
 const saved=new Map();const match=vi.fn(async(request:Request)=>saved.get(request.url)?.clone());const put=vi.fn(async(request:Request,response:Response)=>{expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');saved.set(request.url,response);});vi.stubGlobal('caches',{open:async()=>({match,put})});
 const load=vi.fn(async()=>[{name:'Public building'}]);
 await publicDataCache('published-buildings',load);await publicDataCache('published-buildings',load);expect(load).toHaveBeenCalledOnce();
 state.release='next-release';await publicDataCache('published-buildings',load);expect(load).toHaveBeenCalledTimes(2);
});
it('does not cache failures or share development data',async()=>{
 state.release='';const open=vi.fn();vi.stubGlobal('caches',{open});const load=vi.fn(async()=>[]);await publicDataCache('public-retail',load);expect(open).not.toHaveBeenCalled();
});
