import {all,page,pageResult,type Actor} from './database';
import {choice,fail} from './validation';
export async function phoneList(a:Actor,url:URL){
 const p=page(url),building=url.searchParams.get('buildingId')||'',occupancy=choice(url.searchParams.get('occupancy')||'current',['current','historical','all']),missing=url.searchParams.get('missing')||'',sort=choice(url.searchParams.get('sort')||'property',['property','apartment','tenant']),raw=(url.searchParams.get('q')||'').trim();if(raw.length>100)fail('Search must be 100 characters or fewer.');if(missing)choice(missing,['phone','email']);
 const q='%'+raw.replace(/[\\%_]/g,'\\$&')+'%',digits=raw.replace(/\D/g,'');
 const rows=await all(a.db,`SELECT a.id,a.tenant_id,a.unit_id,a.building_id,a.active,b.name AS property_name,b.address_json,u.unit_identifier,t.display_name,
 CASE WHEN a.active=1 THEN 'Current' ELSE 'Historical' END AS occupancy,
 COALESCE((SELECT group_concat(value_raw,'; ') FROM tenant_contacts c WHERE c.tenant_id=t.id AND c.archived=0 AND c.contact_type='phone'),p.phone) AS phones,
 (SELECT group_concat(value_raw,'; ') FROM tenant_contacts c WHERE c.tenant_id=t.id AND c.archived=0 AND c.contact_type='email') AS emails,
 p.preferred_contact
 FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id JOIN buildings b ON b.id=u.building_id JOIN tenant_accounts t ON t.id=a.tenant_id LEFT JOIN operations_tenants p ON p.tenant_id=t.id
 WHERE ${building?'a.building_id=?':'1=1'} ${occupancy==='current'?'AND a.active=1':occupancy==='historical'?'AND a.active=0':''}
 ${missing==='phone'?"AND COALESCE(p.phone,'')='' AND NOT EXISTS(SELECT 1 FROM tenant_contacts c WHERE c.tenant_id=t.id AND c.archived=0 AND c.contact_type='phone')":missing==='email'?"AND NOT EXISTS(SELECT 1 FROM tenant_contacts c WHERE c.tenant_id=t.id AND c.archived=0 AND c.contact_type='email')":''}
 AND (t.display_name LIKE ? ESCAPE '\\' OR b.name LIKE ? ESCAPE '\\' OR json_extract(b.address_json,'$.street') LIKE ? ESCAPE '\\' OR u.unit_identifier LIKE ? ESCAPE '\\' OR p.phone LIKE ? ESCAPE '\\' ${digits.length>=3?"OR replace(replace(replace(replace(replace(p.phone,' ',''),'-',''),'(',''),')',''),'.','') LIKE ?":''} OR EXISTS(SELECT 1 FROM tenant_contacts c WHERE c.tenant_id=t.id AND c.archived=0 AND (c.value_raw LIKE ? ESCAPE '\\' ${digits.length>=3?"OR (c.contact_type='phone' AND replace(replace(replace(replace(replace(c.value_raw,' ',''),'-',''),'(',''),')',''),'.','') LIKE ?)":''})))
 ORDER BY ${sort==='tenant'?'t.display_name COLLATE NOCASE,b.name COLLATE NOCASE,u.unit_identifier COLLATE NOCASE':sort==='apartment'?'u.unit_identifier COLLATE NOCASE,b.name COLLATE NOCASE,t.display_name COLLATE NOCASE':'b.name COLLATE NOCASE,u.unit_identifier COLLATE NOCASE,t.display_name COLLATE NOCASE'},a.id LIMIT 51 OFFSET ?`,...(building?[building]:[]),q,q,q,q,q,...(digits.length>=3?['%'+digits+'%']:[]),q,...(digits.length>=3?['%'+digits+'%']:[]),p.offset);
 return pageResult(rows,p.page);
}
export async function phonePrint(a:Actor,url:URL){const items=[];for(let page=0;page<20;page++){const scoped=new URL(url);scoped.searchParams.set('page',String(page));const d=await phoneList(a,scoped);items.push(...d.items);if(d.nextPage===null)return items;}return fail('More than 1,000 contacts match. Select a building or narrow the filters before printing.',422);}
