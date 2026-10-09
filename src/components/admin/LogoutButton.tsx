'use client';
import { useState } from 'react';
export default function LogoutButton(){const [busy,setBusy]=useState(false);return <button type="button" disabled={busy} className="min-h-11 font-medium hover:underline disabled:opacity-50" onClick={async()=>{if(busy)return;setBusy(true);try{await fetch('/api/admin/session',{method:'DELETE'});}finally{location.assign('/access');}}}>{busy?'Signing out…':'Sign out'}</button>;}
