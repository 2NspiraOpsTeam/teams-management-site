import {expect,it} from 'vitest';
import {leaseUnitContext} from '../src/components/operations/lease-unit-context';
it('prefills saved apartment tenants without inferring workbook identities or carrying permissions',()=>{
 const context=leaseUnitContext({id:'unit-a',building_id:'property-a',property_name:'QA Property',unit_identifier:'2A',rent_roll_tenant:'Workbook-only person',assignments:[
  {tenant_id:'tenant-a',display_name:'QA One',active:1,occupant_role:'leaseholder',can_view_document:true,show_rent:true},
  {tenant_id:'tenant-a',display_name:'Duplicate',active:1},
  {tenant_id:'tenant-b',display_name:'QA Two',active:1,occupant_role:'authorized_occupant'},
  {tenant_id:'tenant-old',active:0},{tenant_id:'tenant-proposed',active:1,assignment_status:'proposed'}]});
 expect(context).toMatchObject({building_id:'property-a',unit_id:'unit-a',context_locked:true});
 expect(context.holders.map((h:any)=>h.tenant_id)).toEqual(['tenant-a','tenant-b']);
 expect(context.holders.map((h:any)=>h.holder_role)).toEqual(['leaseholder','authorized_occupant']);
 expect(context.holders.every((h:any)=>!h.can_view_document&&!h.show_rent)).toBe(true);
 expect(leaseUnitContext({id:'empty',assignments:[],rent_roll_tenant:'Unknown'}).holders).toEqual([]);
});
