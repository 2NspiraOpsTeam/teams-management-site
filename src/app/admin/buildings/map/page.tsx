'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Building = { id:string; name:string; address_json:string; latitude:number|null; longitude:number|null; geocode_status:'pending'|'verified'|'failed'|null; map_verified:number };
export default function BuildingMapAdmin() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selected, setSelected] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState<'pending'|'verified'|'failed'>('pending');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function load() {
    const response = await fetch('/api/admin/buildings', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load building locations.');
    setBuildings(await response.json());
  }
  useEffect(() => { void load().catch(error => setMessage(String(error))); }, []);
  const building = buildings.find(item => item.id === selected);
  function choose(id:string) {
    const row = buildings.find(item => item.id === id);
    setSelected(id); setLatitude(row?.latitude?.toString() ?? ''); setLongitude(row?.longitude?.toString() ?? '');
    setStatus(row?.geocode_status ?? 'pending'); setVerified(row?.map_verified === 1); setMessage('');
  }
  async function save(clear = false) {
    if (!selected || busy) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/buildings/${selected}/map`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(clear ? { latitude:null, longitude:null, map_verified:false } : { latitude, longitude, geocode_status:status, map_verified:verified }) });
      const result = await response.json() as {error?:string};
      if (!response.ok) throw new Error(result.error ?? 'Save failed.');
      await load(); if (clear) {setLatitude('');setLongitude('');setStatus('pending');setVerified(false);}
      setMessage(clear ? 'Location cleared; no public marker.' : verified ? 'Verified location saved. Eligible published properties can display a marker.' : 'Candidate saved privately; no public marker.');
    } catch (error) { setMessage(String(error)); } finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-3xl p-6 sm:p-10">
    <Link href="/admin/buildings" className="text-sm underline">← Buildings</Link>
    <h1 className="mt-6 font-serif text-3xl text-teams-charcoal">Property map locations</h1>
    <p className="mt-3 max-w-2xl text-slate-600">Enter candidate coordinates from a geocoding source, compare the pin against the street address, then explicitly verify it. Geocoding alone never publishes a marker.</p>
    <div className="mt-8 grid gap-5 rounded-sm border border-stone-200 bg-white p-5 sm:p-8">
      <label className="grid gap-2 font-medium">Building<select value={selected} onChange={event=>choose(event.target.value)} className="min-h-11 rounded border border-stone-300 p-2"><option value="">Select a building</option>{buildings.map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
      {building && <>
        <p className="mb-0 text-sm text-slate-600">{Object.values(JSON.parse(building.address_json) as Record<string,string>).filter(Boolean).join(', ')}</p>
        <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 font-medium">Latitude<input type="number" step="any" min="-90" max="90" value={latitude} onChange={e=>{setLatitude(e.target.value);setVerified(false);}} className="min-h-11 rounded border border-stone-300 p-2" /></label><label className="grid gap-2 font-medium">Longitude<input type="number" step="any" min="-180" max="180" value={longitude} onChange={e=>{setLongitude(e.target.value);setVerified(false);}} className="min-h-11 rounded border border-stone-300 p-2" /></label></div>
        <label className="grid gap-2 font-medium">Geocode status<select value={status} onChange={e=>{setStatus(e.target.value as typeof status);setVerified(false);}} className="min-h-11 rounded border border-stone-300 p-2"><option value="pending">Pending review</option><option value="failed">Failed / incorrect match</option><option value="verified">Address independently checked</option></select></label>
        <label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" checked={verified} disabled={status!=='verified' || !latitude || !longitude} onChange={e=>setVerified(e.target.checked)} className="mt-1" />I compared this coordinate with the building’s street address and verified the pin.</label>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={()=>void save()} className="min-h-11 rounded-sm bg-teams-gold px-5 font-semibold text-teams-charcoal disabled:opacity-50">{busy?'Saving…':'Save location'}</button><button type="button" disabled={busy} onClick={()=>void save(true)} className="min-h-11 rounded-sm border border-stone-300 px-5 disabled:opacity-50">Clear location</button></div>
      </>}
      {message && <p role="status" className="mb-0 text-sm text-slate-700">{message}</p>}
    </div>
  </main>;
}
