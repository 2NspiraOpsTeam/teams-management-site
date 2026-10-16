import {all,type Actor,type Row} from './database';
import {fail} from './validation';
import {xlsx} from './spreadsheet';

/** Stable tenant IDs make a staff-edited workbook safe to reorder and re-upload. */
export function tenantWorkbookTable(rows:Row[]){
 const contacts=rows.map(r=>JSON.parse(r.contacts_json||'[]') as {type:string;value:string}[]);
 const phones=Math.max(2,...contacts.map(c=>c.filter(v=>v.type==='phone').length));
 const emails=Math.max(1,...contacts.map(c=>c.filter(v=>v.type==='email').length));
 if(phones+emails>20)fail('Too many contacts for one workbook row. Review this property’s contacts first.',422);
 const fields=[...Array.from({length:phones},(_,i)=>i?'Phone '+(i+1):'Phone'),...Array.from({length:emails},(_,i)=>i?'Email '+(i+1):'Email')];
 return [['Property','Unit','Tenant Name','Tenant ID',...fields],...rows.map((r,i)=>[
  r.building_id,r.unit_identifier,r.display_name,r.tenant_id,
  ...['phone','email'].flatMap((type,n)=>Array.from({length:n?emails:phones},(_,j)=>contacts[i].filter(v=>v.type===type)[j]?.value||''))
 ])];
}
export async function exportTenantWorkbook(a:Actor,property:string){
 if(!property)fail('Select a property before downloading its tenant workbook.');
 const buildings=await all(a.db,"SELECT id FROM buildings WHERE id=? AND publication_state!='archived'",property);
 if(buildings.length!==1)fail('Select an existing property.',404);
 const rows=await all(a.db,`SELECT DISTINCT a.building_id,u.unit_identifier,t.id AS tenant_id,t.display_name,
  (SELECT json_group_array(json_object('type',c.contact_type,'value',c.value_raw)) FROM (SELECT * FROM tenant_contacts WHERE tenant_id=t.id AND archived=0 ORDER BY contact_type,id) c) AS contacts_json
  FROM tenant_assignments a JOIN units u ON u.id=a.unit_id JOIN tenant_accounts t ON t.id=a.tenant_id
  LEFT JOIN operations_assignment_profiles p ON p.assignment_id=a.id
  WHERE a.building_id=? AND a.active=1 AND coalesce(p.assignment_status,'current')='current'
  ORDER BY u.unit_identifier,t.id LIMIT 1501`,property);
 if(rows.length>1500)fail('This property exceeds the 1,500-row workbook limit.',422);
 if(!rows.length)fail('No current tenants are recorded for this property. Use the blank Excel template to add its tenant list.',422);
 const bytes=xlsx(tenantWorkbookTable(rows));
 if(bytes.length>2_000_000)fail('Workbook exceeds the 2 MB upload limit. Review this property’s contacts first.',422);
 return new Response(bytes as BodyInit,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="teams-property-tenants.xlsx"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Export-Rows':String(rows.length)}});
}
