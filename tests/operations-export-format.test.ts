import {expect,it,vi} from 'vitest';
import {unzipSync,strFromU8} from 'fflate';
vi.mock('../src/lib/admin-auth',()=>({adminEnv:()=>({}),requireAdmin:async()=>null}));
import {csv,safeCell,xlsx} from '../src/lib/operations/exports';
import readXlsxFile from 'read-excel-file/node';
it('escapes CSV quotes, commas, multiline Unicode and formula prefixes',()=>{
 const s=csv([['Apartment','ZIP','Name'],['001A','00123','Jo, "李"\nSmith'],['=1+1','  @SUM(A1)','-3']]);expect(s).toContain('"Jo, ""李""\nSmith"');expect(s).toContain('"\'=1+1"');expect(s).toContain('"\'  @SUM(A1)"');expect(safeCell('\t+cmd')).toBe("'\t+cmd");
});
it('produces real Excel workbooks preserving identifiers and treating formulas as strings',async()=>{
 const table=[['Apartment','ZIP','Name'],['001A','00123','=HYPERLINK("bad")'],['2B','10001','李 & "Smith"\nNext']];const bytes=xlsx(table),files=unzipSync(bytes);expect(strFromU8(files['xl/worksheets/sheet1.xml'])).not.toContain('<f>');expect(await readXlsxFile(Buffer.from(bytes))).toEqual([{sheet:'Teams export',data:table}]);
});

it('keeps trusted rent amounts numeric in Excel without treating text as a formula',async()=>{const result=await readXlsxFile(Buffer.from(xlsx([['Rent','Unit'],[2500.25,'001A']])));expect(result).toEqual([{sheet:'Teams export',data:[['Rent','Unit'],[2500.25,'001A']]}]);});
