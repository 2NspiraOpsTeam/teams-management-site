'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {button,control,primary,read,write,type RecordRow} from './shared';
import {contactUpdate,contactsFor,type ContactKind} from './inline-contacts';

export function InlineContacts({row,kind,onEditing,onSaved}:{row:RecordRow;kind:ContactKind;onEditing:(key:string,editing:boolean)=>void;onSaved:()=>void}){
 const initial=()=>contactsFor({...row,phone:row.phones},kind);
 const [original,setOriginal]=useState(initial),[draft,setDraft]=useState(initial),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const lock=useRef(false),statusId=useId(),key=row.id+':'+kind,name=row.display_name||'unnamed tenant';
 const label=kind==='phone'?'Phone number':'Email address';
 useEffect(()=>{if(!dirty){const values=contactsFor({...row,phone:row.phones},kind);setOriginal(values);setDraft(values);}},[row,kind]);
 function change(values:RecordRow[]){setDraft(values);setDirty(true);setError('');setNotice('');onEditing(key,true);}
 function cancel(){if(lock.current)return;setDraft(original);setDirty(false);setError('');setNotice('Changes cancelled.');onEditing(key,false);}
 async function save(){
  if(lock.current||!dirty)return;lock.current=true;setBusy(true);setError('');setNotice('');
  try{
   const current=await read('/tenants/'+row.tenant_id);
   const update=contactUpdate(current,kind,original,draft);
   await write('/tenants/'+row.tenant_id+'/contacts','PATCH',update);
   const saved=update.contacts.filter((c:RecordRow)=>c.contact_type===kind);
   setOriginal(saved);setDraft(saved);setDirty(false);setNotice('Saved.');onEditing(key,false);onSaved();
  }catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}
 }
 const fields=draft.length?draft:[{contact_type:kind,value_raw:'',label:'unknown',is_primary:0}];
 return <div className="min-w-52 space-y-2" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();cancel();}if(e.key==='Enter'&&!e.shiftKey&&e.target instanceof HTMLInputElement){e.preventDefault();void save();}}}>
  {fields.map((c,i)=><div key={i}><input className={control} type="text" inputMode={kind==='phone'?'tel':'email'} autoComplete="off" aria-label={`${label} ${i+1} for ${name}, ${row.property_name}, apartment ${row.unit_identifier}`} aria-describedby={statusId} maxLength={1000} placeholder={`Add ${label.toLowerCase()}`} value={c.value_raw} readOnly={busy} aria-busy={busy} onChange={e=>change(fields.map((v,n)=>n===i?{...v,value_raw:e.target.value}:v))}/>{c.label&&c.label!=='unknown'&&<span className="text-xs text-slate-600">{c.label}</span>}</div>)}
  <button type="button" className="min-h-11 rounded px-2 text-sm underline focus-visible:outline-2" disabled={busy||fields.length>=40} onClick={()=>change([...fields,{contact_type:kind,value_raw:'',label:'unknown',is_primary:0}])}>+ Add {kind==='phone'?'number':'email'}</button>
  {dirty&&<><div className="flex flex-wrap gap-2"><button type="button" className={primary} disabled={busy} onClick={()=>void save()}>{busy?'Saving…':error?'Retry save':'Save'}</button><button type="button" className={button} disabled={busy} onClick={cancel}>Cancel</button></div><p className="text-xs text-slate-600">{busy?'Please wait for confirmation.':'Unsaved. Clearing a field removes that contact when saved.'}</p></>}
  <p id={statusId} role={error?'alert':'status'} className={error?'text-sm text-red-800':'text-sm text-green-800'}>{error||notice}</p>
 </div>;
}
