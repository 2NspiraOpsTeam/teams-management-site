// Local-only built-app QA entrypoint; not referenced by hosted deployment configs.
import application from '../../.open-next/worker.js';
import {meterDatabase} from '../../deployment/preview-runtime/d1-meter.mjs';
export default {async fetch(request,env,ctx){
 if(!['127.0.0.1','localhost'].includes(new URL(request.url).hostname))return new Response('Not found',{status:404});
 const usage={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};
 const response=await application.fetch(request,{...env,DB:meterDatabase(env.DB,usage)},ctx);
 const output=new Response(response.body,response);output.headers.set('X-Local-D1-Usage',JSON.stringify(usage));return output;
}};
