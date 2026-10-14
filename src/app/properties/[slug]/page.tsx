import { OfficialPlaceName } from '@/components/official-place-name';
import { addressLabel, postalAddressMetadata } from '@/lib/map-location';
import Link from 'next/link';
import type { Metadata } from 'next';
import { directionsFromPropertyUrl, directionsToPropertyUrl, navigationAddressLabel, mapLocationUrl, nearbyStreetMapCenter, satelliteMapUrl, streetViewExploreUrl } from '@/lib/map-location';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { adminDb } from '@/lib/admin-auth';
import { propertyMedia, propertyUnitMedia, publicMediaSrc } from '@/lib/media-management';
import { canonicalPreviewBuildings, getPublicBuilding } from '@/lib/public-buildings';
import { listPublicDining } from '@/lib/public-dining';
import { previewPortfolio, previewPortfolioEnabled, sarasotaUnitPhotos, sarasotaUnitMapLocation, east110UnitPhotos, east110PenthousePhotos } from '@/lib/preview-portfolio';
import { PropertyGallery } from '@/components/property-gallery';
import { getPublicRetail } from '@/lib/public-retail';
import { greatSchoolsZipUrl, nycLivingFacts } from '@/lib/nyc-living-facts';
import { NeighborhoodPreview } from '@/components/neighborhood-preview';
import { ResidentialNearby } from '@/components/nearby-highlights';
import { PropertyLocationPanel } from '@/components/map/PropertyLocationPanel';
import { GoldStreetAerial } from '@/components/map/GoldStreetAerial';

