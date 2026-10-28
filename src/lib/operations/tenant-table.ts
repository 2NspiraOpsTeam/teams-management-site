export const tenantTableHeaders=['Property','Unit','Tenant Name','Main Phone','Alt Number','Email'];
// Clipboard tables retain column boundaries; space-delimited prose is deliberately not guessed.
export function tenantTable(text:string,property:string){
 if(!property)throw Error('Select an existing property first.');
 if(text.length>500_000)throw Error('Paste fewer than 500,000 characters.');
 const rows=text.replace(/^\uFEFF/,'').replace(/^[\r\n]+|[\r\n]+$/g,'').split(/\r?\n/).filter(r=>r.trim()).map(r=>r.split('\t').map(c=>c.trim()));
 if(rows.length<2||rows.length>1501)throw Error('Include a header and between 1 and 1,500 tenant rows.');
 const normalized=rows[0].map(h=>h.toLowerCase());
 const expected=['unit','tenant name','main phone','alt number','email'];
 if(!expected.every(h=>normalized.filter(v=>v===h).length===1)||normalized.some(h=>!['property',...expected].includes(h))||new Set(normalized).size!==normalized.length)throw Error('Use template headers: Unit, Tenant Name, Main Phone, Alt Number, Email; optional Property. Copy directly from spreadsheet cells.');
 const width=rows[0].length;
 return [tenantTableHeaders,...rows.slice(1).map((r,i)=>{
  if(r.length!==width)throw Error(`Row ${i+2}: column count differs from the header. Copy all cells, including blank contacts.`);
  const get=(h:string)=>r[normalized.indexOf(h)]||'';
  if(get('property')&&get('property')!==property)throw Error(`Row ${i+2}: Property must match the selected property's ID, or leave it blank.`);
  if(!get('unit')||!get('tenant name'))throw Error(`Row ${i+2}: Unit and Tenant Name are required. Remove title-only rows.`);
  return [property,...expected.map(get)];
 })];
}
