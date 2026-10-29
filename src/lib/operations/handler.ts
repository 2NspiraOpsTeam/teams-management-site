import {saveGoogleLeaseLink,removeLeaseLink} from './google-lease-links';
import {oneDriveConfig,leaseLinks,saveLeaseLink} from './onedrive-links';
import {sourceRoster} from './source-roster';
import {renewalData,filterRenewals,saveRenewal,saveRenewalSettings} from './renewals';
import { phoneList,phonePrint } from './phone-list';
import { exportRecords } from './exports';
import { rentRoll } from './rent-roll';
import { NextResponse } from 'next/server';
import { authorize,body,enabled,all,one,auditStatement,type Row } from './database';
import { detail,list,overview,recentActivity } from './queries';
import { saveRequestAssignment,saveAssignment,saveLease,saveProperty,saveSuperintendent,saveTenant,saveUnit } from './mutations';
import { documentStore,downloadDocument,uploadLeaseDocument } from './private-documents';
import { fail,id,OperationError } from './validation';
export const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function operationsRequest(request:Request,path:string[]){try{const a=await authorize(request,request.method!=='GET');const [entity,key,action]=path;const url=new URL(request.url);if(entity==='renewals'&&request.method==='PATCH'){if(key==='settings'&&path.length===2)return json(await saveRenewalSettings(a,await body(request)));if(key&&path.length===2)return json(await saveRenewal(a,id(key),await body(request)));}if(entity==='renewals'&&key==='print'&&request.method==='POST'&&path.length===2){const data=await renewalData(a),items=filterRenewals(data,url);await auditStatement(a,'operations_renewal_print',crypto.randomUUID(),null,{count:items.length,filters:Object.fromEntries(url.searchParams)},'print_prepared').run();return json({items,today:data.today,settings:data.settings});}if(request.method==='POST'&&entity==='phone-list'&&key==='print'&&path.length===2){const items=await phonePrint(a,url);await auditStatement(a,'operations_print',crypto.randomUUID(),null,{entity,count:items.length,filters:Object.fromEntries(url.searchParams)},'print_prepared').run();return json({items,generatedAt:new Date().toISOString()});}if(request.method==='POST'&&key==='export'&&path.length===2)return await exportRecords(a,entity,url);if(request.method==='GET'){
 if(entity==='renewals'&&path.length===1){const data=await renewalData(a),items=filterRenewals(data,url),page=Number(url.searchParams.get('page')||0);if(!Number.isSafeInteger(page)||page<0)fail('Invalid page.');return json({items:items.slice(page*50,page*50+50),nextPage:items.length>(page+1)*50?page+1:null,total:items.length,summary:data.summary,months:data.months,today:data.today,reminders:data.reminders,settings:data.settings});}
 if(entity==='onedrive'&&path.length===1)return json(oneDriveConfig());
 if(entity==='leases'&&key&&action==='links'&&path.length===3)return json(await leaseLinks(a,id(key)));
 if(entity==='sync'&&path.length===1)return json(await one(a.db,'SELECT COALESCE(MAX(rowid),0) AS version FROM audit_log'));
 if(entity==='source-roster'&&path.length===1)return json(await sourceRoster(a,url));
 if(entity==='phone-list'&&path.length===1)return json(await phoneList(a,url));
 if(entity==='rent-roll'&&path.length===1)return json(await rentRoll(a,url));
 if(entity==='activity'&&path.length===1)return json({items:await recentActivity(a,url.searchParams.get('buildingId')||'')});
 if(entity==='overview'&&path.length===1)return json(await overview(a));
 if(entity==='staff'&&path.length===1)return json({items:await all(a.db,'SELECT email FROM admin_identities WHERE active=1 ORDER BY email LIMIT 200')});
 if(entity==='storage'&&path.length===1)return json({enabled:!!documentStore(),maxBytes:5*1024*1024,acceptedType:'application/pdf'});
 if(entity==='documents'&&key&&path.length===2)return await downloadDocument(a.db,id(key));
 if(['properties','units','tenants','superintendents','leases','maintenance'].includes(entity)&&path.length<3)return json(key?await detail(a,entity,id(key)):await list(a,entity,url));
 } else if(request.method==='DELETE'&&entity==='leases'&&key&&action==='links'&&path.length===4)return json(await removeLeaseLink(a,id(key),id(path[3])));
 else if(request.method==='POST'&&entity==='maintenance'&&key&&action==='assignment'&&path.length===3)return json(await saveRequestAssignment(a,id(key),await body(request)));
 else if(request.method==='POST'&&entity==='leases'&&key&&action==='documents'&&path.length===3)return json(await uploadLeaseDocument(a,id(key),request),201);
 else if(request.method==='POST'&&entity==='leases'&&key&&(action==='sharing-links'||action==='google-links')&&path.length===3)return json(await saveGoogleLeaseLink(a,id(key),await body(request)),201);
 else if(request.method==='POST'&&entity==='leases'&&key&&action==='links'&&path.length===3)return json(await saveLeaseLink(a,id(key),await body(request)),201);
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
