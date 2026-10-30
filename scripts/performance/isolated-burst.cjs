// Bounded session-read burst against the dedicated synthetic Worker only.
const fs=require('node:fs');
const [fixture,targetFile,output]=process.argv.slice(2);if(!fixture||!targetFile||!output)throw Error('Private fixture, target and output required');
const tenants=JSON.parse(fs.readFileSync(fixture)),target=JSON.parse(fs.readFileSync(targetFile));
if(tenants.length!==407||!/^https:\/\/teams-capacity-20261030\.[a-z0-9-]+\.workers\.dev$/.test(target.origin))throw Error('Dedicated 407-account synthetic target required');
const rows=[];
(async()=>{for(const concurrency of [50,100,407]){
 const sample=await Promise.all(tenants.slice(0,concurrency).map(async t=>{const start=performance.now();let ok=false,status=0,usage;
  try{const r=await fetch(target.origin+'/api/tenant/session',{redirect:'manual',headers:{Cookie:'teams_tenant_session='+t.token,'x-capacity-test-key':target.key},signal:AbortSignal.timeout(15000)});status=r.status;usage=JSON.parse(r.headers.get('x-capacity-d1-usage')||'null');const body=await r.json();ok=status===200&&body.tenant?.id===t.id&&usage?.queries===usage?.measuredQueries&&usage?.rowsWritten===0&&!usage?.failedQueries;}catch{}
  return {ok,status,ms:Math.round(performance.now()-start),rowsRead:usage?.rowsRead||0};}));
 const times=sample.map(r=>r.ms).sort((a,b)=>a-b),stage={concurrency,requests:sample.length,errors:sample.filter(r=>!r.ok).length,p95Ms:times[Math.ceil(times.length*.95)-1],maxMs:times.at(-1),rowsRead:sample.reduce((n,r)=>n+r.rowsRead,0)};
 rows.push({stage,sample});console.log(JSON.stringify(stage));fs.writeFileSync(output,JSON.stringify({scope:'isolated synthetic session reads; not OTP, dashboard rendering or sustained traffic',rows},null,2),{mode:0o600});if(stage.errors||stage.p95Ms>5000){process.exitCode=1;break;}
}})().catch(e=>{console.error(e.message);process.exitCode=1;});
