import { addressLabel } from '@/lib/map-location';
import type { Metadata } from 'next';
import { AcrossCityRail } from '@/components/across-city-rail';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { canonicalPreviewBuildings, listPublicBuildings } from '@/lib/public-buildings';
import { adminDb } from '@/lib/admin-auth';
import { homeMedia, publicMediaSrc, type MediaRow } from '@/lib/media-management';
import { previewPortfolio, previewPortfolioEnabled } from '@/lib/preview-portfolio';
import type { BuildingPublic } from '@/lib/database.types';
import { featuredPropertyService } from '@/lib/featured-property-service';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Teams Management | New York Property Management',
  description: 'Teams Management cares for residential and retail properties across Manhattan, the Bronx, and Queens. Explore our portfolio, rental guidance, and resident services.',
};

type Feature = { building: BuildingPublic; image: MediaRow };
const photo = (image: MediaRow, label: string, eager = false) => <img src={publicMediaSrc(image)} alt={image.alt_text || label} loading={eager ? 'eager' : 'lazy'} className="home-photo h-full w-full object-cover" />;
const location = (building: BuildingPublic) => addressLabel(building.address);

export default async function Home() {
  const db = adminDb();
  const service = await featuredPropertyService(db);
  const [buildings, assignments] = await Promise.all([previewPortfolioEnabled ? canonicalPreviewBuildings(previewPortfolio) : listPublicBuildings(), homeMedia(db)]);
  const eligible = (await Promise.all(buildings.map(async building => {
    const cover = service.eligible.find(item => item.property_slug === building.slug);
    if (!cover) return [];
    return [{ building, image: { id: cover.media_asset_id, storage_key: cover.storage_key, alt_text: cover.alt_text } as MediaRow }];
  }))).flat();
  const unique = (items: Feature[]) => items.filter((item, index) => items.findIndex(other => other.building.slug === item.building.slug) === index);
  const candidates = unique(eligible);
  const candidateBySlug = new Map(candidates.map(item => [item.building.slug, item]));
  const featured = (['home:0', 'home:1', 'home:2'] as const)
    .map(slot => service.select(slot))
    .map(item => item && candidateBySlug.get(item.property_slug))
    .filter((item): item is Feature => !!item);
  const showcaseImages = new Map(candidates.map(item => [item.building.slug, item.image]));
  const featuredSlugs = new Set([...service.slots.entries()].filter(([slot]) => slot !== 'home:showcase').map(([,item]) => item?.property_slug));
  const railStart = service.select('home:showcase')?.property_slug;
  const showcasePool = buildings.filter(building => !featuredSlugs.has(building.slug));
  const start = Math.max(0, showcasePool.findIndex(building => building.slug === railStart));
  const showcase = [...showcasePool.slice(start), ...showcasePool.slice(0, start)].flatMap(building => {
    const image = showcaseImages.get(building.slug);
    if (!image) return [];
    return [{ slug: building.slug, name: building.name, location: location(building), href: previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? `/retail/${building.slug}` : `/properties/${building.slug}`, src: publicMediaSrc(image), alt: image.alt_text || `Approved cover photo of ${building.name}` }];
  });
  const hero = assignments.find(item => item.slot === 'hero') || featured[0]?.image;
  const retailImage = featured.find(item => item.building.slug !== featured[0]?.building.slug)?.image || eligible[0]?.image;

  return <><Header /><main id="main-content" className="bg-[#f7f4ee] text-teams-ink">
    <section className="relative isolate flex min-h-[min(720px,78svh)] items-end overflow-hidden bg-teams-charcoal text-white sm:min-h-[680px]">
      {hero && <div className="absolute inset-0 -z-20">{photo(hero, 'Teams Management property', true)}</div>}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1d2022]/90 via-[#1d2022]/35 to-[#1d2022]/15" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.24em] text-[#e5d5b2]">Teams Management · New York City</p>
        <h1 className="mb-5 max-w-[14ch] font-serif text-5xl font-normal leading-[1.05] sm:text-7xl lg:text-[6rem]">New York properties. People-first management.</h1>
        <p className="mb-8 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">We care for residential and retail properties across the city, helping residents, prospective renters, and businesses connect with the right place and the right team.</p>
        <div className="flex flex-wrap gap-3"><Link className="home-button bg-teams-gold text-[#111]" href="/properties">Explore Our Properties <span aria-hidden="true">↗</span></Link><Link className="home-button border border-white/70 text-white hover:bg-white/10" href="/rent-with-us">Rent With Us <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-14 pt-12 sm:gap-6 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-3 lg:px-12 lg:pb-24 lg:pt-20" aria-label="Discover residential, retail, and dining"><Link href="/properties" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#44484b] p-7 text-white sm:min-h-[500px] sm:p-12 lg:p-8"><div className="absolute inset-0 -z-20"><img src="/residential-discovery.jpg" alt="Modern residential lounge interior" loading="lazy" className="home-photo h-full w-full object-cover" /></div><div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 to-black/15"/><div><p className="home-eyebrow text-white/80">Discover</p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl lg:text-4xl xl:text-5xl">Residential Properties</h2><p className="mb-4 max-w-sm text-sm text-white/85">Explore the places we manage across New York.</p><span className="home-text-link text-white">Explore properties ↗</span></div></Link><Link href="/retail" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#3d4142] p-7 text-white sm:min-h-[500px] sm:p-12 lg:p-8">{retailImage && <div className="absolute inset-0 -z-20">{photo(retailImage, 'Teams Management property with retail portfolio')}</div>}<div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/25"/><div><p className="home-eyebrow text-white/80">Discover</p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl lg:text-4xl xl:text-5xl">Retail &amp; Commercial</h2><p className="mb-4 max-w-sm text-sm text-white/85">View the commercial side of our portfolio.</p><span className="home-text-link text-white">Explore retail ↗</span></div></Link><Link href="/dining#delizia-73" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#4b3830] p-7 text-white sm:min-h-[500px] sm:p-12 lg:p-8"><div className="absolute inset-0 -z-20"><img src="/dining/delizia-73-pizza-client.jpg" alt="Fresh pizza at Delizia 73" loading="lazy" className="home-photo h-full w-full object-cover" /></div><div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/20"/><div><p className="home-eyebrow text-white/80">Discover</p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl lg:text-4xl xl:text-5xl">Dining Destination</h2><p className="mb-4 max-w-sm text-sm text-white/85">Meet Delizia 73 and explore its neighborhood story.</p><span className="home-text-link text-white">Explore dining ↗</span></div></Link></section>

    <section className="bg-[#f7f4ee] py-16 sm:py-20 lg:py-24" aria-labelledby="roots-title"><div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16 lg:px-12"><div><p className="home-eyebrow">Rooted in New York. Built on Trust.</p><h2 id="roots-title" className="mb-0 max-w-lg font-serif text-3xl font-normal text-teams-ink sm:text-4xl">A New York story, generations in the making.</h2></div><div><p className="mb-4 max-w-xl leading-relaxed text-teams-secondary">Our story began when our founder came from Italy to New York and built a future in construction. That entrepreneurial spirit later led the family into real estate and continues to guide the next generation at Teams Management.</p><Link className="home-text-link" href="/about">Our Story <span aria-hidden="true">↗</span></Link></div></div></section>

    <section className="relative isolate overflow-hidden bg-teams-charcoal py-20 text-white sm:py-28" aria-labelledby="place-title">
      <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full border border-white/10 sm:h-[32rem] sm:w-[32rem]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-16 -z-10 h-80 w-80 rounded-full border border-white/10 sm:h-[32rem] sm:w-[32rem]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-12 h-px w-16 bg-teams-gold" aria-hidden="true" />
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-20">
          <div><p className="home-eyebrow text-[#e5d5b2]">New York City, up close</p><h2 id="place-title" className="mb-0 max-w-[12ch] font-serif text-5xl font-normal leading-[1.05] sm:text-7xl">A portfolio shaped by place.</h2></div>
          <div><p className="mb-7 max-w-md text-lg leading-relaxed text-white/75">Every address is part of a neighborhood, shaped by the people and places around it. Explore our properties across Manhattan, the Bronx, and Queens.</p><Link className="home-text-link text-[#e5d5b2]" href="/properties">Explore the portfolio <span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className="mt-16 grid border-t border-white/20 pt-5 text-xs font-semibold uppercase tracking-[.2em] text-white/65 sm:grid-cols-3 sm:gap-6"><span className="py-2">Manhattan</span><span className="py-2">The Bronx</span><span className="py-2">Queens</span></div>
      </div>
    </section>
    <section className="home-featured border-b border-[#e6dfd2] py-20 sm:py-28" aria-labelledby="featured-title"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <div className="mb-11 flex flex-wrap items-end justify-between gap-5"><div><p className="home-eyebrow">The portfolio</p><h2 id="featured-title" className="font-serif text-4xl font-normal sm:text-6xl">Featured properties</h2></div><p className="mb-0 max-w-xs text-sm text-teams-secondary">A closer look at selected addresses in our portfolio.</p></div>
      {featured.length > 0 ? <div className="space-y-14 sm:space-y-20">{featured.map(({building,image},index) => <article key={building.slug} className={`grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-12 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
        <Link href={previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? `/retail/${building.slug}` : `/properties/${building.slug}`} className="home-image-link block aspect-[4/3] overflow-hidden bg-stone-200 sm:aspect-[16/10] lg:col-span-8" aria-label={`View ${building.name}`}>{photo(image, `Approved cover photo of ${building.name}`)}</Link>
        <div className="lg:col-span-4"><p className="home-eyebrow">{String(index + 1).padStart(2, '0')} / {location(building)}</p><h3 className="mb-3 font-serif text-3xl font-normal sm:text-4xl">{building.name}</h3><p className="mb-6 text-sm text-teams-secondary">{addressLabel(building.address)}</p><Link className="home-text-link" href={previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? `/retail/${building.slug}` : `/properties/${building.slug}`}>{previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? 'View Commercial Property' : 'View Property'} <span aria-hidden="true">↗</span></Link></div>
      </article>)}</div> : <div className="border-t border-stone-300 py-14"><p className="mb-5">Explore the properties currently available to view.</p><Link className="home-text-link" href="/properties">View All Properties ↗</Link></div>}
      <div className="pt-16 text-center sm:pt-20"><Link className="home-button border border-teams-ink text-teams-ink hover:bg-teams-ink hover:text-white" href="/properties">View All Properties <span aria-hidden="true">↗</span></Link></div>
    </div></section>

    <section className="home-rent py-20 sm:py-28"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12"><div><p className="home-eyebrow">Your next step</p><h2 className="mb-4 font-serif text-4xl font-normal sm:text-6xl">Rent With Us</h2><p className="mb-0 max-w-lg text-teams-secondary">See our rental pathway and how to get in touch.</p></div><div className="flex flex-wrap gap-3"><Link className="home-button bg-teams-gold text-[#111]" href="/rent-with-us">Rent With Us ↗</Link><Link className="home-button border border-teams-ink text-teams-ink hover:bg-teams-ink hover:text-white" href="/rent-with-us#rental-inquiry">Start Rental Inquiry ↗</Link></div></div></section>
    {showcase.length > 0 && <section className="home-across py-16 sm:py-24" aria-labelledby="more-title"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="home-eyebrow">Discover more</p><h2 id="more-title" className="font-serif text-3xl font-normal sm:text-5xl">Across the city</h2></div><Link href="/properties" className="home-text-link shrink-0 text-sm">Browse all ↗</Link></div><AcrossCityRail items={showcase} /></div></section>}

    <section className="home-resident relative isolate overflow-hidden border-y border-stone-300 py-14 sm:py-20" aria-labelledby="resident-title">
      <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border border-teams-gold/30 sm:h-96 sm:w-96" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:px-12">
        <div><p className="home-eyebrow text-teams-secondary">For our residents</p><h2 id="resident-title" className="mb-4 font-serif text-4xl font-normal sm:text-5xl">Here for the everyday.</h2><p className="mb-0 max-w-xl text-base text-teams-secondary sm:text-lg">Find resident information, maintenance guidance, and the right way to reach our team when you need us.</p></div>
        <Link className="home-resident-link inline-flex min-h-12 items-center justify-between gap-8 border-b-2 border-teams-gold py-3 font-semibold text-teams-ink" href="/tenant-services">Explore Tenant Services <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
    <section className="texture-graphite bg-teams-charcoal px-5 py-20 text-center text-white sm:py-28"><p className="home-eyebrow text-[#e5d5b2]">Get in touch</p><h2 className="mx-auto mb-7 max-w-xl font-serif text-4xl font-normal sm:text-6xl">Let’s start a conversation.</h2><Link className="home-button bg-teams-gold text-[#111]" href="/contact">Contact Teams ↗</Link></section>
  </main><Footer /></>;
}
