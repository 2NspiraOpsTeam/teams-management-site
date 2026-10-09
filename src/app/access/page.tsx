'use client';
import { useState } from 'react';
export default function AccessPage(){
 const [email,setEmail]=useState('');const [code,setCode]=useState('');const [sent,setSent]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function submit(action:'request'|'verify'){
  if(busy)return;setBusy(true);setMessage('');
  try{const response=await fetch('/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,email,code}),cache:'no-store'});
   if(response.status===503)throw new Error('Admin sign-in is temporarily unavailable.');
   if(action==='request'){setSent(true);setMessage('If this email is authorized, a sign-in code has been sent.');return;}
   if(!response.ok)throw new Error('Invalid or expired code. Request a new code and try again.');
   location.assign('/admin');
  }catch(error){setMessage(error instanceof Error?error.message:'Unable to sign in.');}finally{setBusy(false);}
 }
 return <main className="mx-auto max-w-md p-6 sm:p-8"><h1 className="text-2xl font-semibold">Teams Admin sign-in</h1><p className="my-4 text-slate-600">Enter your authorized email to receive a one-time code.</p><form onSubmit={event=>{event.preventDefault();void submit(sent?'verify':'request');}} className="space-y-4"><label className="block font-medium">Email<input className="mt-1 w-full rounded border p-3" type="email" autoComplete="email" required maxLength={255} value={email} onChange={event=>setEmail(event.target.value)} disabled={busy||sent}/></label>{sent&&<label className="block font-medium">Sign-in code<input className="mt-1 w-full rounded border p-3" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} autoComplete="one-time-code" required value={code} onChange={event=>setCode(event.target.value)} disabled={busy}/></label>}<button className="min-h-11 rounded bg-slate-900 px-5 text-white disabled:opacity-50" disabled={busy}>{busy?'Please wait…':sent?'Sign in':'Send code'}</button></form>{sent&&<button type="button" className="mt-4 min-h-11 text-sm underline disabled:opacity-50" disabled={busy} onClick={()=>void submit('request')}>Request another code</button>}{message&&<p role="status" className="mt-4" aria-live="polite">{message}</p>}</main>;
}
