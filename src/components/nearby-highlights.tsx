import { NeighborhoodVideo } from '@/components/neighborhood-video';
import { nearbyBusinessLogo } from '@/lib/nearby-business-logos';
import {PublishedPhoto} from '@/components/published-photo';
import { OfficialPlaceName } from './official-place-name';
import type { BuildingPublic } from '@/lib/database.types';
import { mapLocationUrl, navigationAddressLabel } from '@/lib/map-location';
import { nearbyPlaceLinks, type NearbyPlace } from '@/lib/nearby-place';
import highlights from '@/lib/nearby-highlights.json';
import pedestrianData from '@/lib/retail-pedestrian-data.json';
import retailAnchors from '@/lib/retail-nearby-anchors.json';
import { previewRetailNeighborhood } from '@/lib/retail-neighborhood-preview';

type Highlight = NearbyPlace;
const icons: Record<string, string> = {
  transit: '▥', supermarket: '◫', pharmacy: '+', cafe: '☕', park: '♧', library: '▤', clinic: '✚', street: '↗', pedestrian: '◉', hotel: '⌂', theatre: '✦', parking: 'P', landmark: '✦',
};

function FactCard({ item, address, slug, retail = false }: { item: Highlight; address: BuildingPublic['address']; slug: string; retail?: boolean }) {
  const links = nearbyPlaceLinks(item, address);
  const logo = nearbyBusinessLogo(item);
  const category = retail && item.category === 'supermarket' ? 'Nearby retail' : item.label;
  const detail = [category, item.locationVerifiedAt ? 'Verified location' : null, item.distanceLabel, item.walkTimeLabel].filter(Boolean).join(' · ');
  return <li data-place-name={item.name} data-property-slug={slug} className="nearby-fact group min-w-0 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
    {logo ? <div className={`mb-5 flex h-28 items-center justify-center rounded-lg p-4 ${logo.background}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.src} alt={logo.alt} width="240" height="80" loading="lazy" className="h-full w-full object-contain" />
    </div> : <span aria-hidden="true" className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5edd8] text-xl font-semibold text-teams-ink">{icons[item.category] || '•'}</span>}
    <div className="min-w-0">
      <OfficialPlaceName name={item.name} website={links.nameUrl} className="nearby-place-name inline-flex min-h-11 items-center gap-2 break-words text-lg font-semibold leading-snug text-teams-ink" />
      <p className="mt-1 text-sm text-teams-secondary">{detail}</p>
      {item.addressDetail && <p className="mt-1 text-sm text-slate-600">{item.addressDetail}</p>}
      {links.directionsUrl && <a href={links.directionsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Get directions from ${navigationAddressLabel(address)} to ${item.name} (opens in a new tab)`} className="nearby-place-directions mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Get Directions <span aria-hidden="true" className="ml-1">→</span></a>}
    </div>
  </li>;
}

export function ResidentialNearby({ slug, address }: { slug: string; address: BuildingPublic['address'] }) {
  const items = (highlights as Record<string, Highlight[]>)[slug] || [];
  if (!items.length) return null;
  return <>
    <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">The places around a building help shape everyday life. {address.state === 'FL' ? 'Explore downtown Sarasota’s grocery, library, gardens, cultural destinations, and waterfront dining from this Golden Gate Point address.' : 'Explore nearby shops, parks, transit, and other neighborhood essentials around this address.'}</p>
    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <FactCard key={`${item.category}-${item.name}`} item={item} address={address} slug={slug} />)}</ul>
    <div className="mt-7 flex flex-wrap items-center gap-4"><a href={mapLocationUrl(address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-4 rounded-md bg-teams-gold px-6 py-3 font-semibold text-teams-ink shadow-sm transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-teams-gold-highlight hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink motion-reduce:transform-none">Explore the Neighborhood <span aria-hidden="true">↗</span></a><span className="text-sm text-slate-600">Opens Google Maps in a new tab</span></div>
    <p className="mb-0 mt-5 text-xs text-slate-600">Neighborhood, transit, and nearby-business information is provided for convenience and may rely on third-party or public data. Please independently verify current access. {address.state === 'FL' ? 'Sarasota destination addresses were checked against official websites on October 13, 2026; distances and walk times are not estimated.' : 'Places: OpenStreetMap; transit: MTA open data. Checked October 13, 2026.'}</p>
  </>;
}

export function RetailNeighborhood({ slug, street, address }: { slug: string; street: string; address: BuildingPublic['address'] }) {
  const items = (highlights as Record<string, Highlight[]>)[slug] || [];
  const anchors = (retailAnchors as Record<string, Highlight[]>)[slug] || [];
  const area = previewRetailNeighborhood(slug);
  const pedestrian = (pedestrianData as Record<string, typeof pedestrianData[keyof typeof pedestrianData]>)[slug];
  const pedestrianRecordId = pedestrian?.source_url.match(/[?&]objectid=(\d+)/)?.[1];
  if (!items.length || !area) return null;
  const publishedCount = pedestrian?.publication_status === 'published';
  const selected = items.filter(item => anchors.length ? ['transit', 'supermarket', 'cafe', ...(anchors.length === 1 ? ['pharmacy'] : [])].includes(item.category) : item.category !== 'park');
  const transit = selected.filter(item => item.category === 'transit');
  const localBusinesses = selected.filter(item => item.category !== 'transit');
  return <section aria-labelledby="retail-neighborhood-title" className="bg-[#ede7dc] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-teams-secondary">Commercial setting</p>
    <h2 id="retail-neighborhood-title" className="mt-3 font-serif text-3xl text-teams-ink sm:text-4xl">What surrounds this address?</h2>
    <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
      <div><p className="max-w-3xl text-lg leading-relaxed text-slate-700">{area.context} Use the address, mapped transit, surrounding businesses, and local anchors below to assess the area. These are points of context, not measurements of activity at this storefront or a prediction of sales.</p><a href={area.guide} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">{area.guideLabel} ↗</a></div>
      <figure className="min-w-0 overflow-hidden bg-stone-200"><PublishedPhoto src={area.image} alt={area.imageAlt} loading="lazy" className="aspect-[16/10] w-full object-cover"/><figcaption className="px-3 py-2 text-xs text-slate-600">{area.name} area · Photo: <a href={area.creditUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{area.credit}</a> · {area.licenseUrl ? <a href={area.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{area.license}</a> : area.license}. Area image, not the property.</figcaption></figure>
    </div>
    {area.video && <NeighborhoodVideo video={area.video} />}
    <div className="mt-8 grid gap-4 border-y border-stone-400/50 py-6 sm:grid-cols-2">
      <div><p className="text-xs font-bold uppercase tracking-wider text-teams-secondary">Street setting</p><p className="mt-2 font-semibold">{street}</p></div>
      <div><p className="text-xs font-bold uppercase tracking-wider text-teams-secondary">Transit reference</p><p className="mt-2 font-semibold">{transit.length ? transit.map(item => item.name).join(' · ') : 'See property map'}</p></div>
    </div>
    <h3 className="mt-9 font-serif text-2xl">Nearby businesses, anchors & transit</h3>
    <p className="mt-2 max-w-3xl text-sm text-slate-700">Open each route to check its exact destination and current access before making a leasing decision.</p>
    <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {transit.map(item => <FactCard retail address={address} slug={slug} key={`${item.category}-${item.name}`} item={item} />)}
      {localBusinesses.map(item => <FactCard retail address={address} slug={slug} key={`${item.category}-${item.name}`} item={item} />)}
      {anchors.map(item => <FactCard retail address={address} slug={slug} key={`${item.category}-${item.name}`} item={item} />)}
    </ul>
    {publishedCount && <div className="mt-10"><h3 className="font-serif text-2xl">Area activity</h3><p className="mt-2 max-w-3xl text-sm text-slate-700">Pedestrian counts and area-activity data reflect measurements at identified locations and time periods. They do not represent guaranteed storefront traffic or business performance.</p><div className="nearby-fact mt-5 max-w-2xl rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><span aria-hidden="true" className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5edd8] text-xl text-teams-ink">{icons.pedestrian}</span><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-teams-secondary">Pedestrians counted on a nearby street</p><p className="text-lg font-semibold text-teams-ink">{Number(pedestrian.count_value).toLocaleString()} people · {pedestrian.count_period}</p><p className="mt-2 text-sm leading-relaxed text-slate-700">NYC DOT counted people at {pedestrian.measurement_location}, about {Math.round(pedestrian.distance_from_property * 3.28084 / 10) * 10} feet from this address in a straight line.</p><p className="mt-2 text-sm leading-relaxed text-slate-700"><strong>For retail:</strong> This is one snapshot of activity on a nearby commercial corridor. It is not a count of people passing this storefront or a measure of customer demand.</p><a href="https://data.cityofnewyork.us/Transportation/Bi-Annual-Pedestrian-Counts/cqsj-cfgu" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">See NYC DOT source data ↗<span className="sr-only"> (opens in a new tab)</span></a>{pedestrianRecordId && <p className="text-xs text-slate-600">DOT location {pedestrianRecordId}</p>}</div></div></div>}
    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"><a href={mapLocationUrl(address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-3 bg-teams-gold px-6 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Explore the Neighborhood <span aria-hidden="true">↗</span></a><span className="text-sm text-slate-600">Opens Google Maps in a new tab</span><a href={area.guide} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">Area guide ↗</a></div>
    <p className="mt-4 text-xs text-slate-600">Neighborhood, transit, and nearby-business information is provided for convenience and may rely on third-party or public data. Distances and travel times, where shown, are approximate and should be independently verified. Places: OpenStreetMap; transit: MTA open data. Checked October 13, 2026. NYC DOT count: May 2026, verified October 13, 2026 where shown.</p>
  </div></section>;
}
