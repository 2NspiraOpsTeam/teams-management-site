import { previewBuildingFacts } from '@/lib/preview-building-facts';

export function PreviewBuildingDetails({ slug }: { slug: string }) {
  const facts = previewBuildingFacts[slug];
  if (!facts) return <p className="mt-5 text-sm text-slate-600"><span className="font-semibold text-teams-ink">Retail space:</span> Information being verified.</p>;

  return <section className="mt-5 w-full" aria-label="Building details">
    <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm sm:grid-cols-3">
      <div><dt className="text-slate-500">Apartments</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.apartments}</dd></div>
      {facts.residentialFloors && <div><dt className="text-slate-500">Residential floors</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.residentialFloors}</dd></div>}
      {facts.bedroomMix && <div><dt className="text-slate-500">Unit types</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.bedroomMix}</dd></div>}
      {facts.sizeRange && <div><dt className="text-slate-500">Recorded sizes</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.sizeRange}</dd></div>}
    </dl>
    <p className="mt-4 text-sm leading-relaxed text-slate-700"><span className="font-semibold text-teams-ink">Retail space: </span>{facts.retail?.length ? `${facts.retail.length} ${facts.retail.length === 1 ? 'storefront' : 'storefronts'} recorded · ${facts.retail.join(' · ')}` : 'Storefront information is being verified.'}</p>
  </section>;
}
