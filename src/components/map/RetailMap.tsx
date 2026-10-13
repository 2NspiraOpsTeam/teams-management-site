'use client';

import { useEffect, useState } from 'react';
import type { BuildingPublic } from '@/lib/database.types';
import type { RetailProperty } from '@/lib/public-retail';
import { mapLocationUrl } from '@/lib/map-location';

type Pin = BuildingPublic & { latitude: number; longitude: number };

export function RetailMap({ properties }: { properties: RetailProperty[] }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/buildings/map', { cache: 'no-store' })
      .then(response => response.ok ? response.json() as Promise<{slug:string;latitude:number;longitude:number}[]> : [])
      .then(rows => {
        if (!alive) return;
        const verified = new Map(rows.map(row => [row.slug, row]));
        setPins(properties.flatMap(property => {
          const point = verified.get(property.slug) ?? (property.map_verified && property.geocode_status === 'verified' ? property : null);
          if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number' || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return [];
          return [{...property, latitude:point.latitude, longitude:point.longitude, geocode_status:'verified' as const, map_verified:true, description_public:null, amenities_public:[], gallery:[], publication_state:'published' as const, created_at:'', updated_at:''}];
        }));
      }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [properties]);

  const selected = pins.find(pin => pin.slug === selectedSlug) ?? pins[0];
  const unpinned = properties.filter(property => !pins.some(pin => pin.slug === property.slug));
  return <section aria-labelledby="retail-map-heading" className="border-t border-stone-200 bg-stone-50 py-14 sm:py-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-600">Explore by location</p>
      <h2 id="retail-map-heading" className="mt-3 font-serif text-3xl text-teams-ink sm:text-4xl">NYC retail property map</h2>
      <p className="mt-3 mb-8 max-w-2xl text-slate-700">Explore verified retail locations across New York City. Select a property to see it in Google Maps.</p>
      {loading ? <div className="h-[360px] animate-pulse rounded-sm bg-stone-200" aria-label="Loading retail map" /> : selected ? <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-stone-200 p-3" role="group" aria-label="Select a retail property on the map">{pins.map(pin => <button key={pin.slug} type="button" aria-pressed={selected.slug === pin.slug} onClick={() => setSelectedSlug(pin.slug)} className={`min-h-11 rounded-sm px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink ${selected.slug === pin.slug ? 'bg-teams-ink text-white' : 'bg-stone-100 text-teams-ink hover:bg-stone-200'}`}>{pin.name}</button>)}</div>
        <iframe key={selected.slug} src={`https://www.google.com/maps?q=${encodeURIComponent(`${selected.latitude},${selected.longitude}`)}&z=16&output=embed`} title={`Google Maps location of ${selected.name}`} className="h-[360px] w-full border-0 bg-stone-100 sm:h-[460px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"><span>{selected.address.street}, {selected.address.city}, {selected.address.state}</span><a href={mapLocationUrl(selected.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Open in Google Maps ↗</a></div>
      </div> : <div className="flex h-[360px] items-center justify-center rounded-sm border border-stone-200 bg-white p-6 text-center text-slate-700">Verified map locations are not available right now. Use the property addresses below on the map.</div>}
      {unpinned.length > 0 && !loading && <div className="mt-6"><h3 className="font-semibold text-teams-ink">Additional retail addresses</h3><p className="mt-1 text-sm text-slate-700">These properties are listed below while their individual map locations are being verified.</p><ul className="mt-3 flex flex-wrap gap-3">{unpinned.map(property => <li key={property.id}><a className="inline-flex min-h-11 items-center border-b border-stone-400 text-sm font-medium text-teams-ink hover:border-teams-gold" href={mapLocationUrl(property.address)} target="_blank" rel="noopener noreferrer">{property.name} · View on map ↗</a></li>)}</ul></div>}
    </div>
  </section>;
}
