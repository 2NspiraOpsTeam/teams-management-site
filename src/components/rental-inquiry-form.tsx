'use client';
import { useRef, useState } from 'react';

type State = 'idle' | 'sending' | 'sent';
export function RentalInquiryForm() {
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const id = useRef(crypto.randomUUID());
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== 'idle') return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setError(''); setState('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, category: 'property', idempotencyKey: id.current }),
      });
      const result = await response.json() as { error?: string; id?: string };
      if (!response.ok) throw new Error(result.error || 'We could not send your inquiry. Please try again.');
      setReceipt(result.id || id.current); setState('sent'); form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not send your inquiry. Please try again.');
      setState('idle');
    }
  }
  if (state === 'sent') return <div role="status" className="rounded border border-teams-gold bg-white p-6"><h3 className="font-serif text-2xl text-teams-ink">Rental inquiry received</h3><p className="mt-3 text-slate-700">Teams Management has your inquiry and will follow up about the appropriate leasing or broker next step. This is not a rental application or an availability confirmation.</p><p className="text-sm text-slate-600">Reference: {receipt}</p><button type="button" className="mt-3 underline" onClick={() => { id.current = crypto.randomUUID(); setReceipt(''); setState('idle'); }}>Send another inquiry</button></div>;
  return <form onSubmit={event => void submit(event)} className="rounded border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block font-medium text-teams-ink">Name <span aria-hidden="true">*</span><input name="name" required minLength={2} maxLength={120} autoComplete="name" className="mt-2 block min-h-11 w-full rounded border border-slate-400 px-3 py-2"/></label>
      <label className="block font-medium text-teams-ink">Email <span aria-hidden="true">*</span><input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-2 block min-h-11 w-full rounded border border-slate-400 px-3 py-2"/></label>
      <label className="block font-medium text-teams-ink">Phone <span aria-hidden="true">*</span><input name="phone" type="tel" required pattern="[+0-9 ().-]{7,30}" minLength={7} maxLength={30} autoComplete="tel" className="mt-2 block min-h-11 w-full rounded border border-slate-400 px-3 py-2"/></label>
      <label className="block font-medium text-teams-ink">Property or address of interest <span aria-hidden="true">*</span><input name="propertyInterest" required minLength={3} maxLength={120} placeholder="Street address or property name" className="mt-2 block min-h-11 w-full rounded border border-slate-400 px-3 py-2"/></label>
      <label className="block font-medium text-teams-ink sm:col-span-2">How can we help? <span aria-hidden="true">*</span><textarea name="message" required minLength={10} maxLength={4000} rows={4} placeholder="Share your rental question. Please do not include identity numbers, financial records, or documents." className="mt-2 block w-full rounded border border-slate-400 px-3 py-2"/></label>
    </div>
    <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <p className="mt-5 text-sm text-slate-600">No application or sensitive documents are collected here. Teams will confirm availability and the next step, which may be handled by a broker.</p>
    {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
    <button type="submit" disabled={state === 'sending'} className="mt-4 min-h-11 bg-teams-gold px-6 py-3 font-semibold text-teams-ink disabled:opacity-50">{state === 'sending' ? 'Sending…' : 'Send rental inquiry'}</button>
  </form>;
}
