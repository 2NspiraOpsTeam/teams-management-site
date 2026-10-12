'use client';

import { useEffect, useState } from 'react';
import type { BuildingPublic } from '@/lib/database.types';
import type { RetailProperty } from '@/lib/public-retail';
import { mapLocationUrl } from '@/lib/map-location';

type Pin = BuildingPublic & { latitude: number; longitude: number };
type MapComponent = typeof import('./LeafletMap').default;

export function RetailMap({ properties }: { properties: RetailProperty[] }) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [LeafletMap, setLeafletMap] = useState<MapComponent | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/buildings/map', { cache: 'no-store' })
      .then(response => response.ok ? response.json() as Promise<{slug:string;latitude:number;longitude:number}[]> : [])
      .then(rows => {
        if (!alive) return;
        const verified = new Map(rows.map(row => [row.slug, row]));
        setPins(properties.flatMap(property => {
          const point = verified.get(property.slug);
          if (!point || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) return [];
          return [{...property, latitude:point.latitude, longitude:point.longitude, geocode_status:'verified' as const, map_verified:true, description_public:null, amenities_public:[], gallery:[], publication_state:'published' as const, created_at:'', updated_at:''}];
        }));
      }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [properties]);

  useEffect(() => {
    if (!pins.length) return;
    let alive = true;
    void import('./LeafletMap').then(module => { if (alive) setLeafletMap(() => module.default); }).catch(() => {});
    return () => { alive = false; };
  }, [pins.length]);

  const unpinned = properties.filter(property => !pins.some(pin => pin.slug === property.slug));
  return <section aria-labelledby="retail-map-heading" className="border-t border-stone-200 bg-stone-50 py-14 sm:py-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-600">Explore by location</p>
      <h2 id="retail-map-heading" className="mt-3 font-serif text-3xl text-teams-ink sm:text-4xl">NYC retail property map</h2>
      <p className="mt-3 mb-8 max-w-2xl text-slate-700">Explore verified retail locations across New York City. Select a marker to view its address on the map.</p>
      {loading ? <div className="h-[360px] animate-pulse rounded-sm bg-stone-200" aria-label="Loading retail map" /> : pins.length && LeafletMap ? <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm"><LeafletMap buildings={pins} /></div> : <div className="flex h-[360px] items-center justify-center rounded-sm border border-stone-200 bg-white p-6 text-center text-slate-700">{pins.length ? 'Loading map…' : 'Verified map locations are not available right now. Use the property addresses below on the map.'}</div>}
      {unpinned.length > 0 && !loading && <div className="mt-6"><h3 className="font-semibold text-teams-ink">Additional retail addresses</h3><p className="mt-1 text-sm text-slate-700">These properties are listed below while their individual map locations are being verified.</p><ul className="mt-3 flex flex-wrap gap-3">{unpinned.map(property => <li key={property.id}><a className="inline-flex min-h-11 items-center border-b border-stone-400 text-sm font-medium text-teams-ink hover:border-teams-gold" href={mapLocationUrl(property.address)} target="_blank" rel="noopener noreferrer">{property.name} · View on map ↗</a></li>)}</ul></div>}
    </div>
  </section>;
}
