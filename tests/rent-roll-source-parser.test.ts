import {it,expect,vi} from 'vitest';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {xlsx} from '../src/lib/operations/spreadsheet';
const require=createRequire(import.meta.url);const {prepare,address}=require('../scripts/rent-roll/prepare.cjs');
it('matches address variants without changing literal unit semantics and resolves fields by their headers, retaining zeros, text and provenance',async()=>{
 const root=mkdtempSync(join(tmpdir(),'rentroll-parser-')),file=join(root,'fixture.xlsx'),inventory=join(root,'inventory.json');const log=vi.spyOn(console,'log').mockImplementation(()=>{});
 writeFileSync(file,xlsx([['42-70 156TH Street Flushing, NY 11355'],['APT','TENANT NAME','STATUS','SQUARE FOOTAGE','# BEDROOMS','MOVE IN DATE','EXPIRATION DATE','SECURITY','LEGAL RENT','RENT'],['01','QA Literal Name','D','850','2 + office',null,'Month to Month',0,'D',1250.25],['1','Other record','RC',null,0,null,'2027-11-30',null,1500,0],[null,null,null,null,null,null,null,null,'Monthly Total',1250.25]]));writeFileSync(inventory,JSON.stringify([{},{},{results:[{id:'b1',address_json:JSON.stringify({street:'42-70 156th St'})}]},{results:[{id:'u1',building_id:'b1',unit_identifier:'01'}]}]));
 try{const p=await prepare(file,inventory,root);expect(p.total).toBe(2);expect(p.ready).toHaveLength(1);expect(p.held).toHaveLength(1);expect(p.ready[0]).toMatchObject({unit_id:'u1',source_row:3,status_code:'D',bedrooms:'2 + office',lease_expiration:'Month to Month',security:'0.00',legal_rent:'D',rent:'1250.25'});expect(address('41 WEST 46 STREET NEW YORK')).toBe('41 W 46 ST NEW YORK');}finally{log.mockRestore();}
});
