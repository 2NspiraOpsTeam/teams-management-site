import readXlsxFile from 'read-excel-file/universal';
import {unzipSync,strFromU8} from 'fflate';
import type {ReviewBundle} from './import-review';
export type UploadContact={type:'phone'|'email';value:string;cell:string};
export type UploadRow={id:string;sheet:string;row:number;name:string;property:string;unit:string;tenantId:string;floor:number|null;contacts:UploadContact[];reasons:string[];raw:string};
export const UPLOAD_PARSER='teams-manual-1';
const text=(v:unknown)=>v==null?'':String(v).trim();
function column(n:number){let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;}
export function inspectArchive(bytes:Uint8Array){
 if(bytes.length>2_000_000)throw Error('Use an .xlsx workbook smaller than 2 MB.');
 let size=0,count=0;
 const files=unzipSync(bytes,{filter(entry){size+=entry.originalSize;count++;if(size>12_000_000||count>300||entry.originalSize>4_000_000)throw Error('Workbook expands beyond the safe upload limit.');return true;}});
 if(!files['xl/workbook.xml']||!files['[Content_Types].xml'])throw Error('Select a valid .xlsx workbook.');
 for(const [name,data] of Object.entries(files)){
  if(/vbaProject|externalLinks|\.bin$/i.test(name))throw Error('Macros and external workbook links are not supported.');
  if(/\.xml$|\.rels$/i.test(name)){
   const xml=strFromU8(data);
   if(/<!DOCTYPE|<!ENTITY|<(?:\w+:)?f(?:\s|\/?>)|TargetMode\s*=\s*["']External/i.test(xml))throw Error('Use a values-only workbook without formulas or external links.');
   // Reject enormous sparse ranges before a reader allocates a sheet array.
   for(const m of xml.matchAll(/\br=["']([A-Z]+)(\d+)["']/g))if(m[1].length>2||Number(m[2])>3000)throw Error('Workbook exceeds 3,000 rows or supported columns.');
  }
 }
}
export async function parseUpload(bytes:Uint8Array,bundle:ReviewBundle|null):Promise<UploadRow[]>{
 inspectArchive(bytes);
 const sheets=await readXlsxFile(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength) as ArrayBuffer);
 if(sheets.length>30)throw Error('Use a workbook with no more than 30 worksheets.');
 const out:UploadRow[]=[];
 for(const sheet of sheets){
  const first=sheet.data.findIndex(r=>r.some(c=>text(c)));
  if(first<0)continue;
  const headers=sheet.data[first].map(c=>text(c).toLowerCase());
  const isTemplate=['property','unit','name'].every(h=>headers.includes(h));
  if(isTemplate){
   if(new Set(headers.filter(Boolean)).size!==headers.filter(Boolean).length)throw Error('Duplicate column headers.');
   const at=(r:unknown[],h:string)=>r[headers.indexOf(h)];
   sheet.data.slice(first+1).forEach((r,index)=>{
    if(!r.some(c=>text(c)))return;const row=index+first+2;
    const contacts:UploadContact[]=[];
    for(const type of ['phone','email'] as const)if(text(at(r,type)))contacts.push({type,value:text(at(r,type)),cell:column(headers.indexOf(type))+row});
    const floor=at(r,'floor');
    out.push({id:sheet.sheet+'!'+row,sheet:sheet.sheet,row,name:text(at(r,'name')),property:text(at(r,'property')),unit:typeof at(r,'unit')==='string'?text(at(r,'unit')):'',tenantId:text(at(r,'tenant id')),floor:typeof floor==='number'&&Number.isInteger(floor)?floor:null,contacts,reasons:typeof at(r,'unit')==='string'?[]:['Unit must be text to preserve leading zeros'],raw:r.map(text).join(' | ')});
   });continue;
  }
  if(!bundle)throw Error('Use columns Property, Unit, Name, Phone, Email (Unit formatted as text). Original-roster reconciliation is not available.');
  const candidates=bundle.records.filter(r=>r.source_sheet===sheet.sheet);
  const archive=bundle.source_archive.filter(r=>r.source_sheet===sheet.sheet);
  sheet.data.forEach((cells,index)=>{
   if(!cells.some(c=>text(c)))return;const row=index+1;
   const old=candidates.find(r=>r.source_row===row);
   if(!old){
    // Skip only unchanged, previously reconciled non-candidate context rows.
    const known=archive.filter(c=>Number(String(c.source_cell).replace(/\D/g,''))===row);
    const actual=cells.map((v,i)=>({cell:column(i)+row,value:text(v)})).filter(c=>c.value);
    if(known.length===actual.length&&actual.every(c=>known.some(k=>k.source_cell===c.cell&&text(k.source_value_raw)===c.value)))return;
    out.push({id:sheet.sheet+'!'+row,sheet:sheet.sheet,row,name:'',property:'',unit:'',tenantId:'',floor:null,contacts:[],reasons:['New or changed source row: confirm identity, property, unit and contacts'],raw:cells.map(text).join(' | ')});return;
   }
   const alias=bundle.aliases.find(a=>a.property_map_key===old.property_map_key);
   const sourceName=archive.find(c=>Number(String(c.source_cell).replace(/\D/g,''))===row&&text(c.source_value_raw)===text(old.source_customer_raw));
   const sourceColumn=sourceName?String(sourceName.source_cell).replace(/\d/g,''):'';
   const nameIndex=sourceColumn.split('').reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1;
   const unchanged=nameIndex>=0&&text(cells[nameIndex])===text(old.source_customer_raw);
   const contacts:UploadContact[]=[];
   // Include newly filled contact columns, not just cells populated in the first roster.
   const headerColumns=new Map<string,{type:'phone'|'email';row:number}>();
   for(const cell of archive){
    const header=text(cell.source_value_raw),headerRow=Number(String(cell.source_cell).replace(/\D/g,''));
    if(headerRow>=row||! /^(?:(?:(?:main|alt[ .]*|alternate|work|cc)\s*)?(?:phone|number|e-?mail)|cell\s*#?|mobile)$/i.test(header))continue;
    if(header.length>30||/@/.test(header))continue;
    const col=String(cell.source_cell).replace(/\d/g,'');
    if(!headerColumns.has(col)||headerColumns.get(col)!.row<headerRow)headerColumns.set(col,{type:/mail/i.test(header)?'email':'phone',row:headerRow});
   }
   for(const [col,header] of headerColumns){
    const index=col.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0)-1;
    if(text(cells[index]))contacts.push({type:header.type,value:text(cells[index]),cell:col+row});
   }
   for(const c of old.contacts||[]){
    const col=String(c.source_cell).replace(/\d/g,'').split('').reduce((n:number,ch:string)=>n*26+ch.charCodeAt(0)-64,0)-1;
    if(text(cells[col])&&!contacts.some(v=>v.cell===column(col)+row))contacts.push({type:c.contact_type,value:text(cells[col]),cell:column(col)+row});
   }
   const reasons=(old.flags||[]).filter((f:string)=>!/missing.*(email|phone|contact)|(?:email|phone).*missing/i.test(f));
   if(!unchanged)reasons.push('Source identity changed: explicit review required');
   if(alias?.resolution!=='exact_address_suggestion'||alias?.proposals?.length!==1)reasons.push('Property mapping needs confirmation');
   if(bundle.repeat_groups.some(g=>g.record_ids.includes(old.record_id)))reasons.push('Repeated source record: do not merge automatically');
   out.push({id:sheet.sheet+'!'+row,sheet:sheet.sheet,row,name:unchanged?text(old.tenant_name_proposed):'',property:alias?.proposals?.length===1?alias.proposals[0].id:'',unit:unchanged?text(old.unit_label_proposed):'',tenantId:'',floor:null,contacts,reasons,raw:cells.map(text).join(' | ')});
  });
 }
 if(!out.length||out.length>1500)throw Error('Workbook must contain between 1 and 1,500 candidate rows.');
 if(out.some(r=>r.raw.length>6000||r.contacts.some(c=>c.value.length>500)))throw Error('A source row or contact exceeds the supported length.');
 return out;
}
