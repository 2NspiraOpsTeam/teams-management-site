'use client';

import Link from 'next/link';
import { useState } from 'react';

export type EditableVenue = {
  id?: string; name: string; slug: string; property_id: string; summary: string;
  category: string; neighborhood: string | null; website_url: string | null;
  menu_url: string | null; reservation_url: string | null; ordering_url: string | null;
  phone: string | null; hero_media_asset_id: string | null;
  publication_state: 'draft' | 'published'; display_order: number;
  photo_asset_ids: string[];
};
type PropertyOption = { id: string; name: string };
type MediaOption = { id: string; storage_key: string; alt_text: string | null };
const blank: EditableVenue = { name: '', slug: '', property_id: '', summary: '', category: '', neighborhood: '', website_url: '', menu_url: '', reservation_url: '', ordering_url: '', phone: '', hero_media_asset_id: '', publication_state: 'draft', display_order: 0, photo_asset_ids: [] };

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
  const addPhoto = (id:string) => { if (id && !data.photo_asset_ids.includes(id)) update('photo_asset_ids',[...data.photo_asset_ids,id]); };
  const movePhoto = (index:number,delta:number) => { const photos=[...data.photo_asset_ids]; const next=index+delta; if (next<0 || next>=photos.length) return; [photos[index],photos[next]]=[photos[next],photos[index]]; update('photo_asset_ids',photos); };
  return <form onSubmit={event => void save(event)} className="grid gap-5 rounded-sm border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="grid gap-5 md:grid-cols-2">{field('Venue name','name',100)}{field('URL slug','slug',100)}</div>
    <div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Teams property<select required className={input} value={data.property_id} onChange={event => update('property_id',event.target.value)}><option value="">Select a property</option>{properties.map(property => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>{field('Cuisine / category','category',100)}</div>
    <label className="grid gap-2 text-sm font-semibold">Public summary<textarea rows={3} maxLength={400} className={input} value={data.summary} onChange={event => update('summary',event.target.value)} /></label>
    <div className="grid gap-5 md:grid-cols-2">{field('Neighborhood','neighborhood',100)}{field('Phone','phone',40)}</div>
    <div className="grid gap-5 md:grid-cols-2">{field('Website URL (https)','website_url')}{field('Menu URL (https)','menu_url')}{field('Reservations URL (https)','reservation_url')}{field('Ordering URL (https)','ordering_url')}</div>
    <label className="grid max-w-xs gap-2 text-sm font-semibold">Display order<input type="number" min="0" max="10000" className={input} value={data.display_order} onChange={event => update('display_order',Number(event.target.value))} /></label>
    <fieldset className="grid gap-3 rounded-sm border border-stone-200 p-4"><legend className="px-2 font-semibold">Rotating destination photos</legend><p className="text-sm text-slate-600">Photos appear in this order and change every 4 seconds. The first photo is the cover. Add approved photos in the <Link href="/admin/media" className="underline">Media Library</Link>, then return here and refresh.</p>
      <label className="grid gap-2 text-sm font-semibold">Add a photo<select className={input} value="" onChange={event => addPhoto(event.target.value)}><option value="">Choose an approved image</option>{media.filter(asset => !data.photo_asset_ids.includes(asset.id)).map(asset => <option key={asset.id} value={asset.id}>{asset.alt_text || asset.storage_key.split('/').pop()}</option>)}</select></label>
      {data.photo_asset_ids.map((id,index) => { const asset=media.find(item => item.id===id); return <div key={id} className="flex flex-wrap items-center gap-3 rounded bg-stone-50 p-2"><img src={asset?.storage_key.startsWith('/') ? asset.storage_key : `/api/admin/media/${encodeURIComponent(id)}/file`} alt={asset?.alt_text || 'Dining photo'} className="h-16 w-24 object-cover"/><span className="min-w-0 flex-1 text-sm">{index===0 ? 'Cover · ' : `${index+1} · `}{asset?.alt_text || id}</span><button type="button" disabled={index===0} onClick={() => movePhoto(index,-1)} className="min-h-11 rounded border px-3 disabled:opacity-40" aria-label={`Move photo ${index+1} earlier`}>↑</button><button type="button" disabled={index===data.photo_asset_ids.length-1} onClick={() => movePhoto(index,1)} className="min-h-11 rounded border px-3 disabled:opacity-40" aria-label={`Move photo ${index+1} later`}>↓</button><button type="button" onClick={() => update('photo_asset_ids',data.photo_asset_ids.filter(item => item!==id))} className="min-h-11 rounded border px-3">Remove</button></div>; })}
    </fieldset>
    <label className="flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={data.publication_state === 'published'} onChange={event => update('publication_state',event.target.checked ? 'published' : 'draft')} />Published</label>
    <div className="flex flex-wrap items-center gap-4"><button disabled={busy} className="min-h-11 rounded-sm bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save venue'}</button>{data.id && <Link href={`/dining#${data.slug}`} className="text-sm font-semibold underline underline-offset-4">View public listing</Link>}{saved && <p role="status" className="text-sm font-semibold text-green-800">Venue saved.</p>}{error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}</div>
  </form>;
}

export function DiningEditor({ venues, properties, media }: { venues: EditableVenue[]; properties: PropertyOption[]; media: MediaOption[] }) {
  const [showNew, setShowNew] = useState(false);
  return <div className="mt-10 space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><h2 className="font-serif text-2xl">Current venues</h2><button type="button" onClick={() => setShowNew(value => !value)} className="min-h-11 rounded-sm bg-teams-gold px-5 py-3 font-semibold text-teams-ink">{showNew ? 'Close new venue' : 'Add dining venue'}</button></div>{showNew && <section aria-label="New dining venue"><VenueForm venue={blank} properties={properties} media={media} /></section>}{venues.length ? venues.map(venue => <section key={venue.id} aria-label={`Edit ${venue.name}`}><h3 className="mb-3 font-serif text-xl">{venue.name} <span className="ml-2 text-sm font-sans text-slate-500">{venue.publication_state}</span></h3><VenueForm venue={venue} properties={properties} media={media} /></section>) : <p>No venues are listed yet.</p>}</div>;
}
