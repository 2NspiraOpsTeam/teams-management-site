// Private one-time workbook reconciliation. Never writes to D1. Run from this checkout.
// node scripts/rent-roll/prepare.cjs <workbook.xlsx> <inventory.json> <private-output-directory>
const fs=require('fs'),path=require('path'),crypto=require('crypto'),read=require('read-excel-file/node');
const {sourceFields}=require('./source-fields.cjs');
const norm=v=>String(v??'').trim().toUpperCase();
const address=v=>norm(v).replace(/\bEAST\b/g,'E').replace(/\bWEST\b/g,'W').replace(/\bFIRST\b/g,'1ST').replace(/\bSECOND\b/g,'2ND').replace(/\bSTREET\b/g,'ST').replace(/\bAVENUE\b/g,'AVE').replace(/(\d+)(?:ST|ND|RD|TH)\b/g,'$1').replace(/\s+/g,' ');
const text=v=>v==null||v===''?null:v instanceof Date?v.toISOString().slice(0,10):String(v).trim();
const money=v=>typeof v==='number'?v.toFixed(2):text(v);
async function prepare(input,inventoryFile,out){
 const inventory=JSON.parse(fs.readFileSync(inventoryFile)),buildings=inventory[2].results,units=inventory[3].results;
 const sha=crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex');
 // Reject formulas in the source; cached formula amounts are not approved source facts.
 const {unzipSync,strFromU8}=require('fflate');const files=unzipSync(fs.readFileSync(input));
 const formulas=Object.entries(files).filter(([name])=>/^xl\/worksheets\/sheet\d+\.xml$/.test(name)).map(([,bytes])=>[...strFromU8(bytes).matchAll(/<c\b[^>]*r="([A-Z]+)([0-9]+)"[^>]*>([\s\S]*?)<\/c>/g)].filter(m=>/<f[\s>]/.test(m[3])).map(m=>({column:m[1],row:Number(m[2])}))); 
 const sheets=await read(input),ready=[],held=[],skipped=[];let total=0;
 for(const [sheetIndex,sheet] of sheets.entries()){let property=null,headers=null,combined=false;
 for(let i=0;i<sheet.data.length;i++){const row=sheet.data[i],first=text(row[0]),second=text(row[1]);
  const a=address(first);const match=buildings.filter(b=>{const street=address(JSON.parse(b.address_json).street);return a===street||a.startsWith(street+' ');});
  if(match.length===1){property=match[0];headers=null;if(property.id==='real-349-w-46th-st'||property.id==='real-351-w-46th-st')combined=true;else combined=false;continue;}
  if(combined&&['349','351'].includes(first)){property=buildings.find(b=>b.id===`real-${first}-w-46th-st`);continue;}
  if(norm(first)==='APT'&&norm(second)==='TENANT NAME'){headers=row.map(norm);continue;}
  if(!headers||!second||second.startsWith('*')||(!first&&!row.some((v,k)=>k>1&&v!=null)))continue;
  if((formulas[sheetIndex]||[]).some(c=>c.row===i+1&&c.column.charCodeAt(0)-65<headers.filter(Boolean).length))throw Error('Formula in a rent-roll data field at row '+(i+1));
  total++;const field=name=>row[headers.indexOf(name)]??null;
  const item={...sourceFields(row,headers),source_sha256:sha,source_sheet:sheet.sheet,source_row:i+1,source_period:sheet.sheet,tenant_name:second,status_code:text(field('STATUS')),square_footage:text(field('SQUARE FOOTAGE')),bedrooms:text(field('# BEDROOMS')),lease_expiration:text(field('EXPIRATION DATE')),security:money(field('SECURITY')),legal_rent:money(field('LEGAL RENT')),rent:money(field('RENT')),source_values_json:JSON.stringify(row),property_id:property?.id,source_unit:first};
  if(!property||!first){held.push({...item,reason:'Missing exact property or apartment label'});continue;}
  if(combined&&norm(first)==='STORE'){held.push({...item,reason:'Shared 349/351 commercial address needs exact apartment mapping'});continue;}
  const literal=norm(first);let candidates=units.filter(u=>u.building_id===property.id&&norm(u.unit_identifier)===literal);
  // Parenthetical labels explicitly retain a unique leading apartment token.
  if(!candidates.length&&/^[^\s()]+\s+\(/.test(literal))candidates=units.filter(u=>u.building_id===property.id&&norm(u.unit_identifier)===literal.split(/\s+\(/)[0]);
  if(candidates.length!==1){held.push({...item,reason:'No unique existing apartment; no floor or commercial suite invented'});continue;}
  const unit=candidates[0];if(ready.some(r=>r.unit_id===unit.id)){held.push({...item,reason:'Repeated apartment source'});continue;}
  ready.push({...item,unit_id:unit.id,unit_identifier:unit.unit_identifier});
 }}
 const result={sha,total,ready,held,skipped};fs.mkdirSync(out,{recursive:true,mode:448});fs.writeFileSync(path.join(out,'plan.json'),JSON.stringify(result,null,2),{mode:384});
 console.log(JSON.stringify({sourceRows:total,matched:ready.length,held:held.length,byProperty:ready.reduce((a,r)=>(a[r.property_id]=(a[r.property_id]||0)+1,a),{}),exceptions:held.map(r=>({property:r.property_id,unit:r.source_unit,row:r.source_row,reason:r.reason}))},null,2));return result;
}
module.exports={prepare,address,text,money};if(require.main===module)prepare(...process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
