import {afterEach,expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({release:'cover-test',preview:true}));
vi.mock('@opennextjs/cloudflare',()=>({getCloudflareContext:()=>({env:{TEAMS_RELEASE_SHA:state.release}})}));
vi.mock('../src/lib/preview-portfolio',()=>({get previewPortfolioEnabled(){return state.preview;}}));
vi.mock('../src/lib/page-showcase',()=>({eligibleShowcases:vi.fn(async(_db,_covers,context,explicit)=>[{property_slug:context,media_asset_id:explicit?'explicit':'fallback'}])}));
import {eligibleShowcases} from '../src/lib/page-showcase';
import {publicShowcases} from '../src/lib/public-showcases';
import type {D1Database} from '@cloudflare/workers-types';
const db={} as D1Database;
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();state.release='cover-test';state.preview=true;});
it('reuses approved selections without mixing context, selection rules, publication scope or releases',async()=>{
 const saved=new Map<string,Response>();vi.stubGlobal('caches',{open:async()=>({match:async(r:Request)=>saved.get(r.url)?.clone(),put:async(r:Request,v:Response)=>{expect(v.headers.get('Cache-Control')).toBe('public, max-age=60');saved.set(r.url,v);}})});
 const first=await publicShowcases(db);expect(await publicShowcases(db)).toEqual(first);expect(eligibleShowcases).toHaveBeenCalledTimes(1);
 expect((await publicShowcases(db,true,'retail'))[0].property_slug).toBe('retail');
 expect((await publicShowcases(db,true,'retail',true))[0].media_asset_id).toBe('explicit');
 await publicShowcases(db,false);state.preview=false;await publicShowcases(db);state.release='new-release';await publicShowcases(db);
 expect(eligibleShowcases).toHaveBeenCalledTimes(6);
});
it('falls back to guarded database queries when cache fails and does not share local fixtures',async()=>{
 vi.stubGlobal('caches',{open:async()=>{throw Error('cache unavailable');}});await publicShowcases(db);expect(eligibleShowcases).toHaveBeenCalledTimes(1);
 state.release='';await publicShowcases(db);await publicShowcases(db);expect(eligibleShowcases).toHaveBeenCalledTimes(3);
});
