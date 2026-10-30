// Bounded GET-only preview workload, not authenticated tenant certification.
const fs=require('node:fs'),crypto=require('node:crypto');
const origin='https://teams-management-preview.pages.dev';
const output=process.argv[2];if(!output)throw Error('Private output path required');
let stopped=false,nextSlot=0;const rows=[],stages=[];
const percentile=(v,p)=>[...v].sort((a,b)=>a-b)[Math.min(v.length-1,Math.ceil(v.length*p)-1)]||0;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function get(path,expected,release,hash){
 if(stopped)return;
 const slot=Math.max(Date.now(),nextSlot);nextSlot=slot+50;await pause(Math.max(0,slot-Date.now()));if(stopped)return;
 const start=performance.now();let row={path,status:0,ok:false};
 try{const r=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(10000),headers:{'User-Agent':'TeamsCapacityQA/1.0'}});const bytes=Buffer.from(await r.arrayBuffer());
 row={...row,status:r.status,bytes:bytes.length,release:r.headers.get('x-teams-release'),cache:r.headers.get('cf-cache-status')};
 row.ok=r.status===expected&&(!release||row.release===release)&&(!hash||crypto.createHash('sha256').update(bytes).digest('hex')===hash);
 if(expected===200&&!hash)row.ok=row.ok&&r.headers.get('content-type')?.includes('text/html')&&bytes.includes(Buffer.from('<h1'));
 }catch{row.error='timeout-or-network';}
 row.ms=Math.round(performance.now()-start);rows.push(row);if(!row.ok||row.ms>10000)stopped=true;return row;
}
(async()=>{
 const started=new Date().toISOString();const base=await fetch(origin+'/');const release=base.headers.get('x-teams-release');const html=await base.text();if(base.status!==200||!release)throw Error('Baseline unavailable');
 const photos=JSON.parse(fs.readFileSync('src/lib/generated/photo-variants.json'));const candidates=require('../images/live-gate.cjs').probes(photos);
 const images=candidates.filter(p=>html.includes(p.path.replaceAll('&','&amp;'))||html.includes(p.path)).slice(0,2);
 if(images.length<2)throw Error('Two rendered manifest photos required');
 // Includes one static and/or publication-guarded photo only if actually rendered.
 const routes=[{path:'/',status:200},{path:'/properties',status:200},{path:'/tenant/login',status:200},...images.map(p=>({path:p.path,status:200,hash:p.sha256}))];
 for(const [users,concurrency] of [[5,1],[20,5],[50,10],[332,20]]){
  const start=rows.length,t=performance.now();let cursor=0,finished=0;
  await Promise.all(Array.from({length:concurrency},async()=>{while(!stopped&&cursor++<users){for(const r of routes){if(stopped)break;await get(r.path,r.status,r.hash?undefined:release,r.hash);}if(!stopped)finished++;}}));
  const sample=rows.slice(start),stage={plannedJourneys:users,completedJourneys:finished,concurrency,requests:sample.length,errors:sample.filter(r=>!r.ok).length,p95Ms:percentile(sample.map(r=>r.ms),.95),elapsedSeconds:Math.round((performance.now()-t)/1000)};
  if(stage.p95Ms>5000)stopped=true;
  stages.push(stage);console.log(JSON.stringify(stage));fs.writeFileSync(output,JSON.stringify({started,finished:new Date().toISOString(),origin,release,stopped,rpsCap:20,stages,rows},null,2),{mode:0o600});
  if(stopped){process.exitCode=1;break;}
 }
 console.log(JSON.stringify({stopped,requests:rows.length,errors:rows.filter(r=>!r.ok).length}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
