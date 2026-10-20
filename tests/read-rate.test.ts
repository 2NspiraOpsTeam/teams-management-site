import {expect,it} from 'vitest';
import {createRequire} from 'node:module';
const {readRate}=createRequire(import.meta.url)('../scripts/integrity/read-rate.cjs');
const sample=(at:string,value?:number,day='2026-10-20')=>({at,day,metrics:value===undefined?{}:{rowsRead:value}});
it('alerts on rapid reads below the 50% daily threshold without extra queries',()=>{
 const first=readRate(sample('2026-10-20T10:00:00Z',100000));
 const next=readRate(sample('2026-10-20T10:30:00Z',400000),first.state);
 expect(next.message).toContain('600,000');
 expect(readRate(sample('2026-10-20T11:00:00Z',700000),next.state).message).toBe('');
});
it('escalates immediately and allows a new warning after cooldown',()=>{
 let state=readRate(sample('2026-10-20T10:00:00Z',0)).state;
 state=readRate(sample('2026-10-20T10:30:00Z',300000),state).state;
 const high=readRate(sample('2026-10-20T11:00:00Z',900000),state);expect(high.message).toContain('1,200,000');
 expect(readRate(sample('2026-10-20T12:00:00Z',2100000),high.state).message).toContain('1,200,000');
});
it('does not invent zero usage from missing data and retains the fresh timestamp',()=>{
 const initial=readRate(sample('2026-10-20T10:00:00Z',0)).state;
 const missing=readRate(sample('2026-10-20T10:30:00Z'),initial);expect(missing.state.readSample).toEqual(initial.readSample);
 expect(readRate(sample('2026-10-20T11:00:00Z',600000),missing.state).message).toContain('600,000');
});
it('ignores tiny intervals, backwards counters, stale intervals and UTC reset',()=>{
 const state=readRate(sample('2026-10-20T10:00:00Z',100)).state;
 expect(readRate(sample('2026-10-20T10:01:00Z',900000),state).message).toBe('');
 expect(readRate(sample('2026-10-20T10:30:00Z',1),state).message).toBe('');
 expect(readRate(sample('2026-10-20T13:00:00Z',3000000),state).message).toBe('');
 expect(readRate(sample('2026-10-21T10:30:00Z',900000,'2026-10-21'),state).message).toBe('');
});
