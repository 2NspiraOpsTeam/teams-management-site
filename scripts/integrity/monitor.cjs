#!/usr/bin/env node
// Read-only monitor. Credentials and target identifiers belong in a mode-0600
// config OUTSIDE the public repository. Never prints provider error payloads.
const fs=require('node:fs');
async function snapshot(config,fetcher=fetch,now=new Date()) {
 if(config.wrangler)require('node:child_process').execFileSync(config.wrangler,['whoami'],{timeout:15000,stdio:'pipe',env:{...process.env,CLOUDFLARE_ACCOUNT_ID:config.account_id}});
 const text=fs.readFileSync(config.oauth_config,'utf8');
 const token=text.match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];
 if(!token)throw Error('Monitoring credential unavailable');
 const day=now.toISOString().slice(0,10);
 async function gql(fields){
  const r=await fetcher('https://api.cloudflare.com/client/v4/graphql',{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:`{viewer{accounts(filter:{accountTag:"${config.account_id}"}){${fields}}}}`})});
  const data=await r.json();if(!r.ok||data.errors||!data.data?.viewer?.accounts?.[0])throw Error('Provider usage monitoring unavailable');return data.data.viewer.accounts[0];
 }
 async function authHealth(){
  if(!config.database_id)throw Error('Authentication monitoring target unavailable');
  // Aggregate counts only: no email, IP, code, token hash or identity is returned.
  const sql="SELECT (SELECT count(*) FROM admin_login_codes WHERE attempt_count>=5 AND created_at>datetime('now','-1 hour'))+(SELECT count(*) FROM tenant_login_codes WHERE attempt_count>=5 AND created_at>datetime('now','-1 hour')) AS lockouts, (SELECT COALESCE(sum(count-30),0) FROM admin_login_throttle WHERE count>30 AND window_start>datetime('now','-1 hour'))+(SELECT COALESCE(sum(count-30),0) FROM tenant_login_throttle WHERE count>30 AND window_start>datetime('now','-1 hour')) AS throttleExcess";
  const r=await fetcher(`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/d1/database/${config.database_id}/query`,{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({sql})});
  const value=await r.json();if(!r.ok||!value.success||!value.result?.[0]?.results?.[0])throw Error('Authentication monitoring unavailable');return value.result[0].results[0];
 }
 const filter=`datetimeHour_geq:"${day}T00:00:00Z",datetimeHour_leq:"${now.toISOString()}"`;
 const [d1,workers,page,auth]=await Promise.allSettled([
  gql(`d1AnalyticsAdaptiveGroups(limit:20,filter:{${filter}}){dimensions{databaseId}sum{rowsRead rowsWritten}}`),
  gql(`workersInvocationsAdaptive(limit:100,filter:{datetime_geq:"${day}T00:00:00Z",datetime_leq:"${now.toISOString()}"}){dimensions{status}sum{requests errors}}`),
  fetcher(config.origin+'/',{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{'User-Agent':'TeamsIntegrityMonitor/1.0'}}).then(async r=>({status:r.status,release:r.headers.get('x-teams-release'),html:await r.text()})),
  authHealth(),
 ]);
 const problems=[],metrics={};
 if(d1.status==='fulfilled'){
  const rows=d1.value.d1AnalyticsAdaptiveGroups; if(rows.length>=20)problems.push('D1 analytics truncated; totals are incomplete');
  metrics.rowsRead=rows.reduce((n,r)=>n+r.sum.rowsRead,0);metrics.rowsWritten=rows.reduce((n,r)=>n+r.sum.rowsWritten,0);
  // Complete hour only, avoiding a current-hour partial rate projection.
  // A bounded day aggregate avoids repeatedly spending the hourly analytics budget.
  // Hour-rate inspection remains an on-demand investigation, not a scheduled fanout.
 }else problems.push('D1 usage monitoring unavailable');
 if(workers.status==='fulfilled'){
  const rows=workers.value.workersInvocationsAdaptive;metrics.invocations=rows.reduce((n,r)=>n+r.sum.requests,0);
  metrics.resourceErrors=rows.filter(r=>r.dimensions.status==='exceededResources').reduce((n,r)=>n+r.sum.requests,0);
  metrics.invocationErrors=rows.reduce((n,r)=>n+r.sum.errors,0);
 }else problems.push('Worker usage monitoring unavailable');
 if(page.status==='fulfilled'){
  if(page.value.status!==200)problems.push('Homepage HTTP '+page.value.status);
  if(config.expected_release&&page.value.release!==config.expected_release)problems.push('Website release fingerprint changed');
  const contract=JSON.parse(fs.readFileSync(__dirname+'/release_contract.json'));
  if(!page.value.html.includes('<title>'+contract.home_title+'</title>')||contract.forbidden_home_copy.some(s=>page.value.html.includes(s)))problems.push('Sharing metadata regression');
 }else problems.push('Homepage monitoring unavailable');
 if(auth.status==='fulfilled'){
  metrics.loginLockouts=auth.value.lockouts;metrics.loginThrottleExcess=auth.value.throttleExcess;
  if(metrics.loginLockouts>=3)problems.push('Repeated sign-in lockouts in the last hour');
  if(metrics.loginThrottleExcess>=20)problems.push('Unusual sign-in request volume in the last hour');
 }else problems.push('Authentication monitoring unavailable');
 return {at:now.toISOString(),day,metrics,problems,limits:config.limits,usageCaveat:'Worker invocations are an analytics proxy, not the enforced billable counter. Provider data can lag. Failed-login classifications are logged separately.'};
}
function evaluate(current,prior={}) {
 const notices=current.problems.filter(p=>!(prior.problems||[]).includes(p)),keys=[];
 for(const [metric,limit] of Object.entries(current.limits||{})){
  const value=current.metrics[metric];if(typeof value!=='number')continue;
  const level=[90,75,50].find(p=>value>=limit*p/100);
  if(level){const key=current.day+':'+metric+':'+level;keys.push(key);if(!(prior.keys||[]).includes(key))notices.push(`${metric} reached ${level}% of conservative Free baseline (${value.toLocaleString()}/${limit.toLocaleString()})`);}
 }
 for(const metric of ['resourceErrors','invocationErrors']){
  const previous=prior.day===current.day?prior.metrics?.[metric]??current.metrics[metric]:current.metrics[metric];
  const delta=current.metrics[metric]-previous;if(delta>0)notices.push(`${delta} new ${metric}`);
 }
 if(current.metrics.previousHourReads>500000 && (prior.metrics?.previousHourReads!==current.metrics.previousHourReads||prior.day!==current.day))notices.push('Read-rate warning: previous complete UTC hour exceeded 500,000 rows');
 // Persist only compact counters in scheduler scratch/state, never raw logs/data.
 return {fire:notices.length>0,message:notices.length?'Teams website integrity alert: '+notices.join('; ')+'. '+current.usageCaveat:'',state:{day:current.day,keys:[...new Set([...(prior.day===current.day?prior.keys||[]:[]),...keys])],metrics:current.metrics,problems:current.problems,lastChecked:current.at}};
}
module.exports={snapshot,evaluate};
if(require.main===module)(async()=>{
 const args=process.argv.slice(2),file=args[args.indexOf('--config')+1];if(!args.includes('--config')||!file)throw Error('Private --config required');
 const config=JSON.parse(fs.readFileSync(file));const current=await snapshot(config);console.log(JSON.stringify(args.includes('--evaluate')?evaluate(current,JSON.parse(process.env.TEAMS_MONITOR_PRIOR||'{}')):current));
})().catch(()=>{console.error('Monitoring check failed; inspect credentials/connectivity privately.');process.exitCode=1;});
