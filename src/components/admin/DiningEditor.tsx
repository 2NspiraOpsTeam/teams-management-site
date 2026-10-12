'use client';

import Link from 'next/link';
import { useState } from 'react';

export type EditableVenue = {
  id?: string; name: string; slug: string; property_id: string; summary: string;
  category: string; neighborhood: string | null; website_url: string | null;
  menu_url: string | null; reservation_url: string | null; ordering_url: string | null;
  phone: string | null; hero_media_asset_id: string | null;
  publication_state: 'draft' | 'published'; display_order: number;
};
type PropertyOption = { id: string; name: string };
type MediaOption = { id: string; storage_key: string; alt_text: string | null };
const blank: EditableVenue = { name: '', slug: '', property_id: '', summary: '', category: '', neighborhood: '', website_url: '', menu_url: '', reservation_url: '', ordering_url: '', phone: '', hero_media_asset_id: '', publication_state: 'draft', display_order: 0 };

function VenueForm({ venue, properties, media }: { venue: EditableVenue; properties: PropertyOption[]; media: MediaOption[] }) {
  const [data, setData] = useState<EditableVenue>(venue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  function update<K extends keyof EditableVenue>(field: K, value: EditableVenue[K]) { setData(previous => ({ ...previous, [field]: value })); setSaved(false); }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try {
      const response = await fetch('/api/admin/dining', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to save venue.');
      setData(previous => ({ ...previous, id: result.id })); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save venue.'); }
    finally { setBusy(false); }
  }
  const input = 'min-h-11 w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-700 focus:outline-none';
  const field = (label: string, name: keyof EditableVenue, maxLength = 500) => <label className="grid gap-2 text-sm font-semibold">{label}<input className={input} value={String(data[name] ?? '')} maxLength={maxLength} onChange={event => update(name, event.target.value as never)} /></label>;
  const selectedMedia = media.find(asset => asset.id === data.hero_media_asset_id);
  return <form onSubmit={event => void save(event)} className="grid gap-5 rounded-sm border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="grid gap-5 md:grid-cols-2">{field('Venue name','name',100)}{field('URL slug','slug',100)}</div>
    <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Teams property<select required className={input} value={data.property_id} onChange={event => update('property_id',event.target.value)}><option value="">Select a property</option>{properties.map(property => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>{field('Cuisine / category','category',100)}</div>
    <label className="grid gap-2 text-sm font-semibold">Public summary<textarea rows={3} maxLength={400} className={input} value={data.summary} onChange={event => update('summary',event.target.value)} /></label>
    <div className="grid gap-5 md:grid-cols-2">{field('Neighborhood','neighborhood',100)}{field('Phone','phone',40)}</div>
    <div className="grid gap-5 md:grid-cols-2">{field('Website URL (https)','website_url')}{field('Menu URL (https)','menu_url')}{field('Reservations URL (https)','reservation_url')}{field('Ordering URL (https)','ordering_url')}</div>
    <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Approved Media Library image<select className={input} value={data.hero_media_asset_id ?? ''} onChange={event => update('hero_media_asset_id',event.target.value)}><option value="">No venue image</option>{media.map(asset => <option key={asset.id} value={asset.id}>{asset.alt_text || asset.storage_key.split('/').pop()} · {asset.id.slice(0,8)}</option>)}</select></label><label className="grid gap-2 text-sm font-semibold">Display order<input type="number" min="0" max="10000" className={input} value={data.display_order} onChange={event => update('display_order',Number(event.target.value))} /></label></div>
    {selectedMedia && <div className="flex items-center gap-4 rounded-sm bg-stone-50 p-3"><img src={selectedMedia.storage_key.startsWith('/') ? selectedMedia.storage_key : `/api/admin/media/${encodeURIComponent(selectedMedia.id)}/file`} alt={selectedMedia.alt_text || 'Selected image'} className="h-20 w-28 object-cover"/><span className="text-sm text-slate-600">Selected image preview</span></div>}
    <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={data.publication_state === 'published'} onChange={event => update('publication_state',event.target.checked ? 'published' : 'draft')} />Published</label>
    <div className="flex flex-wrap items-center gap-4"><button disabled={busy} className="min-h-11 rounded-sm bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save venue'}</button>{data.id && <Link href={`/dining#${data.slug}`} className="text-sm font-semibold underline underline-offset-4">View public listing</Link>}{saved && <p role="status" className="text-sm font-semibold text-green-800">Venue saved.</p>}{error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}</div>
  </form>;
}

export function DiningEditor({ venues, properties, media }: { venues: EditableVenue[]; properties: PropertyOption[]; media: MediaOption[] }) {
  const [showNew, setShowNew] = useState(false);
  return <div className="mt-10 space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-serif text-2xl">Current venues</h2><button type="button" onClick={() => setShowNew(value => !value)} className="min-h-11 rounded-sm bg-teams-gold px-5 py-3 font-semibold text-teams-ink">{showNew ? 'Close new venue' : 'Add dining venue'}</button></div>{showNew && <section aria-label="New dining venue"><VenueForm venue={blank} properties={properties} media={media} /></section>}{venues.length ? venues.map(venue => <section key={venue.id} aria-label={`Edit ${venue.name}`}><h3 className="mb-3 font-serif text-xl">{venue.name} <span className="ml-2 text-sm font-sans text-slate-500">{venue.publication_state}</span></h3><VenueForm venue={venue} properties={properties} media={media} /></section>) : <p>No venues are listed yet.</p>}</div>;
}
