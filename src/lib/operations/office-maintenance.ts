import { hash } from '@/lib/admin-auth';
import { category, text as orderText, uuid } from '@/lib/work-orders/server';
import { all, one, stmt, type Actor, type Row } from './database';
import { fail, id } from './validation';

export async function officeAssignments(a:Actor,building:string){
 return all(a.db,`SELECT a.id,a.unit_id,u.unit_identifier,a.tenant_id,t.display_name FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id JOIN tenant_accounts t ON t.id=a.tenant_id JOIN buildings b ON b.id=a.building_id WHERE a.building_id=? AND a.active=1 AND b.publication_state!='archived' ORDER BY u.unit_identifier COLLATE NOCASE,t.display_name,a.id`,id(building));
}
export async function createOfficeMaintenance(a:Actor,v:Row){
 const key=v.idempotencyKey;if(typeof key!=='string'||!uuid.test(key))fail('A valid retry receipt is required.');
 const building=id(v.buildingId),unit=id(v.unitId),assignment=id(v.assignmentId);
 let c:string,description:string,access:string;
 try{c=category(v.category);description=orderText(v.description,3000,10);access=orderText(v.accessInstructions??'',1000);}catch(e){return fail((e as Error).message);}
 if(!['routine','urgent'].includes(v.urgency)||!['email','phone'].includes(v.preferredContact)||![null,true,false].includes(v.permissionToEnter))fail('Choose urgency, contact method, and access permission.');
 const normalized={building,unit,assignment,c,description,access,urgency:v.urgency,contact:v.preferredContact,permission:v.permissionToEnter,actor:a.email};
 const fingerprint=await hash(JSON.stringify(normalized));
 const saved=()=>one(a.db,'SELECT d.number,d.payload_hash FROM work_order_details d JOIN tenant_maintenance_requests r ON r.id=d.request_id WHERE r.id=?',key);
 const previous=await saved();if(previous){if(previous.payload_hash!==fingerprint)fail('This receipt belongs to a different request.',409);return {id:key,number:previous.number,duplicate:true};}
 const linked=await one(a.db,`SELECT a.tenant_id FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id JOIN buildings b ON b.id=a.building_id WHERE a.id=? AND a.building_id=? AND a.unit_id=? AND a.active=1 AND b.publication_state!='archived'`,assignment,building,unit);
 if(!linked)fail('Choose a currently linked tenant for this apartment. Reload if the assignment changed.',409);
 try{await a.db.batch([
 stmt(a.db,`INSERT INTO tenant_maintenance_requests(id,tenant_id,assignment_id,category,description,urgency,preferred_contact) SELECT ?,a.tenant_id,a.id,?,?,?,? FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id JOIN buildings b ON b.id=a.building_id WHERE a.id=? AND a.building_id=? AND a.unit_id=? AND a.active=1 AND b.publication_state!='archived'`,key,c,description,v.urgency,v.preferredContact,assignment,building,unit),
 stmt(a.db,'UPDATE work_order_details SET permission_to_enter=?,access_instructions=?,payload_hash=? WHERE request_id=?',v.permissionToEnter===null?null:v.permissionToEnter?1:0,access,fingerprint,key),
 stmt(a.db,"UPDATE work_order_events SET actor_type='admin',actor_id=?,body='Request entered by the Admin office on behalf of the tenant.' WHERE id=?",a.email,'submitted-'+key),
 stmt(a.db,"INSERT INTO audit_log(id,action,entity_type,entity_id,record_after_json,user_actor) VALUES(?,'office_submitted','tenant_maintenance_request',?,?,?)",crypto.randomUUID(),key,JSON.stringify(normalized),a.email)
 ]);}catch{const retry=await saved();if(retry?.payload_hash===fingerprint)return {id:key,number:retry.number,duplicate:true};return fail('Could not save the request. Your draft is unchanged; retry safely.',503);}
 const result=await saved();if(!result)fail('The tenant assignment changed. Reload before retrying.',409);
 return {id:key,number:result!.number};
}
