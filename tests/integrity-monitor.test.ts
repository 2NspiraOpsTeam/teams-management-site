import {expect,it} from 'vitest';
import {createRequire} from 'node:module';
const {evaluate}=createRequire(import.meta.url)('../scripts/integrity/monitor.cjs');
const sample=(metrics={})=>({day:'2026-10-20',at:'2026-10-20T03:00:00Z',metrics,problems:[],limits:{rowsRead:5000000,invocations:100000},usageCaveat:'analytics proxy'});
it('warns at 50/75/90 once per UTC day, escalates and resets',()=>{
 const first=evaluate(sample({rowsRead:2600000}));expect(first.fire).toBe(true);expect(evaluate(sample({rowsRead:2700000}),first.state).fire).toBe(false);
 const higher=evaluate(sample({rowsRead:3800000}),first.state);expect(higher.message).toContain('75%');expect(evaluate(sample({rowsRead:4600000}),higher.state).message).toContain('90%');
 expect(evaluate({...sample({rowsRead:2600000}),day:'2026-10-21'},higher.state).fire).toBe(true);
});
it('does not hide monitoring failures or new resource errors, and never treats historical totals as new errors',()=>{
 const baseline=evaluate(sample({resourceErrors:12,invocationErrors:0}));expect(baseline.fire).toBe(false);
 expect(evaluate(sample({resourceErrors:13,invocationErrors:0}),baseline.state).message).toContain('1 new resourceErrors');
 expect(evaluate({...sample(),problems:['Provider monitoring unavailable']},baseline.state).fire).toBe(true);
});
