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
 expect(evaluate({...sample(),problems:['Provider monitoring unavailable']},baseline.state).fire).toBe(false);
});

it('scopes error deltas to the active runtime while retaining account quota warnings',()=>{
 const old=evaluate({...sample({resourceErrors:13}),runtime:'old-worker'});
 const current=evaluate({...sample({resourceErrors:1}),runtime:'new-worker'},old.state);expect(current.fire).toBe(false);
 expect(evaluate({...sample({resourceErrors:2}),runtime:'new-worker'},current.state).message).toContain('1 new resourceErrors');
});

it('alerts even on the first new error when the release-scoped window starts from zero',()=>{
 const prior=evaluate({...sample({resourceErrors:0}),runtime:'old'});
 expect(evaluate({...sample({resourceErrors:1}),runtime:'new@release-time',errorBaseline:0},prior.state).message).toContain('1 new resourceErrors');
});

it('filters transient failures, recovers silently, and rate-limits repeated monitoring incidents',()=>{
 const failed={...sample(),problems:['D1 usage monitoring unavailable']};
 const first=evaluate(failed);expect(first.fire).toBe(false);
 const second=evaluate(failed,first.state);expect(second.fire).toBe(false);
 const third=evaluate(failed,second.state);expect(third.message).toContain('not confirmed hacking');
 expect(evaluate(failed,third.state).fire).toBe(false);
 const recovered=evaluate(sample(),third.state);expect(recovered.fire).toBe(false);
 let state=recovered.state;
 for(let i=0;i<4;i++){const flap=evaluate(failed,state);expect(flap.fire).toBe(false);state=flap.state;}
 const nextDay=evaluate({...failed,at:'2026-10-21T03:00:00Z'},state);expect(nextDay.fire).toBe(true);
 expect(evaluate(sample(),nextDay.state).fire).toBe(false);
});
it('does not delay actual site or authentication alerts during monitoring failures',()=>{
 const result=evaluate({...sample(),problems:['D1 usage monitoring unavailable','Homepage HTTP 502','Repeated sign-in lockouts in the last hour']});
 expect(result.message).toContain('Homepage HTTP 502');expect(result.message).toContain('Repeated sign-in lockouts');
 expect(result.message).not.toContain('D1 usage monitoring unavailable');
});
it('retains error counters across unavailable samples so new errors are not silently lost',()=>{
 const initial=evaluate({...sample({resourceErrors:2}),runtime:'same'});
 const blind=evaluate({...sample(),runtime:'same',problems:['Worker usage monitoring unavailable']},initial.state);
 expect(blind.state.metrics.resourceErrors).toBe(2);
 expect(evaluate({...sample({resourceErrors:3}),runtime:'same'},blind.state).message).toContain('1 new resourceErrors');
});

it('recovers one transient provider failure, accepts empty errors arrays, and never leaks payloads',async()=>{
 const fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'teams-monitor-test-'));
 const oauth=path.join(dir,'oauth.toml');fs.writeFileSync(oauth,'oauth_token = "isolated-test-credential"');
 const {snapshot}=createRequire(import.meta.url)('../scripts/integrity/monitor.cjs');
 const contract=JSON.parse(fs.readFileSync(new URL('../scripts/integrity/release_contract.json',import.meta.url),'utf8'));
 let attempts=0;
 try{
  const result=await snapshot({oauth_config:oauth,account_id:'test',database_id:'test',origin:'https://test.invalid'},async(url:string,init:any)=>{
   if(url==='https://test.invalid/')return new Response('<title>'+contract.home_title+'</title>');
   if(url.includes('/d1/'))return Response.json({success:true,errors:[],result:[{results:[{lockouts:0,throttleExcess:0}]}]});
   if(init.body.includes('d1Analytics')){if(++attempts===1)return Response.json({errors:[{message:'private-provider-payload'}]},{status:503});return Response.json({errors:[],data:{viewer:{accounts:[{d1AnalyticsAdaptiveGroups:[{sum:{rowsRead:12,rowsWritten:0}}]}]}}});}
   return Response.json({data:{viewer:{accounts:[{account:[]}]}}});
  });
  expect(attempts).toBe(2);expect(result.problems).toEqual([]);expect(result.metrics.rowsRead).toBe(12);expect(JSON.stringify(result)).not.toContain('private-provider-payload');
 }finally{fs.rmSync(dir,{recursive:true});}
});
