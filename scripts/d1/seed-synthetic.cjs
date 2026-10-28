// Generates ONLY synthetic data. Apply only to an isolated --local D1 state.
const fs=require('node:fs'),crypto=require('node:crypto');
if(!process.argv[2])throw Error('Provide output SQL path');
const quote=v=>"'"+String(v).replaceAll("'","''")+"'";
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const sql=["INSERT INTO admin_identities(email) VALUES('qa-admin@example.test');",`INSERT INTO admin_sessions(token_hash,email,expires_at) VALUES('${hash('a'.repeat(64))}','qa-admin@example.test',datetime('now','+1 day'));`];
const ids={buildings:[],units:[],tenants:[],leases:[],requests:[]};
for(let b=0;b<6;b++){
 const building=crypto.randomUUID();ids.buildings.push(building);
 sql.push(`INSERT INTO buildings(id,name,slug,address_json,publication_state) VALUES(${quote(building)},'[QA] Synthetic Building ${b}','synthetic-${b}','{"street":"${100+b} Example St","city":"Test City","state":"NY"}','draft');`);
 for(let u=0;u<30;u++){
 const unit=crypto.randomUUID(),tenant=crypto.randomUUID(),assignment=crypto.randomUUID(),lease=crypto.randomUUID();ids.units.push(unit);ids.tenants.push(tenant);ids.leases.push(lease);
 sql.push(`INSERT INTO units(id,building_id,unit_identifier,floor_number,status) VALUES('${unit}','${building}','${u+1}A',1,'unverified');`);
 sql.push(`INSERT INTO tenant_accounts(id,email,display_name,active) VALUES('${tenant}','synthetic-${b}-${u}@example.test','[QA] Person ${b}-${u}',1);`);
 sql.push(`INSERT INTO tenant_assignments(id,tenant_id,building_id,unit_id) VALUES('${assignment}','${tenant}','${building}','${unit}');`);
 sql.push(`INSERT INTO tenant_contacts(id,tenant_id,contact_type,value_raw,is_primary) VALUES('${crypto.randomUUID()}','${tenant}','phone','555-0100',1),('${crypto.randomUUID()}','${tenant}','email','synthetic-${b}-${u}@example.test',1);`);
 sql.push(`INSERT INTO operations_leases(id,unit_id,lease_start,lease_end,monthly_rent_cents,status) VALUES('${lease}','${unit}','2026-01-01','2027-12-31',200000,'active');`);
 sql.push(`INSERT INTO operations_leaseholders(lease_id,tenant_id,holder_role) VALUES('${lease}','${tenant}','leaseholder');`);
 sql.push(`INSERT INTO operations_rent_roll_source(unit_id,source_sha256,source_sheet,source_row,source_period,tenant_name,rent,source_values_json,imported_by) VALUES('${unit}','synthetic','QA',${b*30+u+1},'2026-10','[QA] Person ${b}-${u}','2000.00','{}','qa-admin@example.test');`);
 if(u===0){const request=crypto.randomUUID();ids.requests.push(request);sql.push(`INSERT INTO tenant_maintenance_requests(id,tenant_id,assignment_id,category,description,urgency,preferred_contact) VALUES('${request}','${tenant}','${assignment}','plumbing','[QA] Synthetic maintenance request','routine','email');`);}
 }
}
sql.push(`INSERT INTO tenant_sessions(token_hash,tenant_id,expires_at) VALUES('${hash('b'.repeat(64))}','${ids.tenants[0]}',datetime('now','+1 day'));`);
fs.writeFileSync(process.argv[2],sql.join('\n'));fs.writeFileSync(process.argv[2]+'.ids.json',JSON.stringify(ids));
console.log('Synthetic fixture: 6 buildings, 180 apartments/tenants/leases; no hosted writes.');
