'use client';
import {useEffect,useRef,useState} from 'react';
import {GoogleDriveLeasePdf} from './GoogleDriveLeasePdf';
import {RecordEditor} from './RecordEditor';
import {button,primary,read,type RecordRow} from './shared';

/** Tenant-scoped history, independent of directory filters and current occupancy. */
export function LeaseDocumentShortcut({assignments,tenantId,tenantName}:{assignments:RecordRow[];tenantId:string;tenantName:string}){
 const [leases,setLeases]=useState<RecordRow[]>([]),[next,setNext]=useState<number|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0),[draft,setDraft]=useState<RecordRow|null>(null),[notice,setNotice]=useState(''),[openLease,setOpenLease]=useState('');
 const lock=useRef(false);
 const units=assignments.filter(a=>a.assignment_status!=='proposed').filter((a,index,all)=>all.findIndex(b=>b.unit_id===a.unit_id)===index);
 useEffect(()=>{const c=new AbortController();setBusy(true);setError('');setLeases([]);setNext(null);void read('/leases?'+new URLSearchParams({tenantId,sort:'recent',page:'0'}),c.signal).then(d=>{setLeases(d.items);setNext(d.nextPage);}).catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setBusy(false);});return()=>c.abort();},[tenantId,retry]);
 async function more(){if(lock.current||next===null)return;lock.current=true;setBusy(true);setError('');try{const d=await read('/leases?'+new URLSearchParams({tenantId,sort:'recent',page:String(next)}));setLeases(old=>[...old,...d.items.filter((x:RecordRow)=>!old.some(l=>l.id===x.id))]);setNext(d.nextPage);}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}
 function add(a:RecordRow,historical:boolean){setNotice('');setDraft({building_id:a.building_id,unit_id:a.unit_id,context_locked:true,context_property_name:a.property_name,context_unit_identifier:a.unit_identifier,status:historical?'expired':'active',historical_entry:historical,holders:[{tenant_id:tenantId,display_name:tenantName,active:true,holder_role:'leaseholder',can_view_document:false,show_rent:false}]});}
 const ordered=[...leases].sort((a,b)=>Number(b.is_current)-Number(a.is_current)||b.lease_end.localeCompare(a.lease_end));
 return <section aria-label="Lease documents" className="mb-6 min-w-0 rounded border border-slate-400 bg-white p-5">
  <h2 className="text-xl font-semibold">Lease documents · current & earlier agreements</h2>
  <p className="mt-2 text-sm text-slate-600">{tenantName} is already selected. Open an agreement below and paste its OneDrive or Google Drive PDF link here—no property or apartment reselection.</p>
  {notice&&<p role="status" className="mt-3">{notice}</p>}
  {ordered.map(lease=><LeasePeriodPdf key={lease.id} lease={lease} autoOpen={lease.id===openLease}/>)}
  {busy&&<p role="status" className="mt-3">Loading lease agreements…</p>}
  {error&&<p role="alert" className="mt-3">{error} <button className={button} disabled={busy} onClick={()=>{if(leases.length)void more();else setRetry(x=>x+1);}}>Retry loading agreements</button></p>}
  {!busy&&!error&&!leases.length&&<p className="mt-3">No saved agreement is linked to this tenant yet. Add the verified current lease details below, then attach its PDF. Existing agreements are checked to prevent duplicates.</p>}
  {next!==null&&<button className={button+' mt-3'} disabled={busy} onClick={()=>void more()}>Load more earlier agreements</button>}
  {!draft&&units.map(a=><div key={a.unit_id} className="mt-4 border-t pt-4"><h3 className="font-semibold">{a.property_name} · Apartment {a.unit_identifier}{!a.active?' · Historical residence':''}</h3><div className="mt-3 flex flex-wrap gap-3">{!!a.active&&<button className={primary} onClick={()=>add(a,false)}>Add current lease · {a.unit_identifier}</button>}<button className={button} onClick={()=>add(a,true)}>Add earlier lease · {a.unit_identifier}</button></div><p className="mt-2 text-sm text-slate-600">Use these only for an agreement not already listed. Earlier leases are separate records and do not replace or renew the current agreement.</p></div>)}
  {draft&&<section className="mt-4 rounded border p-4"><h3 className="mb-3 font-semibold">{draft.historical_entry?'Add earlier lease':'Add current lease'} · {draft.context_property_name} · {draft.context_unit_identifier} · {tenantName}</h3><RecordEditor entity="leases" initial={draft} onCancel={()=>setDraft(null)} onSaved={savedId=>{setOpenLease(savedId);setDraft(null);setNotice('Lease saved. Add its PDF sharing link below, or finish without a PDF.');setRetry(x=>x+1);}}/></section>}
  {!units.length&&<p className="mt-3 text-sm">No confirmed apartment assignment is on file. Existing agreements above remain available; review residence history before adding an agreement.</p>}
  <a className={button+' mt-3'} href="#tenant-leases">View full lease history</a>
  <p className="mt-3 text-sm text-slate-600">Check the tenant and agreement period against each PDF. Dates and rent must come from the signed agreement, not estimates. Links are Admin-only and do not change file access or send anything to tenants.</p>
 </section>;
}
function LeasePeriodPdf({lease,autoOpen}:{lease:RecordRow;autoOpen:boolean}){
 const [activated,setActivated]=useState(autoOpen);
 useEffect(()=>{if(autoOpen)document.getElementById('tenant-lease-'+lease.id)?.scrollIntoView({block:'start'});},[autoOpen,lease.id]);
 return <details id={'tenant-lease-'+lease.id} open={autoOpen||undefined} className="mt-3 min-w-0 scroll-mt-6 rounded border p-3" onToggle={e=>{if(e.currentTarget.open)setActivated(true);}}><summary className="cursor-pointer py-2 font-semibold">Add / view PDF link · {lease.property_name} · {lease.unit_identifier} · {lease.lease_start} → {lease.lease_end}{lease.is_current===1?' · Current agreement':' · Earlier / other agreement'}</summary><p className="mt-2 text-sm">Leaseholders: {lease.leaseholders||'Review the saved agreement'}</p>{activated&&<GoogleDriveLeasePdf leaseId={lease.id}/>}</details>;
}
