import { maintenanceStatus } from '../work-orders/server';
import { all,page,pageResult,search,type Actor } from './database';
import { choice } from './validation';
// One row per apartment, selected from the shared operational graph. No materialized records.
export async function rentRoll(a:Actor,url:URL){
 const p=page(url),building=url.searchParams.get('buildingId')||'',unit=url.searchParams.get('unitId')||'',q=search(url),review=url.searchParams.get('review')||'';
 if(review)choice(review,['missing_lease','occupancy','expiring']);
 const rows=await all(a.db,`SELECT u.id,u.building_id,u.unit_identifier,x.square_feet,x.bedrooms,b.name AS property_name,b.address_json,
 rr.source_period AS rent_roll_period,rr.tenant_name AS rent_roll_tenant,rr.status_code AS rent_roll_status,rr.square_footage AS rent_roll_square_footage,rr.bedrooms AS rent_roll_bedrooms,rr.lease_expiration AS rent_roll_expiration,rr.security AS rent_roll_security,rr.legal_rent AS rent_roll_legal_rent,rr.rent AS rent_roll_rent,
 (SELECT group_concat(t.display_name,'; ') FROM tenant_assignments ta JOIN tenant_accounts t ON t.id=ta.tenant_id WHERE ta.unit_id=u.id AND ta.active=1) AS occupants,
 CASE WHEN EXISTS(SELECT 1 FROM tenant_assignments ta WHERE ta.unit_id=u.id AND ta.active=1) THEN 'Current occupants' WHEN x.vacancy_confirmed=1 THEN 'Confirmed vacant' ELSE 'Needs occupancy review' END AS occupancy,
 (SELECT group_concat(s.full_name,'; ') FROM operations_superintendent_properties sp JOIN operations_superintendents s ON s.id=sp.superintendent_id WHERE sp.building_id=u.building_id AND sp.active=1 AND s.contact_status='active') AS superintendent,
 (SELECT COUNT(*) FROM tenant_maintenance_requests r JOIN tenant_assignments ta ON ta.id=r.assignment_id LEFT JOIN operations_work_order_profiles op ON op.request_id=r.id WHERE ta.unit_id=u.id AND ${maintenanceStatus()} NOT IN('completed','closed','cancelled')) AS open_maintenance,
 l.id AS lease_id,l.lease_start,l.lease_end,l.monthly_rent_cents,l.security_deposit_cents,
 CASE WHEN l.id IS NULL THEN 'Missing lease information' WHEN l.status IN('renewed','terminated') THEN l.status WHEN l.lease_end<date('now') THEN 'expired' WHEN l.lease_start>date('now') THEN 'Future agreement' WHEN l.lease_end<=date('now','+90 days') THEN 'expiring' ELSE l.status END AS lease_status,
 (SELECT group_concat(t.display_name,'; ') FROM operations_leaseholders h JOIN tenant_accounts t ON t.id=h.tenant_id WHERE h.lease_id=l.id AND h.active=1) AS leaseholders,
 (SELECT COUNT(*) FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start<=date('now') AND c.lease_end>=date('now')) AS current_lease_count
 FROM units u JOIN buildings b ON b.id=u.building_id LEFT JOIN operations_units x ON x.unit_id=u.id LEFT JOIN operations_rent_roll_source rr ON rr.unit_id=u.id
 LEFT JOIN operations_leases l ON l.id=COALESCE(
 (SELECT c.id FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start<=date('now') AND c.lease_end>=date('now') ORDER BY c.lease_end DESC,c.id LIMIT 1),
 (SELECT c.id FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start>date('now') ORDER BY c.lease_start,c.id LIMIT 1),
 (SELECT c.id FROM operations_leases c WHERE c.unit_id=u.id ORDER BY c.lease_end DESC,c.id LIMIT 1))
 WHERE b.publication_state!='archived' ${building?'AND u.building_id=?':''} ${unit?'AND u.id=?':''}
 AND (rr.tenant_name LIKE ? ESCAPE '\\' OR u.unit_identifier LIKE ? ESCAPE '\\' OR b.name LIKE ? ESCAPE '\\' OR EXISTS(SELECT 1 FROM tenant_assignments ta JOIN tenant_accounts t ON t.id=ta.tenant_id WHERE ta.unit_id=u.id AND ta.active=1 AND t.display_name LIKE ? ESCAPE '\\'))
 ${review==='missing_lease'?"AND NOT EXISTS(SELECT 1 FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start<=date('now') AND c.lease_end>=date('now'))":review==='occupancy'?"AND COALESCE(x.vacancy_confirmed,0)=0 AND NOT EXISTS(SELECT 1 FROM tenant_assignments ta WHERE ta.unit_id=u.id AND ta.active=1)":review==='expiring'?"AND l.status IN('active','expiring') AND l.lease_end BETWEEN date('now') AND date('now','+90 days')":''}
 ORDER BY b.name COLLATE NOCASE,u.unit_identifier COLLATE NOCASE,u.id LIMIT 51 OFFSET ?`,...(building?[building]:[]),...(unit?[unit]:[]),q,q,q,q,p.offset);
 return pageResult(rows,p.page);
}
