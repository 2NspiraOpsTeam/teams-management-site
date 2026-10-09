import Link from 'next/link';
import type { BuildingPublic } from '@/lib/database.types';
import { directionsUrl } from '@/lib/map-location';
import { PreviewBuildingDetails } from '@/components/preview-building-details';
import { PropertyGallery, type GalleryImage } from '@/components/property-gallery';

interface PropertyCardProps {
  building: BuildingPublic;
  coverOverride?: {src:string;alt:string}|null;
  images?: GalleryImage[];
  showPreviewFacts?: boolean;
}

export function PropertyCard({ building, coverOverride, images = [], showPreviewFacts = false }: PropertyCardProps) {
  const location = [building.address.city, building.address.state].filter(Boolean).join(', ');
  const address = [building.address.street, location, building.address.zip].filter(Boolean).join(', ');
  const photos = images.length ? images : coverOverride ? [coverOverride] : [];

  return (
    <article className="property-card grid grid-cols-1 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 md:gap-10 min-w-0 border-b border-slate-200 pb-12 sm:pb-16">
      <PropertyGallery images={photos} name={building.name} compact />
      <div className="flex flex-col items-start min-w-0 md:py-2">
        <h2 className="font-serif text-2xl sm:text-3xl leading-tight text-teams-ink">{building.name}</h2>
        <p className="mt-2 mb-0 text-sm font-semibold uppercase tracking-[0.08em] text-slate-700">{location}</p>
        <p className="mt-5 mb-0 text-sm text-slate-600 break-words">{address}</p>
        {building.description_public && <p className="mt-5 mb-0 text-base leading-relaxed text-slate-700">{building.description_public}</p>}
        {showPreviewFacts && <PreviewBuildingDetails slug={building.slug} />}
        {building.amenities_public.length > 0 && (
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-2 text-sm leading-snug text-slate-700" aria-label="Verified property features">
            {building.amenities_public.map(amenity => <li key={amenity.id}>{amenity.name}</li>)}
          </ul>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={`/properties/${building.slug}`} className="inline-flex min-h-11 items-center gap-2 border-b border-slate-400 pb-1 text-sm font-semibold text-teams-ink hover:text-slate-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teams-gold">
          View property <span aria-hidden="true">→</span>
        </Link>
        <a href={directionsUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-slate-400 text-sm font-semibold text-teams-ink hover:text-slate-700">Map &amp; Directions ↗</a>
        </div>
      </div>
    </article>
  );
}
