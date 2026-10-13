import Link from 'next/link';
import highlights from '@/lib/nearby-highlights.json';
import pedestrianData from '@/lib/retail-pedestrian-data.json';
import { previewRetailNeighborhood } from '@/lib/retail-neighborhood-preview';

type Highlight = { category: string; label: string; name: string; source: string };
const icons: Record<string, string> = {
  transit: '▥', supermarket: '◫', pharmacy: '+', cafe: '☕', park: '♧', library: '▤', clinic: '✚', street: '↗', pedestrian: '◉',
};

function FactCard({ item, retail = false }: { item: Highlight; retail?: boolean }) {
  return <li className="flex min-w-0 gap-4 border-t border-stone-300 py-5">
    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl font-semibold text-teams-ink shadow-sm">{icons[item.category] || '•'}</span>
    <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.14em] text-teams-secondary">{retail && item.category === 'supermarket' ? 'Nearby retail' : item.label}</p>
      <a href={item.source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-words font-semibold text-teams-ink underline decoration-stone-400 underline-offset-4 hover:decoration-teams-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teams-ink">{item.name} <span aria-label="opens source in a new tab">↗</span></a>
    </div>
  </li>;
}

export function ResidentialNearby({ slug }: { slug: string }) {
  const items = (highlights as Record<string, Highlight[]>)[slug] || [];
  if (!items.length) return null;
  return <>
    <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">A few mapped places for everyday errands and time outside. Check each place before visiting.</p>
    <ul className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <FactCard key={`${item.category}-${item.name}`} item={item} />)}</ul>
    <Link href="#residence-location-title" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Explore the Neighborhood <span aria-hidden="true">↓</span></Link>
    <p className="mt-3 text-xs text-slate-600">Places: OpenStreetMap; transit: MTA open data. Checked October 13, 2026. The map shows the property setting; distances and walk times are not estimated.</p>
  </>;
}

export function RetailNeighborhood({ slug, street }: { slug: string; street: string }) {
  const items = (highlights as Record<string, Highlight[]>)[slug] || [];
  const area = previewRetailNeighborhood(slug);
  const pedestrian = (pedestrianData as Record<string, typeof pedestrianData[keyof typeof pedestrianData]>)[slug];
  if (!items.length || !area) return null;
  const publishedCount = pedestrian?.publication_status === 'published';
  return <section aria-labelledby="retail-neighborhood-title" className="bg-[#ede7dc] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-teams-secondary">Commercial setting</p>
    <h2 id="retail-neighborhood-title" className="mt-3 font-serif text-3xl text-teams-ink sm:text-4xl">Neighborhood</h2>
    <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">{area.context} These mapped places offer a starting point for exploring the surrounding mix—not a prediction of business performance.</p>
    <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      <FactCard retail item={{ category: 'street', label: 'Street setting', name: street, source: `https://www.openstreetmap.org/search?query=${encodeURIComponent(street + ', New York, NY')}` }} />
      {items.filter(item => item.category !== 'park').map(item => <FactCard retail key={`${item.category}-${item.name}`} item={item} />)}
      {publishedCount && <li className="flex gap-4 border-t border-stone-300 py-5"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-teams-ink shadow-sm">{icons.pedestrian}</span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-teams-secondary">Nearby DOT pedestrian count</p><a href={pedestrian.source_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-semibold underline decoration-stone-400 underline-offset-4">{Number(pedestrian.count_value).toLocaleString()} · {pedestrian.count_period} ↗</a><p className="mt-1 text-sm text-slate-700">{pedestrian.measurement_location}, about {pedestrian.distance_from_property} m straight-line from this address. This count is at the named corridor, not this storefront.</p></div></li>}
    </ul>
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"><Link href="#retail-location-title" className="inline-flex min-h-12 items-center gap-3 bg-teams-gold px-6 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Explore the Neighborhood <span aria-hidden="true">↓</span></Link><a href={area.guide} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Area guide ↗</a></div>
    <p className="mt-4 text-xs text-slate-600">Places: OpenStreetMap; transit: MTA open data. Checked October 13, 2026. NYC DOT count: May 2026, verified October 13, 2026 where shown. Verify current businesses and access before making a leasing decision.</p>
  </div></section>;
}
