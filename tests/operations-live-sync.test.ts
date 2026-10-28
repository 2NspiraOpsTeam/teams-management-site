import {afterEach,beforeEach,expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({cleanups:[] as (()=>void)[]}));
vi.mock('react',()=>({useRef:(value:unknown)=>({current:value}),useEffect:(effect:()=>void|(()=>void))=>{const cleanup=effect();if(cleanup)state.cleanups.push(cleanup);}}));
import {useOperationsRefresh} from '../src/components/operations/live-sync';
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('window',new EventTarget());vi.stubGlobal('document',Object.assign(new EventTarget(),{visibilityState:'visible'}));vi.stubGlobal('BroadcastChannel',undefined);});
afterEach(()=>{state.cleanups.splice(0).forEach(fn=>fn());vi.useRealTimers();vi.unstubAllGlobals();});
it('does not poll while idle; shares one initial check and refreshes changed data on focus',async()=>{
 let version=1;const fetch=vi.fn(async()=>({ok:true,json:async()=>({version})}));vi.stubGlobal('fetch',fetch);const first=vi.fn(),second=vi.fn();useOperationsRefresh(first);useOperationsRefresh(second);
 await vi.advanceTimersByTimeAsync(0);expect(fetch).toHaveBeenCalledTimes(1);expect(first).not.toHaveBeenCalled();
 await vi.advanceTimersByTimeAsync(30000);expect(fetch).toHaveBeenCalledTimes(1);expect(first).not.toHaveBeenCalled();expect(second).not.toHaveBeenCalled();
 version=2;window.dispatchEvent(new Event('focus'));await vi.advanceTimersByTimeAsync(150);expect(first).toHaveBeenCalledTimes(1);expect(second).toHaveBeenCalledTimes(1);expect(fetch).toHaveBeenCalledTimes(2);
});
it('does not poll or replace a disabled editor draft, and stops all checks after unmount',async()=>{
 const fetch=vi.fn(async()=>({ok:true,json:async()=>({version:1})}));vi.stubGlobal('fetch',fetch);const refresh=vi.fn();useOperationsRefresh(refresh,false);await vi.advanceTimersByTimeAsync(60000);expect(fetch).not.toHaveBeenCalled();
 useOperationsRefresh(refresh);await vi.advanceTimersByTimeAsync(0);expect(fetch).toHaveBeenCalledTimes(1);state.cleanups.splice(0).forEach(fn=>fn());await vi.advanceTimersByTimeAsync(60000);expect(fetch).toHaveBeenCalledTimes(1);
});

it('focus and visibility checks do not reload unchanged full views',async()=>{
 const fetch=vi.fn(async()=>({ok:true,json:async()=>({version:1})}));vi.stubGlobal('fetch',fetch);const refresh=vi.fn();useOperationsRefresh(refresh);
 await vi.advanceTimersByTimeAsync(0);window.dispatchEvent(new Event('focus'));await vi.advanceTimersByTimeAsync(200);expect(refresh).not.toHaveBeenCalled();
 document.dispatchEvent(new Event('visibilitychange'));await vi.advanceTimersByTimeAsync(200);expect(refresh).not.toHaveBeenCalled();
});

it('does not retry failures in the background, and throttles repeated focus events',async()=>{
 const fetch=vi.fn(async()=>({ok:false}));vi.stubGlobal('fetch',fetch);useOperationsRefresh(vi.fn());
 await vi.advanceTimersByTimeAsync(0);for(let i=0;i<20;i++)window.dispatchEvent(new Event('focus'));
 await vi.advanceTimersByTimeAsync(5000);expect(fetch).toHaveBeenCalledTimes(1);
 await vi.advanceTimersByTimeAsync(3600000);expect(fetch).toHaveBeenCalledTimes(1);
 window.dispatchEvent(new Event('focus'));await vi.advanceTimersByTimeAsync(0);expect(fetch).toHaveBeenCalledTimes(2);
});
