import { maintenanceStatus } from '../work-orders/server';
import { all,page,pageResult,search,type Actor } from './database';
import { choice } from './validation';
// One row per apartment, selected from the shared operational graph. No materialized records.
export async function rentRoll(a:Actor,url:URL){
 const p=page(url),building=url.searchParams.get('buildingId')||'',unit=url.searchParams.get('unitId')||'',tenant=url.searchParams.get('tenantId')||'',q=search(url),review=url.searchParams.get('review')||'';
 if(review)choice(review,['missing_lease','occupancy','expiring','reconciliation']);
 const sql=`SELECT COUNT(*) OVER() AS filtered_total,u.id,u.building_id,u.unit_identifier,x.square_feet,x.bedrooms,b.name AS property_name,b.address_json,
 ri.outcome AS reconciliation_outcome,ri.review_reason AS reconciliation_reason,ri.tenant_id AS reconciled_tenant_id,rr.source_period AS rent_roll_period,rr.tenant_name AS rent_roll_tenant,rr.status_code AS rent_roll_status,rr.square_footage AS rent_roll_square_footage,rr.bedrooms AS rent_roll_bedrooms,rr.lease_expiration AS rent_roll_expiration,rr.security AS rent_roll_security,rr.legal_rent AS rent_roll_legal_rent,rr.rent AS rent_roll_rent,rr.move_in_date AS rent_roll_move_in_date,rr.rentredi AS rent_roll_rentredi,rr.utility_reimbursement AS rent_roll_utility_reimbursement,rr.additional_notes AS rent_roll_additional_notes,
 (SELECT group_concat(t.display_name,'; ') FROM tenant_assignments ta JOIN tenant_accounts t ON t.id=ta.tenant_id WHERE ta.unit_id=u.id AND ta.active=1) AS occupants,
 CASE WHEN EXISTS(SELECT 1 FROM tenant_assignments ta WHERE ta.unit_id=u.id AND ta.active=1) THEN 'Current occupants' WHEN x.vacancy_confirmed=1 THEN 'Confirmed vacant' ELSE 'Needs occupancy review' END AS occupancy,
 (SELECT group_concat(s.full_name,'; ') FROM operations_superintendent_properties sp JOIN operations_superintendents s ON s.id=sp.superintendent_id WHERE sp.building_id=u.building_id AND sp.active=1 AND s.contact_status='active') AS superintendent,
 (SELECT COUNT(*) FROM tenant_maintenance_requests r JOIN tenant_assignments ta ON ta.id=r.assignment_id LEFT JOIN operations_work_order_profiles op ON op.request_id=r.id WHERE ta.unit_id=u.id AND ${maintenanceStatus()} NOT IN('completed','closed','cancelled')) AS open_maintenance,
 l.id AS lease_id,l.lease_start,l.lease_end,l.monthly_rent_cents,l.security_deposit_cents,
 CASE WHEN l.id IS NULL THEN CASE WHEN rr.unit_id IS NOT NULL THEN 'Recorded terms · agreement not supplied' ELSE 'Lease information not supplied' END WHEN l.status IN('renewed','terminated') THEN l.status WHEN l.lease_end<date('now') THEN 'expired' WHEN l.lease_start>date('now') THEN 'Future agreement' WHEN l.lease_end<=date('now','+90 days') THEN 'expiring' ELSE l.status END AS lease_status,
 (SELECT group_concat(t.display_name,'; ') FROM operations_leaseholders h JOIN tenant_accounts t ON t.id=h.tenant_id WHERE h.lease_id=l.id AND h.active=1) AS leaseholders,
 (SELECT COUNT(*) FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start<=date('now') AND c.lease_end>=date('now')) AS current_lease_count
 FROM units u JOIN buildings b ON b.id=u.building_id LEFT JOIN operations_units x ON x.unit_id=u.id LEFT JOIN operations_rent_roll_source rr ON rr.unit_id=u.id LEFT JOIN tenant_import_items ri ON ri.source_sha256=rr.source_sha256 AND ri.record_id='rentroll:'||u.id AND ri.source_cell='@row'
 LEFT JOIN operations_leases l ON l.id=COALESCE(
 (SELECT c.id FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start<=date('now') AND c.lease_end>=date('now') ORDER BY c.lease_end DESC,c.id LIMIT 1),
 (SELECT c.id FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start>date('now') ORDER BY c.lease_start,c.id LIMIT 1),
 (SELECT c.id FROM operations_leases c WHERE c.unit_id=u.id ORDER BY c.lease_end DESC,c.id LIMIT 1))
 WHERE b.publication_state!='archived' ${url.searchParams.get('recordedOnly')==='1'?"AND rr.source_period IS NOT NULL AND rr.source_period!='' AND l.id IS NULL":''} ${building?'AND u.building_id=?':''} ${unit?'AND u.id=?':''} ${tenant?'AND EXISTS(SELECT 1 FROM tenant_assignments a WHERE a.unit_id=u.id AND a.tenant_id=? AND a.active=1)':''}
 AND (rr.tenant_name LIKE ? ESCAPE '\\' OR u.unit_identifier LIKE ? ESCAPE '\\' OR b.name LIKE ? ESCAPE '\\' OR EXISTS(SELECT 1 FROM tenant_assignments ta JOIN tenant_accounts t ON t.id=ta.tenant_id WHERE ta.unit_id=u.id AND ta.active=1 AND t.display_name LIKE ? ESCAPE '\\'))
 ${review==='reconciliation'?"AND ri.outcome='hold'":review==='missing_lease'?"AND NOT EXISTS(SELECT 1 FROM operations_leases c WHERE c.unit_id=u.id AND c.status IN('active','expiring') AND c.lease_start<=date('now') AND c.lease_end>=date('now'))":review==='occupancy'?"AND COALESCE(x.vacancy_confirmed,0)=0 AND NOT EXISTS(SELECT 1 FROM tenant_assignments ta WHERE ta.unit_id=u.id AND ta.active=1)":review==='expiring'?"AND l.status IN('active','expiring') AND l.lease_end BETWEEN date('now') AND date('now','+90 days')":''}
 ORDER BY b.name COLLATE NOCASE,u.unit_identifier COLLATE NOCASE,u.id`;
 const args=[...(building?[building]:[]),...(unit?[unit]:[]),...(tenant?[tenant]:[]),q,q,q,q];
 const grouped=url.searchParams.get('group349351')==='1'&&['real-349-w-46th-st','real-351-w-46th-st','real-349-351-w-46th-st'].includes(building);
 const effectiveSql=grouped?sql.replace('AND u.building_id=?',"AND u.building_id IN ('real-349-w-46th-st','real-351-w-46th-st','real-349-351-w-46th-st')"):sql;
 const effectiveArgs=grouped?args.slice(1):args;
 const rows=await all(a.db,effectiveSql+' LIMIT 51 OFFSET ?',...effectiveArgs,p.offset);
 const amounts=await all(a.db,`SELECT rent_roll_rent FROM (${effectiveSql})`,...effectiveArgs);
 let workbookMonthlyRentCents=0,unavailableRentCount=0;
 for(const row of amounts){const raw=String(row.rent_roll_rent??'').trim().replace(/[$,]/g,'');if(!/^-?\d+(?:\.\d{1,2})?$/.test(raw)){unavailableRentCount++;continue;}const negative=raw.startsWith('-'),[whole,fraction='']=raw.replace(/^-/,'').split('.');workbookMonthlyRentCents+=(negative?-1:1)*(Number(whole)*100+Number(fraction.padEnd(2,'0')));}
 return {...pageResult(rows,p.page),total:rows[0]?.filtered_total??0,workbookMonthlyRentCents,unavailableRentCount};
}
