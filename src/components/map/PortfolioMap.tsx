'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { BuildingPublic } from '@/lib/database.types';


const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false, loading: () => <div className="h-[360px] bg-stone-100 animate-pulse" aria-label="Loading property map" /> });

export function PortfolioMap({ buildings }: { buildings: BuildingPublic[] }) {
  const [verified, setVerified] = useState<(BuildingPublic & { latitude: number; longitude: number })[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    fetch('/api/buildings/map', { cache: 'no-store' }).then(response => response.ok ? response.json() as Promise<{slug:string;latitude:number;longitude:number}[]> : Promise.resolve([] as {slug:string;latitude:number;longitude:number}[])).then((rows: {slug:string;latitude:number;longitude:number}[]) => {
      if (alive) setVerified(buildings.flatMap(building => {
        const row = rows.find(item => item.slug === building.slug);
        return row ? [{ ...building, latitude: row.latitude, longitude: row.longitude }] : [];
      }));
    }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [buildings]);
  return <section aria-labelledby="portfolio-map-heading" className="bg-stone-50 py-16 sm:py-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Explore the portfolio</p>
      <h2 id="portfolio-map-heading" className="mb-4 font-serif text-3xl text-teams-charcoal sm:text-4xl">Property map</h2>
      <p className="mb-8 max-w-2xl text-slate-600">Browse verified locations. Every property profile also offers address-based directions.</p>
      {loading ? <div className="min-h-[280px] animate-pulse rounded-sm bg-stone-100" aria-label="Loading property map" /> : verified.length ? <div className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-sm"><LeafletMap buildings={verified} /></div> :
        <div className="flex min-h-[280px] flex-col justify-center rounded-sm border border-stone-200 bg-white px-6 py-12 text-center sm:min-h-[340px]">
          <span className="mb-4 text-3xl text-teams-gold" aria-hidden="true">⌖</span>
          <h3 className="font-serif text-2xl text-teams-charcoal">Property map coming soon</h3>
          <p className="mx-auto mt-3 mb-0 max-w-md text-slate-600">Locations will appear here as coordinates are verified. In the meantime, use Map &amp; Directions on any property to plan a visit.</p>
        </div>}
    </div>
  </section>;
}
