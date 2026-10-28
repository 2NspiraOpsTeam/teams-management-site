import {sameOrigin} from '@/lib/admin-auth';
import {currentTenant,tenantDb} from '@/lib/tenant-auth';
import {boundedBody} from '@/lib/request-body';
import {reply} from '@/lib/work-orders/server';
import {contactInput,contactSnapshotSql,residentContacts} from '@/lib/household/contacts';
export const runtime='nodejs';
export async function GET(){const t=await currentTenant();if(!t)return reply({error:'Unauthorized'},401);try{return reply(await residentContacts(tenantDb(),t.id));}catch{return reply({error:'Contact details are temporarily unavailable.'},503);}}
export async function PUT(request:Request){if(!sameOrigin(request))return reply({error:'Unauthorized'},401);const t=await currentTenant();if(!t)return reply({error:'Unauthorized'},401);let v;try{const raw=JSON.parse(new TextDecoder().decode(await boundedBody(request,4096)));if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid contact details.');v=contactInput(raw);}catch(e){return reply({error:e instanceof Error?e.message:'Check your contact details.'},400);}
 const db=tenantDb();try{const before=await residentContacts(db,t.id);if(before.snapshot!==v.snapshot)return reply({error:'Your contact details changed. Reload this page before saving.'},409);if(before.email===v.email&&before.phone===v.phone)return reply({...before,unchanged:true});
 // The first statement aborts the whole transaction on a stale snapshot or revoked assignment.
 const guard=`(${contactSnapshotSql})=? AND EXISTS(SELECT 1 FROM tenant_accounts t JOIN tenant_assignments a ON a.tenant_id=t.id JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE t.id=? AND t.active=1 AND a.active=1)`;
 const statements=[db.prepare(`INSERT INTO audit_log(id,action,entity_type,entity_id,record_before_json,record_after_json,user_actor) VALUES(?,'contact_updated','tenant_contact',?,?,?,CASE WHEN ${guard} THEN ? ELSE json('stale contact snapshot') END)`).bind(crypto.randomUUID(),t.id,JSON.stringify({email:before.email,phone:before.phone}),JSON.stringify({email:v.email,phone:v.phone}),t.id,v.snapshot,t.id,t.email)];
 statements.push(db.prepare('INSERT OR IGNORE INTO operations_tenants(tenant_id) VALUES(?)').bind(t.id),db.prepare("UPDATE operations_tenants SET phone=?,revision=revision+1,updated_at=datetime('now') WHERE tenant_id=?").bind(v.phone,t.id));
 for(const [kind,value] of [['email',v.email],['phone',v.phone]] as const){
  if(value===before[kind])continue;
  statements.push(db.prepare("UPDATE tenant_contacts SET archived=1,is_primary=0,revision=revision+1,updated_at=datetime('now') WHERE tenant_id=? AND contact_type=? AND archived=0 AND is_primary=1").bind(t.id,kind));
  if(value)statements.push(db.prepare(`INSERT INTO tenant_contacts(id,tenant_id,contact_type,label,value_raw,value_normalized,validation_state,is_primary) VALUES(?,?,?,'resident contact',?,?,'syntax_valid',1) ON CONFLICT(tenant_id,contact_type,value_raw) WHERE archived=0 DO UPDATE SET is_primary=1,revision=tenant_contacts.revision+1,updated_at=datetime('now')`).bind(crypto.randomUUID(),t.id,kind,value,kind==='email'?value:value.replace(/[^\d+]/g,'')));
 }
 await db.batch(statements);return reply(await residentContacts(db,t.id));
 }catch{return reply({error:'Your change could not be confirmed. Reload to check your contacts before retrying.'},409);}}
