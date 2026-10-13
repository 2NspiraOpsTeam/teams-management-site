import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { DiningFeatureVideo } from '@/components/dining-feature-video';
import { Footer } from '@/components/footer';
import { listPublicDining, type DiningVenue } from '@/lib/public-dining';

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
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.address.street}, ${venue.address.city}, ${venue.address.state} ${venue.address.zip || ''}`)}`;
  return <article id={venue.slug} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] md:gap-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8b681f]">Featured dining destination</p>
        <h2 className="mt-4 font-serif text-4xl leading-tight text-teams-ink sm:text-5xl">{venue.name}</h2>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[.12em] text-slate-600">{venue.category}{venue.neighborhood ? ` · ${venue.neighborhood}` : ''}</p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-700">{venue.summary}</p>
        <address className="mt-6 not-italic text-slate-700">{venue.address.street}, {venue.address.city}, {venue.address.state} {venue.address.zip}</address>
        <div className="mt-8 flex flex-wrap gap-3">
          <ExternalAction href={venue.website_url} primary>Visit Website</ExternalAction>
          <ExternalAction href={venue.menu_url}>View Menu</ExternalAction>
          <ExternalAction href={venue.reservation_url}>Reservations</ExternalAction>
          <ExternalAction href={venue.ordering_url}>Order Online</ExternalAction>
          <ExternalAction href={directions}>Map &amp; Directions</ExternalAction>
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
  return <><Header /><main className="bg-[#f7f4ee] text-teams-ink">
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
    {venues.length > 0 && <section className="border-t border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="featured-property"><div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:gap-12"><Link href={`/properties/${venues[0].property_slug}`} className="group block overflow-hidden rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B49355]" aria-label={`View ${venues[0].property_name} property`}><Image src="/preview-properties/retail-delizia-hero.jpg" alt="Delizia storefront at 1374 1st Ave" width={855} height={543} sizes="(max-width: 768px) 100vw, 50vw" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" /></Link><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#8b681f]">Featured property</p><h2 id="featured-property" className="mt-3 font-serif text-3xl sm:text-4xl">1374 1st Ave</h2><p className="mt-3 max-w-lg leading-relaxed text-slate-700">Explore the Teams Management property that is home to {venues[0].name}.</p><Link href={`/properties/${venues[0].property_slug}`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-ink transition-colors hover:bg-teams-gold-highlight">View {venues[0].property_name} →</Link></div></div></section>}
  </main><Footer /></>;
}
