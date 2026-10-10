'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export function TenantLogout(){const router=useRouter(),[busy,setBusy]=useState(false);return <button disabled={busy} onClick={async()=>{if(busy)return;setBusy(true);try{await fetch('/api/tenant/session',{method:'DELETE'});}finally{router.replace('/tenant/login');router.refresh();}}} className="underline disabled:opacity-50">Sign out</button>}
