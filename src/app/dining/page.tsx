import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { listPublicDining, type DiningVenue } from '@/lib/public-dining';

export const runtime = 'edge';
export const metadata = {
  title: 'Dining | Teams Management',
  description: 'Explore dining at Teams Management properties, beginning with Delizia 73 on the Upper East Side.',
};

function ExternalAction({ href, children, primary = false }: { href: string | null; children: React.ReactNode; primary?: boolean }) {
  if (!href) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`dining-action inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${primary ? 'bg-teams-gold text-teams-ink hover:bg-teams-gold-highlight' : 'border border-stone-300 text-teams-ink hover:border-teams-gold hover:bg-white'}`}>{children}<span className="ml-1" aria-hidden="true">↗</span></a>;
}

function VenueCard({ venue, index }: { venue: DiningVenue; index: number }) {
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.address.street}, ${venue.address.city}, ${venue.address.state} ${venue.address.zip || ''}`)}`;
  return <article id={venue.slug} className="dining-venue-card grid overflow-hidden border border-stone-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#8b681f]">{index === 0 ? 'Featured dining destination' : 'Dining destination'}</p>
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
    <div className="relative min-h-72 overflow-hidden bg-[#e9e1d3] lg:min-h-[540px]">
      {venue.image ? <><img src={venue.image.src} alt={venue.image.alt} loading="lazy" className="dining-venue-photo h-full w-full object-cover" />{venue.image.caption && <p className="absolute bottom-3 right-3 rounded-sm bg-teams-charcoal/80 px-3 py-1 text-xs text-white">{venue.image.caption}</p>}</> : <div className="flex h-full items-center justify-center p-10 text-center"><p className="font-serif text-3xl text-teams-ink">A place to gather.</p></div>}
    </div>
  </article>;
}

export default async function DiningPage() {
  const venues = await listPublicDining();
  return <><Header /><main className="bg-[#f7f4ee] text-teams-ink">
    <section className="dining-hero relative isolate flex min-h-[470px] items-center overflow-hidden bg-teams-charcoal text-white sm:min-h-[560px]">
      <img src="/dining/delizia-73-interior-client.jpg" alt="Guests and staff inside a neighborhood restaurant" className="dining-hero-photo absolute inset-0 -z-20 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teams-charcoal/95 via-teams-charcoal/75 to-teams-charcoal/25" />
      <div className="dining-hero-content mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[.24em] text-teams-gold-on-dark">Places to meet. Places to stay.</p>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">Dining at Teams Management Properties</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-100">The best neighborhood moments often begin around a table. Meet the dining destinations at our properties.</p>
        {venues.length > 0 && <a href={`#${venues[0].slug}`} className="dining-explore mt-8 inline-flex min-h-11 items-center border-b-2 border-teams-gold pb-1 font-semibold text-white hover:text-teams-gold-on-dark">Explore {venues[0].name} <span className="ml-2" aria-hidden="true">↓</span></a>}
      </div>
    </section>
    <section className="texture-paper px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Dining destinations"><div className="mx-auto max-w-7xl space-y-12">
      {venues.map((venue, index) => <VenueCard key={venue.id} venue={venue} index={index} />)}
    </div></section>
    {venues.length > 0 && <section className="border-t border-stone-200 bg-white px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#8b681f]">Part of the neighborhood</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">At {venues[0].property_name}</h2><p className="mt-3 max-w-lg leading-relaxed text-slate-700">Explore the Teams Management property that is home to {venues[0].name}.</p></div><Link href={`/properties/${venues[0].property_slug}`} className="dining-action inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight">View {venues[0].property_name} →</Link></div></section>}
  </main><Footer /></>;
}
