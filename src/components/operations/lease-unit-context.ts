import type {RecordRow} from './shared';
/** Reuse confirmed residence identities, never workbook-only names or permissions. */
export function leaseUnitContext(unit:RecordRow){
 const seen=new Set<string>();
 const holders=(unit.assignments||[]).filter((a:RecordRow)=>a.active&&a.assignment_status!=='proposed'&&a.tenant_id&&!seen.has(a.tenant_id)&&!!seen.add(a.tenant_id)).map((a:RecordRow)=>({tenant_id:a.tenant_id,display_name:a.display_name,email:a.contact_email,active:true,holder_role:['primary_leaseholder','leaseholder','authorized_occupant'].includes(a.occupant_role)?a.occupant_role:'authorized_occupant',can_view_document:false,show_rent:false}));
 return {building_id:unit.building_id,unit_id:unit.id,context_locked:true,context_property_name:unit.property_name,context_unit_identifier:unit.unit_identifier,holders};
}
