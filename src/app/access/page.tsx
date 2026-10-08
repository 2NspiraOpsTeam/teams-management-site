'use client';
import { useState } from 'react';
export default function AccessPage(){
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 async function signIn(){setBusy(true);setError('');try{const response=await fetch('/api/admin/session',{method:'POST',headers:{'Origin':location.origin},cache:'no-store'});if(!response.ok)throw new Error('Access is not authorized for this account.');location.assign('/admin/buildings');}catch(e){setError(e instanceof Error?e.message:'Unable to sign in');setBusy(false);}}
 return <main className="mx-auto max-w-md p-8"><h1 className="text-2xl font-semibold">Teams Management Admin</h1><p className="my-4">Sign in through the organization’s protected access portal.</p><button type="button" disabled={busy} onClick={signIn} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">{busy?'Signing in…':'Continue'}</button>{error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}</main>;
}
