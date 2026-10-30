// Separate synthetic capacity-test deployment only. Never a production entrypoint.
import application from '../../.open-next/worker.js';
import {meterDatabase} from '../../deployment/preview-runtime/d1-meter.mjs';
const paths=new Set(['/api/tenant/session','/api/tenant/leases','/api/tenant/contacts','/api/tenant/household','/api/tenant/maintenance','/tenant','/tenant/account','/tenant/household','/tenant/lease','/tenant/maintenance']);
export default {async fetch(request,env,ctx){
 if(!env.CAPACITY_TEST_KEY||request.headers.get('x-capacity-test-key')!==env.CAPACITY_TEST_KEY)return new Response('Not found',{status:404});
 if(request.method!=='GET'||!paths.has(new URL(request.url).pathname))return new Response('Not found',{status:404});
 const usage={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};
 const response=await application.fetch(request,{...env,DB:meterDatabase(env.DB,usage)},ctx);
 const output=new Response(response.body,response);output.headers.set('X-Capacity-D1-Usage',JSON.stringify(usage));return output;
}};
