import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {publicImageCache} from '../src/lib/public-image-cache';
const version='a'.repeat(64),request=()=>new Request('https://development.example/api/media/example?v='+version);
let entries:Map<string,Response>;
beforeEach(()=>{vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-19T12:00:00Z'));entries=new Map();vi.stubGlobal('caches',{open:async()=>({match:async(r:Request)=>entries.get(r.url)?.clone(),put:async(r:Request,v:Response)=>{entries.set(r.url,v.clone());}})});});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
it('reuses approved public bytes and expires authorization within 60 seconds, without extending downstream TTL',async()=>{
 let published=true;const load=vi.fn(async()=>published?new Response('photo',{headers:{'Content-Type':'image/png'}}):new Response('Not found',{status:404}));
 expect((await publicImageCache(request(),'release',false,load)).status).toBe(200);published=false;
 await vi.advanceTimersByTimeAsync(40000);const hit=await publicImageCache(request(),'release',false,load);expect(hit.status).toBe(200);expect(hit.headers.get('Cache-Control')).toContain('max-age=20');expect(hit.headers.has('X-Teams-Image-Cached-At')).toBe(false);expect(load).toHaveBeenCalledOnce();
 await vi.advanceTimersByTimeAsync(20001);expect((await publicImageCache(request(),'release',false,load)).status).toBe(404);expect(load).toHaveBeenCalledTimes(2);
});
it('isolates release and preview publication scopes and only caches versioned successful images',async()=>{
 const load=vi.fn(async()=>new Response('photo',{headers:{'Content-Type':'image/png'}}));
 await publicImageCache(request(),'one',false,load);await publicImageCache(request(),'two',false,load);await publicImageCache(request(),'two',true,load);expect(load).toHaveBeenCalledTimes(3);
 const denied=vi.fn(async()=>new Response('Not found',{status:404}));await publicImageCache(request(),'denied',false,denied);await publicImageCache(request(),'denied',false,denied);expect(denied).toHaveBeenCalledTimes(2);
 const unversioned=new Request('https://development.example/api/media/example');await publicImageCache(unversioned,'unversioned',false,load);await publicImageCache(unversioned,'unversioned',false,load);expect(load).toHaveBeenCalledTimes(5);
});
it('falls back to the guarded loader on cache failure',async()=>{
 vi.stubGlobal('caches',{open:async()=>{throw Error('unavailable');}});const load=vi.fn(async()=>new Response('Not found',{status:404}));expect((await publicImageCache(request(),'one',false,load)).status).toBe(404);expect(load).toHaveBeenCalledOnce();
});
