'use client';
import {useRouter} from 'next/navigation';
import {useRef,useState} from 'react';
export function TenantLogout(){const router=useRouter(),lock=useRef(false),[busy,setBusy]=useState(false),[error,setError]=useState('');return <div><button disabled={busy} onClick={async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const response=await fetch('/api/tenant/session',{method:'DELETE'});if(!response.ok)throw Error();router.replace('/tenant/login');router.refresh();}catch{setError('Sign-out failed. Please try again.');lock.current=false;setBusy(false);}}} className="underline disabled:opacity-50">{busy?'Signing out…':'Sign out'}</button>{error&&<p role="alert" className="max-w-48 text-xs">{error}</p>}</div>}
