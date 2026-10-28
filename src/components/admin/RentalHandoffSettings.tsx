'use client';
import { useEffect, useState } from 'react';
type Setting = { kind: string; label: string | null; destination: string | null };
export function RentalHandoffSettings() {
  const [kind, setKind] = useState('none');
  const [label, setLabel] = useState('');
  const [destination, setDestination] = useState('');
  const [state, setState] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { void (async () => {
    try { const response = await fetch('/api/admin/rental-handoff', { cache: 'no-store' }); if (!response.ok) throw new Error(); const setting = await response.json() as Setting; setKind(setting.kind); setLabel(setting.label || ''); setDestination(setting.destination || ''); }
    catch { setState('Broker settings could not be loaded.'); }
  })(); }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setState('');
    try { const response = await fetch('/api/admin/rental-handoff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, label, destination }) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || 'Could not save broker destination.'); setState('Broker handoff saved.'); }
    catch (error) { setState(error instanceof Error ? error.message : 'Could not save broker destination.'); }
    finally { setBusy(false); }
  }
  return <section className="mt-8 rounded border bg-white p-5" aria-labelledby="rental-handoff-heading"><h2 id="rental-handoff-heading" className="text-xl font-semibold">Rental broker handoff</h2><p className="mt-2 text-sm text-slate-600">No broker link appears on Rent With Us until a destination is configured here. Confirm the destination is approved before publishing it.</p><form onSubmit={event => void save(event)} className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block">Destination type<select value={kind} onChange={event => setKind(event.target.value)} className="mt-1 block w-full rounded border p-3"><option value="none">Not configured</option><option value="url">External application or leasing URL</option><option value="email">Broker email</option><option value="phone">Broker phone</option></select></label>{kind !== 'none' && <><label className="block">Public link label<input value={label} onChange={event => setLabel(event.target.value)} required maxLength={80} className="mt-1 block w-full rounded border p-3" placeholder="Continue with our leasing broker"/></label><label className="block sm:col-span-2">{kind === 'url' ? 'HTTPS URL' : kind === 'email' ? 'Email address' : 'Phone number'}<input value={destination} onChange={event => setDestination(event.target.value)} required maxLength={500} className="mt-1 block w-full rounded border p-3" placeholder={kind === 'url' ? 'https://…' : kind === 'email' ? 'broker@example.com' : '+1 212 …'}/></label></>}<div className="sm:col-span-2"><button disabled={busy} className="rounded bg-slate-900 px-5 py-3 text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save handoff'}</button><p role="status" className="mt-2 text-sm">{state}</p></div></form></section>;
}
