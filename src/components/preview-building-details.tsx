import { previewBuildingFacts } from '@/lib/preview-building-facts';
import { buildingHistory } from '@/lib/building-history';

export function PreviewBuildingDetails({ slug }: { slug: string }) {
  const facts = previewBuildingFacts[slug];
  const history = buildingHistory[slug];
  if (!facts && !history) return null;

  return <section className="mt-5 w-full" aria-label="Building details">
    <dl className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm sm:grid-cols-3">
      {facts && <div><dt className="text-slate-500">Apartments</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.apartments}</dd></div>}
      {facts?.residentialFloors && <div><dt className="text-slate-500">Residential floors</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.residentialFloors}</dd></div>}
      {facts?.bedroomMix && <div><dt className="text-slate-500">Unit types</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.bedroomMix}</dd></div>}
      {facts?.sizeRange && <div><dt className="text-slate-500">Apartment sizes</dt><dd className="mt-1 font-semibold text-teams-ink">{facts.sizeRange}</dd></div>}
      {history && <div><dt className="text-slate-500">Year built</dt><dd className="mt-1 font-semibold text-teams-ink">{history.yearBuilt}</dd></div>}
      {history?.recordedAlteration && <div><dt className="text-slate-500">Recorded alteration</dt><dd className="mt-1 font-semibold text-teams-ink">{history.recordedAlteration}</dd></div>}
    </dl>
    {history && <p className="mt-4 text-xs leading-relaxed text-slate-600">Source: <a href={history.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-teams-ink">{history.sourceName} ↗</a>{history.recordedAlteration ? '. Recorded alterations may not reflect the most recent renovation.' : '.'}</p>}
    {facts?.retail?.length ? <p className="mt-4 text-sm leading-relaxed text-slate-700"><span className="font-semibold text-teams-ink">Listed commercial occupants: </span>{facts.retail.join(' · ')}</p> : null}
  </section>;
}
