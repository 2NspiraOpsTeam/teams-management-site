'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {publicPages} from '@/lib/analytics/shared';
export function CloudflareBeacon({token,host}: {token:string;host:string}) {
  const pathname=usePathname();
  useEffect(()=>{
    const isPublic=publicPages.includes(pathname)||/^\/(properties|retail)\/[a-z0-9-]+$/.test(pathname);
    if(!isPublic || location.hostname!==host || navigator.doNotTrack==='1' || (navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl || document.querySelector('script[data-cf-beacon]'))return;
    const script=document.createElement('script');
    script.src='https://static.cloudflareinsights.com/beacon.min.js';script.defer=true;
    script.setAttribute('data-cf-beacon',JSON.stringify({token,spa:true}));
    document.body.appendChild(script);
    // Keep one provider beacon across public App Router navigation; no duplicate page-view emitter.
  },[pathname,token,host]);
  return null;
}
