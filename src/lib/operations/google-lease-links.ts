import {auditStatement,commit,existing,one,stmt,type Actor,type Row} from './database';
import {fail,id} from './validation';

// Reuse the metadata-only lease-link contract; drive_id namespaces provider identities.
export function normalizeGoogleLeaseLink(v:Row){
 if(typeof v.webUrl!=='string'||v.webUrl.length>2048)fail('Paste a Google Drive file link of no more than 2048 characters.');
 let u:URL;try{u=new URL(v.webUrl);}catch{return fail('Paste a Google Drive file link.');}
 if(u.protocol!=='https:'||u.hostname!=='drive.google.com'||u.username||u.password||u.port||u.hash)fail('Use a secure drive.google.com file link.');
 const itemId=u.pathname.match(/^\/file\/d\/([\w-]{10,100})(?:\/view|\/preview)?\/?$/)?.[1];
 if(!itemId)fail('Paste a link to one PDF file, not a Drive folder.');
 for(const [key] of u.searchParams)if(!['usp','resourcekey'].includes(key))fail('Use the Google Drive file link, not a download or temporary link.');
 const resourceKeys=u.searchParams.getAll('resourcekey');
 if(resourceKeys.length>1||resourceKeys.some(k=>! /^[\w-]{1,200}$/.test(k)))fail('The Drive resource key is invalid.');
 const name=typeof v.name==='string'?v.name.trim():'';
 if(!name.toLowerCase().endsWith('.pdf')||name.length>240||/[\x00-\x1f]/.test(name))fail('Enter a document name ending in .pdf.');
 if(v.reviewed!==true)fail('Confirm you checked the PDF and its restricted sharing settings.');
 const canonical=new URL(`https://drive.google.com/file/d/${itemId}/view`);
 if(resourceKeys[0])canonical.searchParams.set('resourcekey',resourceKeys[0]);
 return {name,itemId:itemId!,webUrl:canonical.href};
}
export async function saveGoogleLeaseLink(a:Actor,leaseId:string,v:Row){
 await existing(a.db,'operations_leases','id',leaseId);
 const f=normalizeGoogleLeaseLink(v),provider='google-drive';
 const prior=await one(a.db,'SELECT id FROM operations_lease_links WHERE lease_id=? AND drive_id=? AND item_id=?',leaseId,provider,f.itemId);
 if(prior)return {id:prior.id,duplicate:true};
 const key=id(v.idempotencyKey);if(!/^[a-f0-9-]{36}$/i.test(key))fail('A valid retry receipt is required.');
 try{await commit(a,[stmt(a.db,'INSERT INTO operations_lease_links(id,lease_id,drive_id,item_id,file_name,web_url,created_by) VALUES(?,?,?,?,?,?,?)',key,leaseId,provider,f.itemId,f.name,f.webUrl,a.email),auditStatement(a,'operations_lease',leaseId,null,{document_id:key,file_name:f.name},'google_drive_linked')]);}
 catch(e){const winner=await one(a.db,'SELECT id FROM operations_lease_links WHERE lease_id=? AND drive_id=? AND item_id=?',leaseId,provider,f.itemId);if(winner)return {id:winner.id,duplicate:true};throw e;}
 return {id:key};
}
