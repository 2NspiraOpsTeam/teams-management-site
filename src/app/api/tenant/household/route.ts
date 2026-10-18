import { hash, sameOrigin } from '@/lib/admin-auth';
import { currentTenant,tenantDb } from '@/lib/tenant-auth';
import { boundedBody } from '@/lib/request-body';
import { reply } from '@/lib/work-orders/server';
import { householdInput, householdSubject } from '@/lib/household/shared';
import { householdRequests } from '@/lib/household/server';
export const runtime='nodejs';
export async function GET(){const t=await currentTenant();if(!t)return reply({error:'Unauthorized'},401);try{return reply({requests:(await householdRequests(tenantDb(),t.id)).results});}catch{return reply({error:'Household requests are temporarily unavailable.'},503);}}
export async function POST(request:Request){
 if(!sameOrigin(request))return reply({error:'Unauthorized'},401);
 const t=await currentTenant();if(!t)return reply({error:'Unauthorized'},401);
 let raw;try{raw=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error();}catch{return reply({error:'Invalid or oversized request. Check your details and try again.'},400);}
 let v;try{v=householdInput(raw);}catch(e){return reply({error:e instanceof Error?e.message:'Check the request details.'},400);}
 if(v.email===t.email?.toLowerCase())return reply({error:'You already have access. Enter the other person’s email.'},400);
 const db=tenantDb();
 try{
  const a=await db.prepare('SELECT a.id FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE a.id=? AND a.tenant_id=? AND a.active=1').bind(v.assignmentId,t.id).first();
  if(!a)return reply({error:'This apartment is no longer available to your account.'},403);
  const id='household-'+await hash(JSON.stringify([t.id,v.assignmentId,v.email]));
  const count=await db.prepare("SELECT count(*) AS n FROM tenant_contact_requests WHERE tenant_id=? AND subject=? AND created_at>datetime('now','-1 day')").bind(t.id,householdSubject).first<{n:number}>();
  const prior=await db.prepare('SELECT status FROM tenant_contact_requests WHERE id=? AND tenant_id=?').bind(id,t.id).first<{status:string}>();
  if(prior&&!['cancelled','declined'].includes(prior.status))return reply({id,status:prior.status,duplicate:true});
  if((count?.n||0)>=10)return reply({error:'Daily request limit reached. Please contact management.'},429);
  await db.prepare(`INSERT INTO tenant_contact_requests(id,tenant_id,assignment_id,subject,message) SELECT ?,a.tenant_id,a.id,?,? FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE a.id=? AND a.tenant_id=? AND a.active=1 ON CONFLICT(id) DO UPDATE SET message=excluded.message,status='submitted',staff_notes=NULL,created_at=datetime('now') WHERE tenant_contact_requests.status IN ('cancelled','declined')`).bind(id,householdSubject,JSON.stringify({name:v.name,email:v.email}),v.assignmentId,t.id).run();
  const saved=await db.prepare('SELECT status FROM tenant_contact_requests WHERE id=? AND tenant_id=?').bind(id,t.id).first<{status:string}>();
  if(!saved)return reply({error:'Your apartment access changed. Refresh and try again.'},409);
  return reply({id,status:saved.status},201);
 }catch{return reply({error:'We could not save your request. Your details are unchanged; please retry.'},503);}
}
export async function PATCH(request:Request){
 if(!sameOrigin(request))return reply({error:'Unauthorized'},401);const t=await currentTenant();if(!t)return reply({error:'Unauthorized'},401);
 let id;try{const v=JSON.parse(new TextDecoder().decode(await boundedBody(request,1024)));if(typeof v.id!=='string'||v.id.length>100)throw Error();id=v.id;}catch{return reply({error:'Invalid request.'},400);}
 try{const db=tenantDb();await db.prepare("UPDATE tenant_contact_requests SET status='cancelled' WHERE id=? AND tenant_id=? AND subject=? AND status='submitted' AND EXISTS(SELECT 1 FROM tenant_assignments a WHERE a.id=tenant_contact_requests.assignment_id AND a.tenant_id=? AND a.active=1)").bind(id,t.id,householdSubject,t.id).run();const row=await db.prepare('SELECT status FROM tenant_contact_requests WHERE id=? AND tenant_id=? AND subject=?').bind(id,t.id,householdSubject).first<{status:string}>();return row?.status==='cancelled'?reply({status:'cancelled'}):reply({error:'This request has changed. Refresh to see its status.'},409);}catch{return reply({error:'Cancellation could not be saved. Please retry.'},503);}
}
