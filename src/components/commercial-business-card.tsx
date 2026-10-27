import type { CommercialSpace } from '@/lib/retail-tenant-preview';
import { businessLogos } from '@/lib/business-logos';

export function CommercialBusinessCard({ entry }: { entry: CommercialSpace }) {
  const logo = businessLogos[entry.name];
  const storage = entry.spaces === 'STORAGE';
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-[#faf9f6] shadow-sm motion-safe:transition-shadow hover:shadow-md">
      {!storage && <div className={`flex h-40 items-center justify-center border-b border-stone-200 px-7 py-7 ${logo?.background ?? 'bg-[#eeeae2]'}`}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo.src} alt={`${entry.name} logo`} width="280" height="104" loading="lazy" className="h-full w-full object-contain" />
        ) : <span aria-hidden="true" className="max-w-xs text-center font-serif text-2xl leading-snug text-teams-ink">{entry.name}</span>}
      </div>}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-teams-secondary">{entry.spaces}</p>
        <h3 className="mt-3 font-serif text-2xl">{entry.name}</h3>
        {entry.area && <p className="mt-3 text-sm leading-relaxed text-teams-secondary">{entry.area}</p>}
        {entry.note && <p className="mt-3 text-sm leading-relaxed text-teams-secondary">{entry.note}</p>}
        {entry.website && <a href={entry.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${entry.name} website (opens in a new tab)`} className="mt-5 inline-flex min-h-11 items-center justify-between gap-4 border-t border-stone-300 pt-3 font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teams-ink">Visit website <span aria-hidden="true">↗</span></a>}
      </div>
    </article>
  );
}
