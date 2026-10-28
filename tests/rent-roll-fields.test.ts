import {expect,it} from 'vitest';
import {createRequire} from 'node:module';
const {sourceFields}=createRequire(import.meta.url)('../scripts/rent-roll/source-fields.cjs');
it('reads dates by header, detects shifting RentRedi labels and retains other notes',()=>{
 const h=['APT','TENANT NAME','STATUS','MOVE IN DATE','RENT'];
 expect(sourceFields(['01','QA','D',new Date('2025-05-01T00:00:00Z'),1500,null,'Rent Redi','$150 storage'],h)).toEqual({move_in_date:'2025-05-01',rentredi:'RentRedi',utility_reimbursement:null,additional_notes:'$150 storage'});
 expect(sourceFields(['01','QA','D','2027-05-01',1500],['APT','TENANT NAME','STATUS','EXPIRATION DATE','RENT']).move_in_date).toBeNull();
});
it('preserves partial source dates and blank markers without inventing a no or a calendar date',()=>{
 expect(sourceFields(['01','QA','Comm','lease commenced 3/2023',0],['APT','TENANT NAME','STATUS','MOVE IN DATE','RENT'])).toMatchObject({move_in_date:'lease commenced 3/2023',rentredi:null});
});
it('keeps explicit zero utility reimbursement and does not label residential legal-rent codes as utilities',()=>{
 const h=['APT','TENANT NAME','STATUS','Utility Reimbursement','RENT'];
 expect(sourceFields(['2F','QA','Comm',0,0],h).utility_reimbursement).toBe('0');
 expect(sourceFields(['3A','QA','D','D',1500],h).utility_reimbursement).toBeNull();
});
