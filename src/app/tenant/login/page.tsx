'use client';
import { PortalBrand } from '@/components/PortalBrand';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'email' | 'code' | 'options' | 'password';
export default function TenantLogin() {
 const router = useRouter(), locked = useRef(false);
 const [email,setEmail] = useState(''), [code,setCode] = useState(''), [password,setPassword] = useState('');
 const [step,setStep] = useState<Step>('email'), [remember,setRemember] = useState(false), [show,setShow] = useState(false);
 const [busy,setBusy] = useState(false), [message,setMessage] = useState('');
 const field = 'mt-1 block w-full rounded border border-slate-300 px-3 py-3';
 function reset() { setStep('email');setCode('');setPassword('');setShow(false);setMessage('');setRemember(false); }
 async function submit(action: 'request' | 'verify' | 'password', sendCode = false) {
  if (locked.current) return;
  locked.current = true;setBusy(true);setMessage('');
  try {
   const response = await fetch(action === 'password' ? '/api/admin/password' : '/api/session', {
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify(action === 'password' ? {email,password} : {action,email,code,remember,sendCode}),
   });
   const data = await response.json() as {error?:string;message?:string;redirect?:string;passwordAvailable?:boolean};
   if (!response.ok) {
    if (action === 'password' && response.status === 401 && data.error?.startsWith('Verify your email')) {setPassword('');setStep('email');}
    throw new Error(data.error || 'Sign-in failed. Please try again.');
   }
   if (action === 'request') {
    setCode('');setStep(data.passwordAvailable ? 'options' : 'code');setMessage(data.message || '');
   } else {
    setPassword('');router.replace(data.redirect === '/admin' ? '/admin' : '/tenant');router.refresh();
   }
  } catch(error) {setMessage(error instanceof Error ? error.message : 'Sign-in failed. Please try again.');}
  finally {locked.current = false;setBusy(false);}
 }
 async function forget() {
  if(locked.current)return;locked.current=true;setBusy(true);setMessage('');
  try {
   const result=await fetch('/api/session/browser',{method:'DELETE'});
   if(!result.ok)throw new Error('Could not forget this browser. Please try again.');
   reset();setMessage('This browser has been forgotten. Continue with an email code.');
  } catch(error){setMessage(error instanceof Error?error.message:'Please try again.');}
  finally{locked.current=false;setBusy(false);}
 }
 return <main id="main-content" className="resident-login"><div className="resident-login-card">
  <div className="mb-7 border-b border-stone-200 pb-6"><PortalBrand href="/tenant/login" label="Sign in"/></div>
  <h1 className="text-3xl font-serif font-semibold text-teams-ink">Welcome back.</h1>
  <p className="mt-2 text-slate-600">Enter your email address to sign in.</p>
  <form onSubmit={event=>{event.preventDefault();void submit(step==='password'?'password':step==='code'?'verify':'request');}} className="mt-6 space-y-4">
   <label className="block text-sm font-medium">Email address<input type="email" maxLength={255} autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)} disabled={step!=='email'||busy} className={field}/></label>
   {step==='code'&&<>
    <label className="block text-sm font-medium">Eight-digit sign-in code<input autoFocus inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" maxLength={8} required disabled={busy} value={code} onChange={event=>setCode(event.target.value)} className={field}/></label>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={remember} disabled={busy} onChange={event=>setRemember(event.target.checked)} aria-describedby="remember-help"/>Remember this browser for 30 days</label>
    <p id="remember-help" className="text-sm text-slate-600">Only select this on a private device. Available sign-in methods depend on your account.</p>
   </>}
   {step==='password'&&<>
    <label className="block text-sm font-medium">Password<input autoFocus type={show?'text':'password'} autoComplete="current-password" required maxLength={128} value={password} disabled={busy} onChange={event=>setPassword(event.target.value)} className={field}/></label>
    <button type="button" disabled={busy} aria-pressed={show} onClick={()=>setShow(!show)} className="min-h-11 text-sm underline">{show?'Hide password':'Show password'}</button>
   </>}
   {step!=='options'&&<button disabled={busy} className="resident-button w-full">{busy?'Please wait…':step==='email'?'Continue':step==='code'?'Sign in':'Sign in with password'}</button>}
   {step==='options'&&<div className="space-y-3"><p className="text-sm text-slate-600" role="status">This browser is recognized. Choose how to sign in.</p><button type="button" disabled={busy} onClick={()=>{setPassword('');setStep('password');setMessage('');}} className="resident-button w-full">Sign in with password</button><button type="button" disabled={busy} onClick={()=>void submit('request',true)} className="min-h-11 w-full rounded border px-3 py-3">Send sign-in code</button></div>}
  </form>
  {message&&<p role="status" className="mt-4 text-sm text-slate-700">{message}</p>}
  {step==='code'&&<button type="button" disabled={busy} onClick={()=>void submit('request',true)} className="mt-4 mr-4 min-h-11 text-sm underline">Request another code</button>}
  {step==='password'&&<button type="button" disabled={busy} onClick={()=>{setPassword('');void submit('request',true);}} className="mt-4 mr-4 min-h-11 text-sm underline">Use an email code</button>}
  {step!=='email'&&<button type="button" disabled={busy} onClick={reset} className="mt-4 min-h-11 text-sm underline">Use a different email</button>}
  {(step==='options'||step==='password')&&<button type="button" disabled={busy} onClick={()=>void forget()} className="mt-3 block min-h-11 text-sm underline">Forget this browser</button>}
  <p className="mt-6 text-sm text-slate-600">Having trouble signing in? <Link className="underline" href="/contact">Contact Teams Management</Link>.</p>
 </div></main>;
}
