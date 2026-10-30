// Synthetic localhost or the dedicated isolated Worker only. Sessions bypass OTP.
const fs=require('node:fs');
const [fixture,output,targetFile,mode='api']=process.argv.slice(2);if(!fixture||!output)throw Error('Private fixture and output required');
if(!['api','pages'].includes(mode))throw Error('Unknown workload mode');
const tenants=JSON.parse(fs.readFileSync(fixture));
if(tenants.length!==407)throw Error('This bounded scenario requires exactly 407 synthetic tenants');
const target=targetFile?JSON.parse(fs.readFileSync(targetFile)):null;
if(target&&!/^https:\/\/teams-capacity-20261030\.[a-z0-9-]+\.workers\.dev$/.test(target.origin))throw Error('Only the dedicated synthetic Worker is allowed');
const origin=target?.origin||'http://127.0.0.1:8797',rows=[],stages=[];let failed=false,nextSlot=0;
const percentile=(v,p)=>[...v].sort((a,b)=>a-b)[Math.min(v.length-1,Math.ceil(v.length*p)-1)]||0;
async function get(tenant,path){if(target){const slot=Math.max(Date.now(),nextSlot);nextSlot=slot+50;await new Promise(r=>setTimeout(r,Math.max(0,slot-Date.now())));if(failed)return;}
 const start=performance.now();let row={path,ok:false,status:0};
 try{const r=await fetch(origin+path,{redirect:'manual',headers:{Cookie:'teams_tenant_session='+tenant.token,...(target?{'x-capacity-test-key':target.key}:{})},signal:AbortSignal.timeout(15000)});const text=await r.text();
 row.status=r.status;row.usage=JSON.parse(r.headers.get(target?'x-capacity-d1-usage':'x-local-d1-usage')||'null');row.ok=r.status===200&&r.headers.get('cache-control')?.includes('no-store')&&!!row.usage&&row.usage.rowsWritten===0&&row.usage.queries===row.usage.measuredQueries&&!row.usage.failedQueries&&!row.usage.missingMetadataQueries;
 if(mode==='pages'){row.ok=row.ok&&r.headers.get('content-type')?.includes('text/html')&&text.includes('<h1');if(path==='/tenant/account'&&tenant.email)row.ok=row.ok&&text.includes(tenant.email);}
 else {const data=JSON.parse(text);if(path.endsWith('/session'))row.ok=row.ok&&data.tenant?.id===tenant.id;if(path.endsWith('/leases'))row.ok=row.ok&&data.leases?.length===1;}
 }catch{row.error='network-timeout-or-invalid-response';}
 row.ms=Math.round(performance.now()-start);rows.push(row);if(!row.ok)failed=true;
}
(async()=>{
 for(const [count,concurrency] of [[5,1],[20,5],[50,10],[332,20]]){
  const offset=stages.reduce((n,s)=>n+s.completed,0),start=rows.length,t=performance.now();let cursor=0,completed=0;
  const paths=mode==='pages'?['/tenant','/tenant/account','/tenant/household','/tenant/lease','/tenant/maintenance']:['/api/tenant/session','/api/tenant/leases','/api/tenant/contacts','/api/tenant/household','/api/tenant/maintenance'];
  await Promise.all(Array.from({length:concurrency},async()=>{while(!failed&&cursor<count){const tenant=tenants[offset+cursor++];for(const path of paths){if(failed)break;await get(tenant,path);}if(!failed)completed++;}}));
  const sample=rows.slice(start);const stage={count,concurrency,completed,requests:sample.length,errors:sample.filter(r=>!r.ok).length,p95Ms:percentile(sample.map(r=>r.ms),.95),rowsRead:sample.reduce((n,r)=>n+(r.usage?.rowsRead||0),0),rowsWritten:sample.reduce((n,r)=>n+(r.usage?.rowsWritten||0),0),seconds:Math.round((performance.now()-t)/1000)};
  stages.push(stage);console.log(JSON.stringify(stage));const stoppedReason=failed?'response-or-metering-failure':stage.p95Ms>5000?'latency-threshold':null;fs.writeFileSync(output,JSON.stringify({environment:target?'isolated Cloudflare synthetic':'local synthetic',mode,tenants:tenants.length,failed,stoppedReason,stages,rows},null,2),{mode:0o600});if(stoppedReason){process.exitCode=1;break;}
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;});
