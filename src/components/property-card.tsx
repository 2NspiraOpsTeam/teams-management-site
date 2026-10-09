import Link from 'next/link';
import type { BuildingPublic } from '@/lib/database.types';

interface PropertyCardProps {
  building: BuildingPublic;
}

export function PropertyCard({ building }: PropertyCardProps) {
  const location = [building.address.city, building.address.state].filter(Boolean).join(', ');
  const address = [building.address.street, location, building.address.zip].filter(Boolean).join(', ');

  return (
    <article className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 sm:gap-6 min-w-0">
      <div className="aspect-[4/3] sm:aspect-square bg-slate-950 border-2 border-teams-gold flex flex-col items-center justify-center px-6 text-center min-w-0" aria-label="Branded placeholder; no property photograph available">
        <span className="mb-4 font-serif text-4xl text-teams-gold" aria-hidden="true">TM</span><span className="text-xs uppercase tracking-[0.14em] text-white">Property photography coming soon</span>
      </div>
      <div className="flex flex-col items-start min-w-0 sm:py-1">
        <h2 className="font-serif text-2xl leading-tight text-slate-950">{building.name}</h2>
        <p className="mt-2 mb-0 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">{location}</p>
        {building.description_public && <p className="mt-4 mb-0 text-sm text-slate-600">{building.description_public}</p>}
        {building.amenities_public.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-slate-700" aria-label="Verified property features">
            {building.amenities_public.map(amenity => <li key={amenity.id}>{amenity.name}</li>)}
          </ul>
        )}
        <p className="mt-4 text-sm text-slate-600">Property details coming soon.</p>
        <p className="mt-5 mb-0 text-sm text-slate-600 break-words">{address}</p>
        <Link href={`/properties/${building.slug}`} className="mt-5 inline-flex items-center gap-2 border-b border-teams-gold pb-1 text-sm font-semibold text-slate-950 hover:text-amber-800 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teams-gold">
          View property <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
