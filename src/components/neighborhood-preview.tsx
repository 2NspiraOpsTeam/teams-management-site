import { NeighborhoodVideo } from '@/components/neighborhood-video';
import {PublishedPhoto} from '@/components/published-photo';
import { previewRetailNeighborhood, previewResidenceNeighborhood } from '@/lib/retail-neighborhood-preview';

export function NeighborhoodPreview({ slug, residence = false }: { slug: string; residence?: boolean }) {
  const neighborhood = residence ? previewResidenceNeighborhood(slug) : previewRetailNeighborhood(slug);
  if (!neighborhood) return null;
  return <section aria-label={`${neighborhood.name} neighborhood`} className="bg-[#f0ece4] py-14 sm:py-20">
    <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12">
      <figure className="overflow-hidden bg-stone-200">
        <PublishedPhoto src={neighborhood.image} alt={neighborhood.imageAlt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
        <figcaption className="px-3 py-2 text-xs text-slate-600">Neighborhood scene, not the property. Photo: <a href={neighborhood.creditUrl} target="_blank" rel="noopener noreferrer" className="underline">{neighborhood.credit}</a> · {neighborhood.licenseUrl ? <a href={neighborhood.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{neighborhood.license}</a> : neighborhood.license}</figcaption>
      </figure>
      <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">The neighborhood</p><h2 className="mt-3 font-serif text-3xl text-teams-ink sm:text-4xl">Explore {neighborhood.name}</h2><p className="mt-5 text-lg leading-relaxed text-slate-700">{neighborhood.context}</p><a href={neighborhood.guide} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center border-b border-teams-ink font-semibold text-teams-ink">{neighborhood.guideLabel} ↗</a><p className="mt-2 text-xs text-slate-600">Area guide opens in a new tab; use the map for the exact property location.</p></div>
      {neighborhood.video && <NeighborhoodVideo video={neighborhood.video} />}
    </div>
  </section>;
}
