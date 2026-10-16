import {expect,it} from 'vitest';
import {tenantTable} from '../src/lib/operations/tenant-table';
import {xlsx} from '../src/lib/operations/spreadsheet';
import {parseUpload} from '../src/lib/operations/tenant-upload-parser';
it('round trips spreadsheet columns, leading zeros, alternate contacts and labels without splitting names',async()=>{
 const table=tenantTable('Unit\tTenant Name\tMain Phone\tAlt Number\tEmail\nB01\tSynthetic One & Two\t212-555-0100 daughter\t212-555-0101 work\t\n001\tSynthetic Three\t\t\t', 'building-id');
 const rows=await parseUpload(xlsx(table),null);
 expect(rows).toHaveLength(2);expect(rows[1].unit).toBe('001');expect(rows[0].name).toBe('Synthetic One & Two');expect(rows[0].contacts.map(c=>c.value)).toEqual(['212-555-0100 daughter','212-555-0101 work']);expect(rows[1].contacts).toEqual([]);
});
it('rejects missing, duplicate and ambiguous headers, title-only rows and cross-property paste',()=>{
 for(const text of ['Unit Tenant Name Main Phone Alt Number Email\nB01 Example', 'Unit\tUnit\nA\tB','Unit\tTenant Name\tMain Phone\tAlt Number\tEmail\n\tTitle\t\t\t','Property\tUnit\tTenant Name\tMain Phone\tAlt Number\tEmail\nother\tB01\tExample\t\t\t'])expect(()=>tenantTable(text,'building-id')).toThrow();
});
