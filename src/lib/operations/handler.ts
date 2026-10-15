import { NextResponse } from 'next/server';
import { authorize,body,enabled,all,type Row } from './database';
import { detail,list,overview } from './queries';
import { saveRequestAssignment,saveAssignment,saveLease,saveProperty,saveSuperintendent,saveTenant,saveUnit } from './mutations';
import { documentStore,downloadDocument,uploadLeaseDocument } from './private-documents';
import { fail,id,OperationError } from './validation';
export const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function operationsRequest(request:Request,path:string[]){try{const a=await authorize(request,request.method!=='GET');const [entity,key,action]=path;const url=new URL(request.url);if(request.method==='GET'){
 if(entity==='overview'&&path.length===1)return json(await overview(a));
 if(entity==='staff'&&path.length===1)return json({items:await all(a.db,'SELECT email FROM admin_identities WHERE active=1 ORDER BY email LIMIT 200')});
 if(entity==='storage'&&path.length===1)return json({enabled:!!documentStore(),maxBytes:5*1024*1024,acceptedType:'application/pdf'});
 if(entity==='documents'&&key&&path.length===2)return await downloadDocument(a.db,id(key));
 if(['properties','units','tenants','superintendents','leases','maintenance'].includes(entity)&&path.length<3)return json(key?await detail(a,entity,id(key)):await list(a,entity,url));
 } else if(request.method==='POST'&&entity==='maintenance'&&key&&action==='assignment'&&path.length===3)return json(await saveRequestAssignment(a,id(key),await body(request)));
 else if(request.method==='POST'&&entity==='leases'&&key&&action==='documents'&&path.length===3)return json(await uploadLeaseDocument(a,id(key),request),201);
 else if(request.method==='POST'&&entity==='assignments'&&path.length===1)return json(await saveAssignment(a,await body(request)),201);
 else if(['POST','PATCH'].includes(request.method)&&path.length<3){const v=await body(request),target=key?id(key):null;if(request.method==='PATCH'&&!target||request.method==='POST'&&target)fail('Not found',404);let result:Row;
 if(entity==='properties'&&target)result=await saveProperty(a,target,v);
 else if(entity==='units')result=await saveUnit(a,target,v);
 else if(entity==='tenants')result=await saveTenant(a,target,v);
 else if(entity==='superintendents')result=await saveSuperintendent(a,target,v);
 else if(entity==='leases')result=await saveLease(a,target,v);
 else return fail('Not found',404);
 return json(result,result.duplicate||target?200:201);
 }
 return json({error:'Not found'},404);
 }catch(e){if(e instanceof OperationError)return json({error:e.message},e.status);return json({error:'Operations are temporarily unavailable. Your changes were not confirmed; keep your draft and retry.'},503);}}
