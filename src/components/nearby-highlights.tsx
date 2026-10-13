import type { BuildingPublic } from '@/lib/database.types';
import { directionsFromPropertyUrl, mapLocationUrl } from '@/lib/map-location';
import highlights from '@/lib/nearby-highlights.json';
import pedestrianData from '@/lib/retail-pedestrian-data.json';
import retailAnchors from '@/lib/retail-nearby-anchors.json';
import { previewRetailNeighborhood } from '@/lib/retail-neighborhood-preview';

type Highlight = { category: string; label: string; name: string; source: string; mapQuery?: string; destinationQuery?: string; addressDetail?: string };
const icons: Record<string, string> = {
  transit: '▥', supermarket: '◫', pharmacy: '+', cafe: '☕', park: '♧', library: '▤', clinic: '✚', street: '↗', pedestrian: '◉', hotel: '⌂', theatre: '✦', parking: 'P',
};

function FactCard({ item, address, slug, retail = false }: { item: Highlight; address: BuildingPublic['address']; slug: string; retail?: boolean }) {
  const mapQuery = item.mapQuery || `${item.name}, ${address.city}, ${address.state}`;
  const isStreetSetting = retail && item.category === 'street';
  const originAddress = slug === '61-gold-st' ? { ...address, street: '61 Gold St, Manhattan', zip: '10038' } : address;
  const mapUrl = isStreetSetting ? mapLocationUrl(address) : directionsFromPropertyUrl(originAddress, item.destinationQuery || mapQuery);
  const linkLabel = isStreetSetting ? `View ${item.name} in Google Maps` : `Get directions from this property to ${item.name}`;
  return <li className="nearby-fact group min-w-0 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
    <span aria-hidden="true" className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5edd8] text-xl font-semibold text-teams-ink">{icons[item.category] || '•'}</span>
    <div className="min-w-0"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-teams-secondary">{retail && item.category === 'supermarket' ? 'Nearby retail' : item.label}</p>
      <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`${linkLabel} (opens in a new tab)`} className="inline-flex min-h-11 items-center gap-2 break-words text-lg font-semibold leading-snug text-teams-ink underline decoration-transparent underline-offset-4 transition-colors hover:decoration-teams-ink focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">{item.name} <span aria-hidden="true" className="text-sm text-[#9b7420]">↗</span></a>
      {item.addressDetail && <p className="mt-1 text-sm text-slate-600">{item.addressDetail}</p>}
      {!isStreetSetting && <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Get directions ↗<span className="sr-only"> from this property to {item.name} (opens in a new tab)</span></a>}
    </div>
  </li>;
}

export function ResidentialNearby({ slug, address }: { slug: string; address: BuildingPublic['address'] }) {
  const items = (highlights as Record<string, Highlight[]>)[slug] || [];
  if (!items.length) return null;
  return <>
    <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">The places around a building help shape everyday life. Explore nearby shops, parks, transit, and other neighborhood essentials around this address.</p>
    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <FactCard key={`${item.category}-${item.name}`} item={item} address={address} slug={slug} />)}</ul>
    <div className="mt-7 flex flex-wrap items-center gap-4"><a href={mapLocationUrl(address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-4 rounded-md bg-teams-gold px-6 py-3 font-semibold text-teams-ink shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-teams-gold-highlight hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink motion-reduce:transform-none">Explore the Neighborhood <span aria-hidden="true">↗</span></a><span className="text-sm text-slate-600">Opens Google Maps in a new tab</span></div>
    <p className="mb-0 mt-5 text-xs text-slate-600">Places: OpenStreetMap; transit: MTA open data. Checked October 13, 2026. The map shows the property setting; distances and walk times are not estimated.</p>
  </>;
}

export function RetailNeighborhood({ slug, street, address }: { slug: string; street: string; address: BuildingPublic['address'] }) {
  const items = (highlights as Record<string, Highlight[]>)[slug] || [];
  const anchors = (retailAnchors as Record<string, Highlight[]>)[slug] || [];
  const area = previewRetailNeighborhood(slug);
  const pedestrian = (pedestrianData as Record<string, typeof pedestrianData[keyof typeof pedestrianData]>)[slug];
  if (!items.length || !area) return null;
  const publishedCount = pedestrian?.publication_status === 'published';
  return <section aria-labelledby="retail-neighborhood-title" className="bg-[#ede7dc] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-teams-secondary">Commercial setting</p>
    <h2 id="retail-neighborhood-title" className="mt-3 font-serif text-3xl text-teams-ink sm:text-4xl">Neighborhood</h2>
    <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">{area.context} Explore the nearby shops, transit, and local destinations that shape this setting. These mapped places offer a starting point for understanding the surrounding mix—not a prediction of business performance.</p>
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <FactCard retail address={address} slug={slug} item={{ category: 'street', label: 'Street setting', name: street, source: '' }} />
      {items.filter(item => anchors.length ? ['transit', 'supermarket', 'cafe', ...(anchors.length === 1 ? ['pharmacy'] : [])].includes(item.category) : item.category !== 'park').map(item => <FactCard retail address={address} slug={slug} key={`${item.category}-${item.name}`} item={item} />)}
      {anchors.map(item => <FactCard retail address={address} slug={slug} key={`${item.category}-${item.name}`} item={item} />)}
      {publishedCount && <li className="nearby-fact rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><span aria-hidden="true" className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5edd8] text-xl text-teams-ink">{icons.pedestrian}</span><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-teams-secondary">Nearby DOT pedestrian count</p><a href={pedestrian.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-lg font-semibold text-teams-ink underline decoration-transparent underline-offset-4 hover:decoration-teams-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">{Number(pedestrian.count_value).toLocaleString()} · {pedestrian.count_period} ↗</a><p className="mb-0 mt-2 text-sm leading-relaxed text-slate-700">{pedestrian.measurement_location}, about {pedestrian.distance_from_property} m straight-line from this address. This count is at the named corridor, not this storefront.</p></div></li>}
    </ul>
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"><a href={mapLocationUrl(address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 bg-teams-gold px-6 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Explore the Neighborhood <span aria-hidden="true">↗</span></a><span className="text-sm text-slate-600">Opens Google Maps in a new tab</span><a href={area.guide} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Area guide ↗</a></div>
    <p className="mt-4 text-xs text-slate-600">Places: OpenStreetMap; transit: MTA open data. Checked October 13, 2026. NYC DOT count: May 2026, verified October 13, 2026 where shown. Verify current businesses and access before making a leasing decision.</p>
  </div></section>;
}
