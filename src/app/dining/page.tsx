import { addressLabel, directionsFromPropertyUrl, mapLocationUrl, navigationAddressLabel } from '@/lib/map-location';
import Image from 'next/image';
import { Header } from '@/components/header';
import { DiningFeatureVideo } from '@/components/dining-feature-video';
import { Footer } from '@/components/footer';
import { listPublicDining, type DiningVenue } from '@/lib/public-dining';
import { DiningPropertyRotation, type DiningProperty } from '@/components/dining-property-rotation';
import { adminDb } from '@/lib/admin-auth';
import { featuredPropertyService } from '@/lib/featured-property-service';
import { previewPortfolioEnabled } from '@/lib/preview-portfolio';

export const runtime = 'edge';
export const metadata = {
  title: 'Dining | Teams Management',
  description: 'Explore dining at Teams Management properties, beginning with Delizia 73 on the Upper East Side.',
};

function ExternalAction({ href, children, primary = false }: { href: string | null; children: React.ReactNode; primary?: boolean }) {
  if (!href) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${primary ? 'bg-teams-gold text-teams-ink hover:bg-teams-gold-highlight hover:-translate-y-0.5' : 'border border-stone-300 text-teams-ink hover:border-teams-gold hover:bg-white'}`}>{children}<span className="ml-1" aria-hidden="true">↗</span></a>;
}

function VenueDetails({ venue }: { venue: DiningVenue }) {
  const directions = directionsFromPropertyUrl(venue.address, `${venue.name}, ${addressLabel(venue.address)}`);
  return <article id={venue.slug} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] md:gap-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8b681f]">Featured dining destination</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-teams-ink sm:text-5xl"><a href={venue.website_url || mapLocationUrl(venue.address)} target="_blank" rel="noopener noreferrer" aria-label={`${venue.website_url ? `Visit ${venue.name} official website` : `Locate ${venue.name} in Google Maps`} (opens in a new tab)`} className="inline-block underline decoration-teams-ink/40 underline-offset-4 hover:decoration-teams-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">{venue.name} <span aria-hidden="true">↗</span></a></h2>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[.12em] text-slate-600">{venue.category}{venue.neighborhood ? ` · ${venue.neighborhood}` : ''}</p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700">{venue.summary}</p>
        <address className="mt-6 not-italic text-slate-700">{addressLabel(venue.address)}</address>
        <div className="mt-8 flex flex-wrap gap-3">
          <ExternalAction href={venue.menu_url}>View Menu</ExternalAction>
          <ExternalAction href={venue.reservation_url}>Reservations</ExternalAction>
          <ExternalAction href={venue.ordering_url}>Order Online</ExternalAction>
          <a href={directions} target="_blank" rel="noopener noreferrer" aria-label={`Get directions from ${navigationAddressLabel(venue.address)} to ${venue.name} (opens in a new tab)`} className="inline-flex min-h-11 items-center px-5 py-3 text-sm font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Get Directions <span aria-hidden="true" className="ml-1">↗</span></a>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[260px] overflow-hidden rounded-sm bg-white p-3 shadow-sm md:max-w-[320px]" aria-label="Delizia logo">
        <Image src="/dining/delizia-logo.png" alt="Delizia restaurant logo with Venetian gondola" width={626} height={626} className="h-auto w-full" />
      </div>
    </div>
  </article>;
}

export default async function DiningPage() {
  const venues = (await listPublicDining()).filter(venue => venue.slug === 'delizia-73');
  const service = await featuredPropertyService(adminDb());
  const unique = service.dining;
  const properties: DiningProperty[] = unique.map(item => ({
    slug: item.property_slug,
    name: item.property_name,
    image: item.image,
    alt: item.alt_text || `Photograph of ${item.property_name}`,
    href: previewPortfolioEnabled && item.property_slug === '3425-east-tremont-bronx' ? `/retail/${item.property_slug}` : `/properties/${item.property_slug}`,
  }));
  return <><Header /><main id="main-content" className="bg-[#f7f4ee] text-teams-ink">
    <section className="relative h-[calc(100svh-89px)] min-h-[360px] w-full overflow-hidden bg-teams-charcoal" aria-label="Delizia 73 film">
      <DiningFeatureVideo />
      <div className="pointer-events-none absolute left-0 right-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-4 pb-16 pt-6 text-white sm:px-8 sm:pt-10">
        <h1 className="font-serif text-3xl sm:text-5xl">Delizia 73</h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[.15em] sm:text-base">A taste of the neighborhood</p>
      </div>
    </section>
    <section className="texture-paper" aria-label="Dining destination details">
      {venues.map(venue => <VenueDetails key={venue.id} venue={venue} />)}
    </section>
    <DiningPropertyRotation properties={properties} />
  </main><Footer /></>;
}
