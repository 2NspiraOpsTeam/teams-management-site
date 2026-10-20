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

it('scopes error deltas to the active runtime while retaining account quota warnings',()=>{
 const old=evaluate({...sample({resourceErrors:13}),runtime:'old-worker'});
 const current=evaluate({...sample({resourceErrors:1}),runtime:'new-worker'},old.state);expect(current.fire).toBe(false);
 expect(evaluate({...sample({resourceErrors:2}),runtime:'new-worker'},current.state).message).toContain('1 new resourceErrors');
});

it('alerts even on the first new error when the release-scoped window starts from zero',()=>{
 const prior=evaluate({...sample({resourceErrors:0}),runtime:'old'});
 expect(evaluate({...sample({resourceErrors:1}),runtime:'new@release-time',errorBaseline:0},prior.state).message).toContain('1 new resourceErrors');
});

it('latches monitoring flaps, reports sustained recovery, and uses plain-language notices',()=>{
 const failed={...sample(),problems:['D1 usage monitoring unavailable']};
 const first=evaluate(failed);expect(first.message).toContain('not confirmed hacking');
 const brief=evaluate(sample(),first.state);expect(brief.fire).toBe(false);
 const flap=evaluate(failed,brief.state);expect(flap.fire).toBe(false);
 const good=evaluate(sample(),flap.state);
 const recovered=evaluate(sample(),good.state);expect(recovered.message).toContain('monitoring restored');
 expect(evaluate(failed,recovered.state).fire).toBe(true);
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
