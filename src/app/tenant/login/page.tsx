'use client';
import { PortalBrand } from '@/components/PortalBrand';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'email' | 'code' | 'options' | 'password';
export default function TenantLogin() {
 const router = useRouter(), locked = useRef(false);
 const [email,setEmail] = useState(''), [code,setCode] = useState(''), [password,setPassword] = useState('');
 const [step,setStep] = useState<Step>('email'), [show,setShow] = useState(false);
 const [busy,setBusy] = useState(false), [message,setMessage] = useState('');
 const field = 'mt-1 block w-full rounded border border-slate-300 px-3 py-3';
 function reset() { setStep('email');setCode('');setPassword('');setShow(false);setMessage(''); }
 async function submit(action: 'request' | 'verify' | 'password', sendCode = false) {
  if (locked.current) return;
  locked.current = true;setBusy(true);setMessage('');
  try {
   const response = await fetch(action === 'password' ? '/api/admin/password' : '/api/session', {
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(action === 'password' ? {email,password} : {action,email,code,sendCode}),
   });
   const data = await response.json() as {error?:string;message?:string;redirect?:string};
   if (!response.ok) {
    throw new Error(data.error || 'Sign-in failed. Please try again.');
   }
   if (action === 'request') {
    setCode('');setStep('code');setMessage(data.message || '');
   } else {
    setPassword('');router.replace(data.redirect === '/admin' ? '/admin' : '/tenant');router.refresh();
   }
  } catch(error) {setMessage(error instanceof Error ? error.message : 'Sign-in failed. Please try again.');}
  finally {locked.current = false;setBusy(false);}
 }
 return <main id="main-content" className="resident-login"><div className="resident-login-card">
  <div className="mb-7 border-b border-stone-200 pb-6"><PortalBrand label="Sign in"/></div>
  <h1 className="text-3xl font-serif font-semibold text-teams-ink">Welcome back.</h1>
  <p className="mt-2 text-slate-600">Enter your email address to sign in.</p>
  <form onSubmit={event=>{event.preventDefault();if(step==='email'){setStep('options');setMessage('');}else if(step!=='options'){void submit(step==='password'?'password':'verify');}}} className="mt-6 space-y-4">
   <label className="block text-sm font-medium">Email address<input type="email" maxLength={255} autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)} disabled={step!=='email'||busy} className={field}/></label>
   {step==='code'&&<>
    <label className="block text-sm font-medium">Eight-digit sign-in code<input autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" maxLength={8} required disabled={busy} value={code} onChange={event=>setCode(event.target.value)} className={field}/></label>
   </>}
   {step==='password'&&<>
    <label className="block text-sm font-medium">Password<input autoFocus type={show?'text':'password'} autoComplete="current-password" required maxLength={128} value={password} disabled={busy} onChange={event=>setPassword(event.target.value)} className={field}/></label>
    <button type="button" disabled={busy} aria-pressed={show} onClick={()=>setShow(!show)} className="min-h-11 text-sm underline">{show?'Hide password':'Show password'}</button>
   </>}
   {step!=='options'&&<button disabled={busy} className="resident-button w-full">{busy?'Please wait…':step==='email'?'Continue':step==='code'?'Sign in':'Sign in with password'}</button>}
   {step==='options'&&<div className="space-y-3"><p className="text-sm text-slate-600" role="status">Choose how to sign in.</p><button type="button" disabled={busy} onClick={()=>{setPassword('');setShow(false);setStep('password');setMessage('');}} className="resident-button w-full">Use a password</button><button type="button" disabled={busy} onClick={()=>void submit('request',true)} className="min-h-11 w-full rounded border px-3 py-3">Email me a code</button></div>}
  </form>
  {message&&<p role="status" className="mt-4 text-sm text-slate-700">{message}</p>}
  {step==='code'&&<button type="button" disabled={busy} onClick={()=>void submit('request',true)} className="mt-4 mr-4 min-h-11 text-sm underline">Request another code</button>}
  {step==='code'&&<button type="button" disabled={busy} onClick={()=>{setCode('');setStep('password');setMessage('');}} className="mt-4 mr-4 min-h-11 text-sm underline">Use a password</button>}
  {step==='password'&&<button type="button" disabled={busy} onClick={()=>{setPassword('');void submit('request',true);}} className="mt-4 mr-4 min-h-11 text-sm underline">Use an email code</button>}
  {step!=='email'&&<button type="button" disabled={busy} onClick={reset} className="mt-4 min-h-11 text-sm underline">Use a different email</button>}
  <p className="mt-6 text-sm text-slate-600">Having trouble signing in? <Link className="underline" href="/contact">Contact Teams Management</Link>.</p>
 </div></main>;
}
