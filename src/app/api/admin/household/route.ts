import { requireAdmin,sameOrigin } from '@/lib/admin-auth';
import { boundedBody } from '@/lib/request-body';
import { reply } from '@/lib/work-orders/server';
import { tenantCapacitySql,eligibleOccupantSql } from '@/lib/household/server';
import { householdPerson,householdSubject } from '@/lib/household/shared';
export const runtime='nodejs';
export async function GET(){const admin=await requireAdmin();if(!admin)return reply({error:'Unauthorized'},401);try{const rows=await admin.db.prepare(`SELECT r.id,r.message,r.status,r.created_at,r.assignment_id,t.display_name AS requester,b.name AS property_name,u.unit_identifier FROM tenant_contact_requests r JOIN tenant_accounts t ON t.id=r.tenant_id JOIN tenant_assignments a ON a.id=r.assignment_id AND a.tenant_id=r.tenant_id JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id JOIN buildings b ON b.id=a.building_id WHERE r.subject=? ORDER BY CASE r.status WHEN 'submitted' THEN 0 ELSE 1 END,r.created_at DESC LIMIT 100`).bind(householdSubject).all();return reply({requests:rows.results});}catch{return reply({error:'Access requests are temporarily unavailable.'},503);}}
export async function PATCH(request:Request){
 if(!sameOrigin(request))return reply({error:'Unauthorized'},401);const admin=await requireAdmin();if(!admin)return reply({error:'Unauthorized'},401);
 let v;try{v=JSON.parse(new TextDecoder().decode(await boundedBody(request,2048)));if(typeof v.id!=='string'||v.id.length>100||!['approved','declined'].includes(v.status)||v.confirm!==true)throw Error();}catch{return reply({error:'Confirm your decision and try again.'},400);}
 const db=admin.db;
 try{
  const r=await db.prepare('SELECT r.id,r.message,r.status,a.unit_id,a.building_id,a.active,t.active AS requester_active FROM tenant_contact_requests r JOIN tenant_assignments a ON a.id=r.assignment_id AND a.tenant_id=r.tenant_id JOIN tenant_accounts t ON t.id=r.tenant_id WHERE r.id=? AND r.subject=?').bind(v.id,householdSubject).first<{id:string;message:string;status:string;unit_id:string;building_id:string;active:number;requester_active:number}>();
  if(!r)return reply({error:'Request not found.'},404);
  if(r.status===v.status)return reply({status:r.status,duplicate:true});
  if(r.status!=='submitted')return reply({error:'This request has already changed. Refresh before reviewing.'},409);
  if(!r.active||!r.requester_active)return reply({error:'The requesting tenant no longer has active apartment access.'},409);
  const person=householdPerson(r.message);
  let occupant:string|null=null;
  if(v.status==='approved'){
   const matches=await db.prepare(eligibleOccupantSql).bind(r.unit_id,r.building_id,person.email,person.email).all<{id:string;email:string|null}>();
   if(matches.results.length!==1)return reply({error:'Approval requires exactly one existing approved occupant in this apartment with this email. Verify the tenant directory and contact details first; no occupant or assignment has been changed.'},409);
   occupant=matches.results[0].id;
   const other=await db.prepare('SELECT id FROM tenant_accounts WHERE lower(email)=? AND id<>?').bind(person.email,occupant).first();
   if(other)return reply({error:'This email belongs to another account. Resolve it in the tenant directory before approval.'},409);
  }
  const pending=`EXISTS(SELECT 1 FROM tenant_contact_requests r JOIN tenant_assignments a ON a.id=r.assignment_id AND a.tenant_id=r.tenant_id JOIN tenant_accounts t ON t.id=r.tenant_id WHERE r.id=? AND r.subject=? AND r.status='submitted' AND a.active=1 AND t.active=1)`;
  const statements=[];
  if(occupant)statements.push(db.prepare(`UPDATE tenant_accounts SET email=?,active=1 WHERE id=? AND (active=1 OR ${tenantCapacitySql}) AND (email IS NULL OR lower(email)=?) AND EXISTS(SELECT 1 FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE a.tenant_id=tenant_accounts.id AND a.active=1 AND a.unit_id=? AND a.building_id=?) AND (lower(email)=? OR EXISTS(SELECT 1 FROM tenant_contacts c WHERE c.tenant_id=tenant_accounts.id AND c.contact_type='email' AND c.archived=0 AND lower(trim(c.value_raw))=?)) AND ${pending}`).bind(person.email,occupant,person.email,r.unit_id,r.building_id,person.email,person.email,r.id,householdSubject));
  const accessCheck=occupant?` AND EXISTS(SELECT 1 FROM tenant_accounts t JOIN tenant_assignments a ON a.tenant_id=t.id WHERE t.id=? AND t.active=1 AND lower(t.email)=? AND a.active=1 AND a.unit_id=? AND a.building_id=?)`:'';
  statements.push(db.prepare(`INSERT INTO audit_log(id,action,entity_type,entity_id,record_after_json,user_actor) SELECT ?,?,'household_access',?,?,? WHERE ${pending}${accessCheck}`).bind(crypto.randomUUID(),v.status,r.id,JSON.stringify({status:v.status,occupantId:occupant}),admin.email,r.id,householdSubject,...(occupant?[occupant,person.email,r.unit_id,r.building_id]:[])));
  statements.push(db.prepare(`UPDATE tenant_contact_requests SET status=?,staff_notes=? WHERE id=? AND subject=? AND status='submitted' AND ${pending}${accessCheck}`).bind(v.status,JSON.stringify({reviewedBy:admin.email,occupantId:occupant}),r.id,householdSubject,r.id,householdSubject,...(occupant?[occupant,person.email,r.unit_id,r.building_id]:[])));
  await db.batch(statements);
  const saved=await db.prepare('SELECT status FROM tenant_contact_requests WHERE id=?').bind(r.id).first<{status:string}>();
  return saved?.status===v.status?reply({status:v.status}):reply({error:'The request or occupant changed. Refresh and verify the directory.'},409);
 }catch{return reply({error:'The review could not be saved. Refresh the request status before retrying.'},503);}
}
