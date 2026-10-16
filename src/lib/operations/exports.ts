import {renewalData,filterRenewals} from './renewals';
import {phoneList} from './phone-list';
import {xlsx} from './spreadsheet';
export {xlsx} from './spreadsheet';
import {all,auditStatement,type Actor,type Row} from './database';
import {list} from './queries';
import {rentRoll} from './rent-roll';
import {choice,fail} from './validation';
type Column=[string,(r:Row)=>unknown];
const field=(key:string)=>(r:Row)=>r[key];
const money=(key:string)=>(r:Row)=>r[key]==null?'Not supplied':r[key]/100;
const address=(r:Row)=>{try{const a=JSON.parse(r.address_json);return [a.street,a.city,a.state,a.zip].filter(Boolean).join(', ');}catch{return 'Address needs review';}};
const zip=(r:Row)=>{try{return JSON.parse(r.address_json).zip||'';}catch{return '';}};
const base:Column[]=[['Property',field('property_name')],['Apartment',field('unit_identifier')]];
const columns:Record<string,Column[]>={
 renewals:[...base,['Tenant / leaseholder',field('tenant_name')],['Verified lease expiration',field('lease_end')],['Recorded expiration (unverified)',field('lease_expiration')],['Days until expiration',field('days_until')],['Current rent (USD)',money('monthly_rent_cents')],['Recorded rent (unverified)',field('rent')],['Renewal status',field('renewal_status')],['Assigned staff',field('staff_email')],['Last contact date',field('last_contact_date')],['Follow-up date',field('follow_up_date')],['Internal notes',field('internal_notes')],['Review reason',field('review_reason')]],
 properties:[['Property',field('name')],['Full address',address],['ZIP code',zip],['Apartments',field('total_units')],['Apartments with current occupants',field('occupied_units')],['Current occupants',field('current_occupants')],['Confirmed vacant apartments',field('confirmed_vacant_units')],['Superintendent',field('superintendent_names')],['Open maintenance',field('open_maintenance')]],
 units:[...base,['Full address',address],['ZIP code',zip],['Occupants and assignment status',r=>(r.associations||[]).map((a:Row)=>`${a.display_name||'Unnamed'} (${a.active?'Current':'Historical / proposed'})`).join('; ')],['Status',field('status')],['Confirmed vacant',r=>r.vacancy_confirmed?'Yes':'No'],['Lease end',field('lease_end')],['Open maintenance',field('open_maintenance')]],
 tenants:[['Tenant',field('display_name')],['Phone contacts',field('all_phones')],['Email contacts',field('all_emails')],['Residence',field('residence')],['Directory status',field('directory_status')],['Lease expirations',field('lease_expirations')]],
 leases:[...base,['Lease ID',field('id')],['Leaseholders',field('leaseholders')],['Lease start',field('lease_start')],['Lease end',field('lease_end')],['Monthly rent (USD)',money('monthly_rent_cents')],['Security deposit (USD)',money('security_deposit_cents')],['Lease status',field('effective_status')],['Renewal status',field('renewal_status')]],
 superintendents:[['Name',field('full_name')],['Mobile phone',field('mobile_phone')],['Work phone',field('work_phone')],['Email',field('email')],['Languages',field('languages')],['Assigned buildings',field('properties')],['Contact status',field('contact_status')]],
 maintenance:[['Request number',field('number')],...base,['Tenant',field('display_name')],['Category',field('category')],['Priority',field('urgency')],['Status',field('status')],['Submitted',field('submitted_at')],['Superintendent',field('superintendent_name')]],
 'rent-roll':[...base,...[['Workbook tenant','rent_roll_tenant'],['Status','rent_roll_status'],['Square footage','rent_roll_square_footage'],['Bedrooms','rent_roll_bedrooms'],['Lease expiration','rent_roll_expiration'],['Security','rent_roll_security'],['Legal rent','rent_roll_legal_rent'],['Rent','rent_roll_rent'],['Workbook period','rent_roll_period']].map(([name,key]):Column=>[name,field(key)]),['Full address',address],['ZIP code',zip],['Current occupants',field('occupants')],['Occupancy',field('occupancy')],['Leaseholders',field('leaseholders')],['Lease status',field('lease_status')],['Lease start',field('lease_start')],['Lease end',field('lease_end')],['Monthly rent (USD)',money('monthly_rent_cents')],['Security deposit (USD)',money('security_deposit_cents')],['Superintendent',field('superintendent')],['Open maintenance',field('open_maintenance')],['Current lease count (review if >1)',field('current_lease_count')]],
 'phone-list':[...base,['Full address',address],['ZIP code',zip],['Tenant name',field('display_name')],['Phone numbers',field('phones')],['Email addresses',field('emails')],['Occupancy',field('occupancy')],['Preferred contact',field('preferred_contact')]],
 inquiries:[['Received',field('created_at')],['Category',field('category')],['Status',field('status')],['Name',field('name')],['Email',field('email')],['Phone',field('phone')],['Property interest',field('property_interest')],['Message',field('message')]],
};
export const safeCell=(value:unknown)=>{const text=value==null?'':String(value);return /^[\s\u0000-\u001f]*[=+@-]/u.test(text)?"'"+text:text;};
export function csv(table:unknown[][]){return '\ufeff'+table.map(row=>row.map(v=>'"'+safeCell(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';}
export async function exportRecords(a:Actor,entity:string,url:URL){
 if(!columns[entity])fail('Export is not available for this list.',404);const format=choice(url.searchParams.get('format')||'csv',['csv','xlsx']);let rows:Row[]=[];
 // Ignore the visible page: export every matching row up to a hard budget, never silently truncate.
 if(entity==='renewals'){rows=filterRenewals(await renewalData(a),url);if(rows.length>1000)fail('More than 1,000 records match. Narrow filters before exporting.',422);
 }else if(entity==='inquiries'){const status=url.searchParams.get('status')||'';if(status)choice(status,['submitted','routing_followup','resolved']);rows=await all(a.db,`SELECT i.id,i.created_at,i.category,i.status,d.name,d.email,d.phone,d.property_interest,d.message FROM inquiries i LEFT JOIN inquiry_details d ON d.inquiry_id=i.id WHERE (?='' OR i.status=?) ORDER BY i.created_at DESC,i.id LIMIT 1001`,status,status);if(rows.length>1000)fail('More than 1,000 records match. Narrow the filters before exporting.',422);
 }else{for(let page=0;page<20;page++){const scoped=new URL(url);scoped.searchParams.set('page',String(page));const result=entity==='phone-list'?await phoneList(a,scoped):entity==='rent-roll'?await rentRoll(a,scoped):await list(a,entity,scoped);rows.push(...result.items);if(result.nextPage===null)break;if(page===19)fail('More than 1,000 records match. Narrow the filters before exporting.',422);}}
 const table:unknown[][]=[columns[entity].map(([name])=>name),...rows.map(row=>columns[entity].map(([,get])=>get(row)))];
 await auditStatement(a,'operations_export',crypto.randomUUID(),null,{entity,format,count:rows.length,filters:Object.fromEntries([...url.searchParams].filter(([k])=>!['page','format'].includes(k)))},'exported').run();
 const content=format==='csv'?csv(table):xlsx(table);return new Response(content as BodyInit,{headers:{'Content-Type':format==='csv'?'text/csv; charset=utf-8':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="teams-${entity}-${new Date().toISOString().slice(0,10)}.${format}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Export-Rows':String(rows.length)}});
}
