import {phoneList} from './phone-list';
import {zipSync,strToU8} from 'fflate';
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
 properties:[['Property',field('name')],['Full address',address],['ZIP code',zip],['Apartments',field('total_units')],['Apartments with current occupants',field('occupied_units')],['Current occupants',field('current_occupants')],['Confirmed vacant apartments',field('confirmed_vacant_units')],['Superintendent',field('superintendent_names')],['Open maintenance',field('open_maintenance')]],
 units:[...base,['Full address',address],['ZIP code',zip],['Occupants and assignment status',r=>(r.associations||[]).map((a:Row)=>`${a.display_name||'Unnamed'} (${a.active?'Current':'Historical / proposed'})`).join('; ')],['Status',field('status')],['Confirmed vacant',r=>r.vacancy_confirmed?'Yes':'No'],['Lease end',field('lease_end')],['Open maintenance',field('open_maintenance')]],
 tenants:[['Tenant',field('display_name')],['Phone contacts',field('all_phones')],['Email contacts',field('all_emails')],['Residence',field('residence')],['Directory status',field('directory_status')],['Lease expirations',field('lease_expirations')]],
 leases:[...base,['Lease ID',field('id')],['Leaseholders',field('leaseholders')],['Lease start',field('lease_start')],['Lease end',field('lease_end')],['Monthly rent (USD)',money('monthly_rent_cents')],['Security deposit (USD)',money('security_deposit_cents')],['Lease status',field('effective_status')],['Renewal status',field('renewal_status')]],
 superintendents:[['Name',field('full_name')],['Mobile phone',field('mobile_phone')],['Work phone',field('work_phone')],['Email',field('email')],['Languages',field('languages')],['Assigned buildings',field('properties')],['Contact status',field('contact_status')]],
 maintenance:[['Request number',field('number')],...base,['Tenant',field('display_name')],['Category',field('category')],['Priority',field('urgency')],['Status',field('status')],['Submitted',field('submitted_at')],['Superintendent',field('superintendent_name')]],
 'rent-roll':[...base,['Full address',address],['ZIP code',zip],['Current occupants',field('occupants')],['Occupancy',field('occupancy')],['Leaseholders',field('leaseholders')],['Lease status',field('lease_status')],['Lease start',field('lease_start')],['Lease end',field('lease_end')],['Monthly rent (USD)',money('monthly_rent_cents')],['Security deposit (USD)',money('security_deposit_cents')],['Superintendent',field('superintendent')],['Open maintenance',field('open_maintenance')],['Current lease count (review if >1)',field('current_lease_count')]],
 'phone-list':[...base,['Full address',address],['ZIP code',zip],['Tenant name',field('display_name')],['Phone numbers',field('phones')],['Email addresses',field('emails')],['Occupancy',field('occupancy')],['Preferred contact',field('preferred_contact')]],
 inquiries:[['Received',field('created_at')],['Category',field('category')],['Status',field('status')],['Name',field('name')],['Email',field('email')],['Phone',field('phone')],['Property interest',field('property_interest')],['Message',field('message')]],
};
export const safeCell=(value:unknown)=>{const text=value==null?'':String(value);return /^[\s\u0000-\u001f]*[=+@-]/u.test(text)?"'"+text:text;};
export function csv(table:unknown[][]){return '\ufeff'+table.map(row=>row.map(v=>'"'+safeCell(v).replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';}
const xml=(v:unknown)=>String(v??'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
// User-entered text is always an explicit string, never a formula; identifiers retain leading zeros.
// Trusted numeric amounts and counts remain numeric for staff Excel calculations.
export function xlsx(table:unknown[][]){const files:Record<string,Uint8Array>={};const put=(path:string,value:string)=>{files[path]=strToU8(value);};
 put('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
 put('_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
 put('xl/workbook.xml','<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Teams export" sheetId="1" r:id="rId1"/></sheets></workbook>');
 put('xl/_rels/workbook.xml.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>');
 const letter=(n:number)=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
 put('xl/worksheets/sheet1.xml','<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>'+table.map((row,i)=>`<row r="${i+1}">`+row.map((v,j)=>typeof v==='number'&&Number.isFinite(v)?`<c r="${letter(j)}${i+1}" t="n"><v>${v}</v></c>`:`<c r="${letter(j)}${i+1}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`).join('')+'</row>').join('')+`</sheetData><autoFilter ref="A1:${letter(table[0].length-1)}${table.length}"/></worksheet>`);
 return zipSync(files,{level:6});
}
export async function exportRecords(a:Actor,entity:string,url:URL){
 if(!columns[entity])fail('Export is not available for this list.',404);const format=choice(url.searchParams.get('format')||'csv',['csv','xlsx']);let rows:Row[]=[];
 // Ignore the visible page: export every matching row up to a hard budget, never silently truncate.
 if(entity==='inquiries'){const status=url.searchParams.get('status')||'';if(status)choice(status,['submitted','routing_followup','resolved']);rows=await all(a.db,`SELECT i.id,i.created_at,i.category,i.status,d.name,d.email,d.phone,d.property_interest,d.message FROM inquiries i LEFT JOIN inquiry_details d ON d.inquiry_id=i.id WHERE (?='' OR i.status=?) ORDER BY i.created_at DESC,i.id LIMIT 1001`,status,status);if(rows.length>1000)fail('More than 1,000 records match. Narrow the filters before exporting.',422);
 }else{for(let page=0;page<20;page++){const scoped=new URL(url);scoped.searchParams.set('page',String(page));const result=entity==='phone-list'?await phoneList(a,scoped):entity==='rent-roll'?await rentRoll(a,scoped):await list(a,entity,scoped);rows.push(...result.items);if(result.nextPage===null)break;if(page===19)fail('More than 1,000 records match. Narrow the filters before exporting.',422);}}
 const table:unknown[][]=[columns[entity].map(([name])=>name),...rows.map(row=>columns[entity].map(([,get])=>get(row)))];
 await auditStatement(a,'operations_export',crypto.randomUUID(),null,{entity,format,count:rows.length,filters:Object.fromEntries([...url.searchParams].filter(([k])=>!['page','format'].includes(k)))},'exported').run();
 const content=format==='csv'?csv(table):xlsx(table);return new Response(content as BodyInit,{headers:{'Content-Type':format==='csv'?'text/csv; charset=utf-8':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="teams-${entity}-${new Date().toISOString().slice(0,10)}.${format}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Export-Rows':String(rows.length)}});
}
