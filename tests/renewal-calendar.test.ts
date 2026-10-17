import {it,expect,vi} from 'vitest';
vi.mock('../src/lib/operations/database',()=>({all:vi.fn(),one:vi.fn(),stmt:vi.fn(),commit:vi.fn(),auditStatement:vi.fn(),revision:vi.fn()}));
import {all,one,type Actor} from '../src/lib/operations/database';
import {renewalData,filterRenewals} from '../src/lib/operations/renewals';
it('counts recorded dates by month/year once per apartment, without requiring tenant assignments',async()=>{
 vi.mocked(one).mockResolvedValue(null);
 vi.mocked(all).mockResolvedValueOnce([
 {lease_id:'l1',unit_id:'a',lease_start:'2026-01-01',lease_end:'2026-12-31',lease_status:'active',assigned_holders:0,overlap_count:1},
 {lease_id:'old',unit_id:'b',lease_start:'2025-01-01',lease_end:'2026-11-01',lease_status:'terminated'},
 ]).mockResolvedValueOnce([
 {unit_id:'a',lease_expiration:'2026-11-30'},
 {unit_id:'b',lease_expiration:'2026-12-01'},
 {unit_id:'c',lease_expiration:'2027-01-31'},
 {unit_id:'d',lease_expiration:'2026-10-01'},
 {unit_id:'e',lease_expiration:'M/M'},
 {unit_id:'f',lease_expiration:'2026-02-30'},
 {unit_id:'g',lease_expiration:null},
 ]);
 const data=await renewalData({db:{}} as Actor,'2026-10-16');
 expect(data.months.slice(0,4).map(m=>m.count)).toEqual([1,1,1,1]);
 expect(data.summary.this_month).toBe(0); // Verified-workflow metrics stay unchanged.
 const december=filterRenewals(data,new URL('https://example.test/?view=calendar&month=2026-12'));
 expect(december.map(r=>r.unit_id)).toEqual(['b']);
 expect(filterRenewals(data,new URL('https://example.test/?view=calendar&month=2026-11'))[0].unit_id).toBe('a');
 expect(filterRenewals(data,new URL('https://example.test/?view=calendar&month=2027-01'))).toHaveLength(1);
});
