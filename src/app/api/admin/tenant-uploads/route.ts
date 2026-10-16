import {exportTenantWorkbook} from '@/lib/operations/tenant-workbook';
import {requireAdmin,sameOrigin,unauthorized} from '@/lib/admin-auth';
import {boundedBody,BodyTooLarge} from '@/lib/request-body';
import {all,body} from '@/lib/operations/database';
import {json} from '@/lib/operations/handler';
import {OperationError} from '@/lib/operations/validation';
import {catalog,getUpload,importUpload,loadSeed,resolveUpload,saveUpload} from '@/lib/operations/tenant-upload';
import {parseUpload} from '@/lib/operations/tenant-upload-parser';
export const runtime='nodejs';
export async function GET(request:Request){const a=await requireAdmin();if(!a)return unauthorized();try{
 const url=new URL(request.url),id=url.searchParams.get('id');
 if(url.searchParams.get('format')==='xlsx')return await exportTenantWorkbook(a,url.searchParams.get('property')||'');
 if(id&&!/^[a-f0-9]{64}$/.test(id))return json({error:'Invalid upload.'},400);
 return json(id?await getUpload(a,id):{...await catalog(a),uploads:await all(a.db,'SELECT id,file_name,created_at FROM tenant_uploads ORDER BY created_at DESC LIMIT 30')});
 }catch(e){return error(e);}}
export async function POST(request:Request){const a=await requireAdmin();if(!a||!sameOrigin(request))return unauthorized();try{
 const type=request.headers.get('content-type')||'';
 if(type==='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
  const rawName=decodeURIComponent(request.headers.get('x-file-name')||'');
  if(!/\.xlsx$/i.test(rawName)||rawName.length>200)return json({error:'Select an .xlsx workbook.'},400);
  const bytes=await boundedBody(request,2_000_000);
  const source=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes as BufferSource)),b=>b.toString(16).padStart(2,'0')).join('');
  const existing=await all(a.db,'SELECT id FROM tenant_uploads WHERE id=?',source);
  if(existing.length)return json({...await getUpload(a,source),duplicateUpload:true});
  const seed=await loadSeed(a);
  let rows;try{rows=await parseUpload(bytes,seed);}catch(e){const message=e instanceof Error?e.message:'';return json({error:/^(Use |Select |Workbook |Macros |Duplicate column|A source row|Original-roster)/.test(message)?message:'Select a valid values-only .xlsx workbook.'},400);}
  return json(await saveUpload(a,source,rawName,rows),201);
 }
 const input=await body(request);
 if(typeof input.id!=='string'||!/^[a-f0-9]{64}$/.test(input.id)||!Number.isInteger(input.revision))return json({error:'Invalid upload.'},400);
 if(input.action==='review')return json(await resolveUpload(a,input.id,input.revision,input.record,input.value));
 if(input.action==='import')return json(await importUpload(a,input.id,input.revision));
 return json({error:'Unknown upload action.'},400);
 }catch(e){return error(e);}}
function error(e:unknown){
 if(e instanceof BodyTooLarge)return json({error:'Use a workbook smaller than 2 MB.'},413);
 if(e instanceof OperationError)return json({error:e.message},e.status);
 // Parser errors are controlled messages; never return D1, source data or stack traces.
 const message=e instanceof Error?e.message:'';
 if(/^(Use |Select |Workbook |Macros |Duplicate column|A source row|Original-roster)/.test(message))return json({error:message},400);
 return json({error:'The upload operation was not confirmed. Keep this upload and reload before retrying; completed records are retained.'},503);
}
