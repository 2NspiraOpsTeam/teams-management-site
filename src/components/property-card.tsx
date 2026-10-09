import Link from 'next/link';
import type { BuildingPublic } from '@/lib/database.types';
import { directionsUrl } from '@/lib/map-location';

interface PropertyCardProps {
  building: BuildingPublic;
  coverOverride?: {src:string;alt:string}|null;
}

export function PropertyCard({ building, coverOverride }: PropertyCardProps) {
  const location = [building.address.city, building.address.state].filter(Boolean).join(', ');
  const address = [building.address.street, location, building.address.zip].filter(Boolean).join(', ');
  const cover = coverOverride?.src ?? null;

  return (
    <article className="property-card grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 sm:gap-6 min-w-0">
      {cover ? <img src={cover} alt={coverOverride?.alt || `Approved property image for ${building.address.street}`} className="property-image aspect-[4/3] sm:aspect-square w-full object-cover border border-slate-200" /> : <div className="aspect-[4/3] sm:aspect-square bg-teams-charcoal border border-slate-200 flex flex-col items-center justify-center px-6 text-center min-w-0" aria-label="Branded placeholder; no property photograph available">
        <span className="mb-4 font-serif text-4xl text-teams-gold" aria-hidden="true">TM</span><span className="text-xs uppercase tracking-[0.14em] text-white">Property photography coming soon</span>
      </div>}
      <div className="flex flex-col items-start min-w-0 sm:py-1">
        <h2 className="font-serif text-2xl leading-tight text-teams-charcoal">{building.name}</h2>
        <p className="mt-2 mb-0 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">{location}</p>
        {building.description_public && <p className="mt-4 mb-0 text-sm text-slate-600">{building.description_public}</p>}
        {building.amenities_public.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-slate-700" aria-label="Verified property features">
            {building.amenities_public.map(amenity => <li key={amenity.id}>{amenity.name}</li>)}
          </ul>
        )}
        <p className="mt-5 mb-0 text-sm text-slate-600 break-words">{address}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={`/properties/${building.slug}`} className="inline-flex min-h-11 items-center gap-2 border-b border-slate-400 pb-1 text-sm font-semibold text-teams-charcoal hover:text-slate-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teams-gold">
          View property <span aria-hidden="true">→</span>
        </Link>
        <a href={directionsUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-slate-400 text-sm font-semibold text-teams-charcoal hover:text-slate-700">Map &amp; Directions ↗</a>
        </div>
      </div>
    </article>
  );
}