export const runtime = 'edge';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const building = previewPortfolioEnabled ? (await canonicalPreviewBuildings(previewPortfolio)).find(item => item.slug === slug) : await getPublicBuilding(slug);
  if (!building) return {};
  const address = addressLabel(building.address);
  return {
    title: `${building.name} | Teams Management Residences`,
    description: `Explore ${building.name} at ${address}. View property details, location, photos, and contact information from Teams Management.`,
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const building = previewPortfolioEnabled ? (await canonicalPreviewBuildings(previewPortfolio)).find(item => item.slug === slug) : await getPublicBuilding(slug);
  if (!building) notFound();
  const retail = await getPublicRetail(slug);
  const dining = await listPublicDining(slug);
  const dbLocation = await adminDb().prepare('SELECT latitude, longitude, geocode_status, map_verified FROM buildings WHERE slug = ?').bind(slug).first<{ latitude: number | null; longitude: number | null; geocode_status: string | null; map_verified: number | null }>();
  const location = previewPortfolioEnabled && slug === '609-golden-gate-pt-unit-402' ? sarasotaUnitMapLocation : dbLocation;
  const hasMap = location?.map_verified === 1 && location.geocode_status === 'verified' && typeof location.latitude === 'number' && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 && typeof location.longitude === 'number' && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
  const streetViewUrl = streetViewExploreUrl(building.address, hasMap ? { latitude: location!.latitude, longitude: location!.longitude, map_verified: true, geocode_status: 'verified' } : building);
  const streetAreaCenter = previewPortfolioEnabled && !hasMap ? nearbyStreetMapCenter(building.address) : null;
  const livingFacts = building.address.state === 'NY' ? nycLivingFacts(slug) : undefined;
  const zip = building.address.zip;
  const media = await propertyMedia(adminDb(),slug);
  const unitMedia = await propertyUnitMedia(adminDb(),slug);
  const unitGroups = unitMedia.reduce<Record<string,typeof unitMedia>>((groups,item)=>{(groups[item.unit_identifier]??=[]).push(item);return groups;},{});
  const coverItem = media.find(item=>item.is_cover);
  const residentialCover = coverItem ? {src:publicMediaSrc(coverItem),alt:coverItem.alt_text||`Approved property image for ${building.name}`} : null;
  const images = media.filter(item=>item.in_gallery!==0).map(item=>({src:publicMediaSrc(item),alt:item.alt_text||`Approved property image for ${building.name}`,caption:item.caption}));

  if (previewPortfolioEnabled && slug === '609-golden-gate-pt-unit-402') images.unshift(...sarasotaUnitPhotos);
  if (previewPortfolioEnabled && slug === '71-e-110th-st') images.push(...east110UnitPhotos, ...east110PenthousePhotos);

  const heroImages = residentialCover ? [{ ...images.find(image => image.src === residentialCover.src), ...residentialCover }, ...images.filter(image => image.src !== residentialCover.src)] : images;

  return <>
    <Header />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Place", name: building.name, address: postalAddressMetadata(building.address) }).replace(/</g, "\\u003c") }} /><main id="main-content" className="min-h-screen bg-white">
      <div className="pb-16">
        <section aria-label={`${building.name} photo gallery`} data-residential-hero>
          <PropertyGallery images={heroImages} name={building.name} address={addressLabel(building.address)} hero />
        </section>
        <nav aria-label="Property actions" className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 mb-14 mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-stone-200 pb-8 sm:mb-20 sm:mt-8">
          <a href={mapLocationUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-teams-ink underline underline-offset-4">View on Map ↗</a>
          <a href={directionsToPropertyUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-teams-ink underline underline-offset-4">Map &amp; Directions ↗</a>
          <a href={streetViewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-teams-ink underline underline-offset-4">Explore Street View ↗</a>
          <Link prefetch={false} href="/contact" className="inline-flex min-h-11 items-center font-semibold text-teams-ink underline underline-offset-4">Contact Teams Management</Link>
        </nav>
        <div className="mx-auto max-w-5xl px-4 sm:px-8">
        {previewPortfolioEnabled && slug === '71-e-110th-st' && <p className="mb-8 text-sm text-slate-600">Interior photos show Apartment 1B and Penthouse A; the terrace belongs to Penthouse A, not shared grounds. Contact Teams Management for current leasing information.</p>}

        {building.description_public && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Overview</h2><p className="text-slate-700 leading-relaxed">{building.description_public}</p></section>}
        {building.amenities_public.length > 0 && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Amenities</h2><ul className="list-disc pl-6 text-slate-700">{building.amenities_public.map(a => <li key={a.id}>{a.name}</li>)}</ul></section>}
        {Object.entries(unitGroups).map(([unit,items])=><section key={unit} aria-label={`Apartment ${unit} photos`} className="mb-12"><h2 className="mb-3 text-2xl font-serif font-semibold text-teams-ink">Apartment {unit} photos</h2><p className="mb-4 text-sm text-slate-600">These photos show this apartment only. Contact Teams Management for current availability.</p><PropertyGallery images={(items||[]).map(item=>({src:publicMediaSrc(item),alt:item.alt_text||`Apartment ${unit} interior`,caption:item.caption}))} name={`Apartment ${unit}`} /></section>)}
        {previewPortfolioEnabled && slug === '61-gold-st' && <section className="mb-10 rounded-lg border border-stone-200 bg-[#f7f4ee] p-6 sm:p-8" aria-labelledby="gold-street-plans">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Coming soon</p>
          <h2 id="gold-street-plans" className="mt-2 font-serif text-3xl text-teams-ink">Planned residences at 61 Gold Street</h2>
          <p className="mt-4 text-slate-700">Plans call for 90 residences, with studios, one-bedroom and two-bedroom homes, and luxury suites.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="border border-stone-200 bg-white p-5"><h3 className="font-semibold text-teams-ink">Planned fitness</h3><p className="mt-1 text-sm text-slate-600">A gym for residents.</p></div>
            <div className="border border-stone-200 bg-white p-5"><h3 className="font-semibold text-teams-ink">Planned retail</h3><p className="mt-1 text-sm text-slate-600">Retail stores at the property.</p></div>
          </div>
          <p className="mt-5 text-sm text-slate-600">Details are planned and may change. Contact Teams Management for current information.</p>
        </section>}

        {(building.address.state === 'NY' || slug === '609-golden-gate-pt-unit-402') && <section className="mb-10 rounded-2xl border border-stone-200 bg-[#f7f5ef] p-5 shadow-sm sm:p-8 lg:p-10" aria-labelledby="living-nearby-title">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#8b681f]">The neighborhood at a glance</p>
          <h2 id="living-nearby-title" className="text-3xl font-serif font-semibold text-teams-ink sm:text-4xl">Living nearby</h2>
          {previewPortfolioEnabled && <ResidentialNearby slug={slug} address={building.address} />}
          <div className="mt-7 rounded-xl border border-stone-200 bg-white/70 p-5 sm:p-6">
            <h3 className="mb-1 font-serif text-xl font-semibold text-teams-ink">Plan your visit</h3>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {zip && <a href={greatSchoolsZipUrl(zip)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Schools near {zip} ↗</a>}
              {building.address.state === 'NY' ? <><a href="https://schoolsearch.schools.nyc/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">NYC school search ↗</a>
              <a href="https://new.mta.info/maps" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">MTA maps ↗</a>
              <a href="https://portal.311.nyc.gov/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">NYC 311 ↗</a></> : <><a href="https://www.sarasotacountyschools.net/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Sarasota County Schools ↗</a><a href="https://www.visitsarasota.com/communities/downtown-sarasota" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Downtown Sarasota guide ↗</a></>}
            </div>
            {zip && <p className="mt-2 text-xs text-slate-600">A ZIP code does not determine school eligibility; confirm options with {building.address.state === 'NY' ? 'NYC Public Schools' : 'Sarasota County Schools'}.</p>}
          </div>
        </section>}
        {previewPortfolioEnabled && <NeighborhoodPreview slug={slug} residence />}
        {retail && <section aria-labelledby="retail-frontage-title" className="group relative mb-10 overflow-hidden rounded-xl bg-teams-charcoal text-white shadow-lg">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/15 sm:h-96 sm:w-96" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-4 h-52 w-52 rounded-full border border-teams-gold/30 sm:h-72 sm:w-72" />
          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-teams-gold-on-dark">Also at this address</p>
              <h2 id="retail-frontage-title" className="mt-4 max-w-xl font-serif text-3xl font-semibold sm:text-4xl">{retail.retail_status === 'planned' ? 'Planned retail' : 'Retail frontage'}</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-200">{retail.retail_status === 'planned' ? 'Explore the planned commercial component of this property.' : 'Discover the commercial side of this address, including property details and listed storefronts.'}</p>
            </div>
            <Link prefetch={false} href={`/retail/${slug}`} className="inline-flex min-h-12 w-fit items-center gap-5 rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-ink transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transform-none">Explore retail <span aria-hidden="true">↗</span></Link>
          </div>
        </section>}

        {previewPortfolioEnabled && slug === '609-golden-gate-pt-unit-402' && <section className="mb-10 text-sm text-slate-700" aria-label="Leasing information"><h2 className="text-2xl font-serif font-semibold text-teams-ink mb-3">Contact</h2><p>For current availability, rent, lease terms, pet policies, parking, and amenity access, please contact Teams Management.</p></section>}

        {dining.length > 0 && <section className="mb-12 border-t border-stone-200 pt-10" aria-labelledby="dining-at-property"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#8b681f]">A neighborhood address</p><h2 id="dining-at-property" className="mt-3 font-serif text-3xl text-teams-ink">Dining at this property</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{dining.map(venue => <article key={venue.id} className="border border-stone-200 bg-[#f7f4ee] p-6"><h3 className="font-serif text-2xl text-teams-ink"><OfficialPlaceName name={venue.name} website={venue.website_url} className="inline-block min-h-11" /></h3><p className="mt-2 text-sm font-medium text-slate-600">{venue.category}</p><p className="mt-4 leading-relaxed text-slate-700">{venue.summary}</p><a href={directionsFromPropertyUrl(building.address, `${venue.name}, ${addressLabel(venue.address)}`)} target="_blank" rel="noopener noreferrer" aria-label={`Get directions from ${navigationAddressLabel(building.address)} to ${venue.name} (opens in a new tab)`} className="mt-5 inline-flex min-h-11 items-center font-semibold text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Get Directions <span aria-hidden="true" className="ml-1">↗</span></a></article>)}</div></section>}
        <section aria-labelledby="residence-location-title" className="mb-10 border-t border-stone-200 pt-10">
          <div className={previewPortfolioEnabled ? 'grid gap-8' : 'grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start'}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Location</p>
              <h2 id="residence-location-title" className="mt-3 font-serif text-3xl text-teams-ink sm:text-4xl">Find {building.name}</h2>
              <address className="mt-5 not-italic text-slate-700">{addressLabel(building.address)}</address>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                <a href={mapLocationUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-teams-ink font-semibold text-teams-ink">View on Map ↗</a>
                <a href={directionsToPropertyUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-teams-ink font-semibold text-teams-ink">Directions to this Property ↗</a>
                <a href={streetViewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center border-b border-teams-ink font-semibold text-teams-ink">Explore Street View ↗</a>
              </div>
              <p className="mt-2 text-xs text-slate-600">Opens Google Maps; Street View coverage varies.</p>
            </div>
            {previewPortfolioEnabled && hasMap && building.address.state === 'NY' ? <GoldStreetAerial name={building.name} latitude={location!.latitude!} longitude={location!.longitude!} showFootprint={slug === '61-gold-st'} /> : hasMap || streetAreaCenter ? <div><PropertyLocationPanel name={building.name} mapQuery={slug === '609-golden-gate-pt-unit-402' ? navigationAddressLabel(building.address) : undefined} latitude={hasMap ? location.latitude! : streetAreaCenter!.latitude} longitude={hasMap ? location.longitude! : streetAreaCenter!.longitude} showPin={!!hasMap} />{!hasMap && <p className="mt-2 text-xs text-slate-600">Nearby streets only; exact property pin not yet verified.</p>}{hasMap && slug === '609-golden-gate-pt-unit-402' && <p className="mt-2 text-xs text-slate-600">Pin shows The Pearl’s building address. Teams Management manages Unit 402 only.</p>}<a href={hasMap ? satelliteMapUrl(location.latitude!, location.longitude!) : satelliteMapUrl(streetAreaCenter!.latitude, streetAreaCenter!.longitude)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center border-b border-teams-ink text-sm font-semibold text-teams-ink">Open satellite view ↗</a></div> : <div className="flex min-h-[380px] flex-col items-center justify-center bg-stone-100 p-8 text-center"><p className="font-serif text-2xl text-teams-ink">Visit this address</p><a href={mapLocationUrl(building.address)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center border-b border-teams-ink font-semibold text-teams-ink">View on map ↗</a></div>}
          </div>
        </section>

        </div>
      </div>
    </main>
    <Footer />
  </>;
}
