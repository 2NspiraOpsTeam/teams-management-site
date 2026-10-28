// Development-only harness; never included in app routes or deployment entrypoints.
import { commitTenantImport,undoTenantImport } from '../../src/lib/operations/tenant-import';
export default {async fetch(request:Request,env:any){
 if(!['localhost','127.0.0.1'].includes(new URL(request.url).hostname)||request.headers.get('X-Teams-Synthetic-QA')!=='local-only'||request.method!=='POST')return new Response('Not found',{status:404});
 try{const v:any=await request.json();const a={db:env.DB,email:'qa-admin@example.test'};const options={environment:v.environment||'local-synthetic',binding:'DB',batchId:v.batchId,interruptAfterRecord:v.interruptAfterRecord};const result=new URL(request.url).pathname==='/undo'?await undoTenantImport(a,v.batchId,options):await commitTenantImport(a,v.plan,v.approval,options);return Response.json(result);}catch(e){return Response.json({error:(e as Error).message},{status:409});}
}};
