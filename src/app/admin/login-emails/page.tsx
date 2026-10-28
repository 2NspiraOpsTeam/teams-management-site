'use client';
import { useEffect, useRef, useState } from 'react';
type Entry = { id: string; recipient: string; portal: string; status: string; requestedAt: string; sentAt: string | null };
export default function LoginEmails() {
  const [portal, setPortal] = useState('all'), [items, setItems] = useState<Entry[]>([]), [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  const generation = useRef(0), busy = useRef(false);
  async function load(before = '', filter = portal) {
    if (before && busy.current) return;
    const version = ++generation.current;
    busy.current = true; setLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/login-emails?${new URLSearchParams({ portal: filter, before })}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Your session has expired. Sign in again.' : 'Could not load login emails. Please retry.');
      const data = await response.json();
      if (version !== generation.current) return;
      setItems(old => before ? [...old, ...data.items] : data.items); setNext(data.next);
    } catch (e) { if (version === generation.current) setError(e instanceof Error ? e.message : 'Could not load login emails.'); }
    finally { if (version === generation.current) { busy.current = false; setLoading(false); } }
  }
  useEffect(() => { void load('', portal); return () => { generation.current++; }; }, [portal]); // eslint-disable-line react-hooks/exhaustive-deps
  const date = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'long', timeZone: 'America/New_York' }).format(new Date(value));
  return <main id="main-content" className="mx-auto max-w-6xl p-4 sm:p-8"><h1 className="text-3xl font-semibold">Login emails</h1><p className="my-3 text-slate-600">Sign-in code emails for the Admin and Tenant portals. Times shown in New York time (Eastern).</p><p className="mb-6 text-sm text-slate-600">Sent means accepted by the email provider, not inbox delivery or a completed login. History begins when tracking is enabled; earlier emails are not included. Pending or unknown outcomes are not confirmed sends.</p><div className="mb-5 flex flex-wrap items-end gap-4"><div className="grid gap-1"><label htmlFor="login-email-portal">Portal</label><select id="login-email-portal" className="min-h-11 rounded border bg-white px-3" value={portal} onChange={e => {setItems([]);setNext(null);setPortal(e.target.value);}}><option value="all">All portals</option><option value="admin">Admin</option><option value="tenant">Tenant</option></select></div><button className="min-h-11 rounded border px-4 disabled:opacity-50" disabled={loading} onClick={() => void load()}>Refresh</button></div>{error && <div role="alert" className="mb-4 rounded border border-red-300 p-4">{error} <button className="min-h-11 px-3 underline" disabled={loading} onClick={() => void load()}>Retry</button></div>}<div aria-live="polite" aria-busy={loading}>{loading && <p className="py-4" role="status">Loading login emails…</p>}{!loading && !error && !items.length && <p className="rounded border bg-white p-6">No login emails recorded for this portal yet.</p>}<ul className="space-y-3">{items.map(item => <li key={item.id} className="grid gap-3 rounded border bg-white p-4 sm:grid-cols-3"><div className="min-w-0"><p className="break-all font-semibold">{item.recipient}</p><p className="capitalize text-sm">{item.portal} portal</p></div><div><p className="font-medium">{item.status === 'sent' ? 'Sent' : item.status === 'unknown' ? 'Outcome unknown' : 'Pending / unconfirmed'}</p><p className="text-sm text-slate-600">{item.status === 'sent' ? 'Accepted by email provider' : 'Sending is not confirmed'}</p></div><div className="text-sm"><p>{item.sentAt ? 'Sent: ' : 'Requested: '}<time dateTime={item.sentAt || item.requestedAt}>{date(item.sentAt || item.requestedAt)}</time></p></div></li>)}</ul></div>{next && <button className="mt-5 min-h-11 rounded border px-4 disabled:opacity-50" disabled={loading} onClick={() => void load(next)}>Load older emails</button>}</main>;
}
