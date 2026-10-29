import {PublishedPhoto} from '@/components/published-photo';
import { pageMetadata } from '@/lib/site-seo';
import { renderWebsiteContent } from '@/components/website-content-page';
import { WebsiteText } from '@/components/website-text';
import { addressLabel } from '@/lib/map-location';
import { AcrossCityRail } from '@/components/across-city-rail';
import { ResidentReviews } from '@/components/resident-reviews';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { canonicalPreviewBuildings, listPublicBuildings } from '@/lib/public-buildings';
import { adminDb } from '@/lib/admin-auth';
import { homeMedia, publicMediaSrc, type MediaRow } from '@/lib/media-management';
import { previewPortfolio, previewPortfolioEnabled } from '@/lib/preview-portfolio';
import type { BuildingPublic } from '@/lib/database.types';
import { featuredPropertyService } from '@/lib/featured-property-service';
import { publicShowcases } from '@/lib/public-showcases';

export const runtime = 'nodejs';
export const metadata = pageMetadata('/', 'Teams Management | New York Property Management', 'Teams Management cares for residential and retail properties across Manhattan, the Bronx, and Queens. Explore our portfolio, rental guidance, and resident services.');

type Feature = { building: BuildingPublic; image: MediaRow };
const photo = (image: MediaRow, label: string, eager = false) => <PublishedPhoto src={publicMediaSrc(image)} alt={image.alt_text || label} loading={eager ? 'eager' : 'lazy'} className="home-photo h-full w-full object-cover" />;
const location = (building: BuildingPublic) => addressLabel(building.address);

async function Home() {
  const db = adminDb();
  const service = await featuredPropertyService(db);
  const [buildings, assignments, retailCovers] = await Promise.all([previewPortfolioEnabled ? canonicalPreviewBuildings(previewPortfolio) : listPublicBuildings(), homeMedia(db), publicShowcases(db, true, 'retail')]);
  const eligible = (await Promise.all(buildings.map(async building => {
    const cover = service.eligible.find(item => item.property_slug === building.slug);
    if (!cover) return [];
    return [{ building, image: { id: cover.media_asset_id, storage_key: cover.storage_key, checksum:cover.checksum, alt_text: cover.alt_text } as MediaRow }];
  }))).flat();
  const unique = (items: Feature[]) => items.filter((item, index) => items.findIndex(other => other.building.slug === item.building.slug) === index);
  const candidates = unique(eligible);
  const candidateBySlug = new Map(candidates.map(item => [item.building.slug, item]));
  const featured = (['home:0', 'home:1', 'home:2'] as const)
    .map(slot => service.select(slot))
    .map(item => item && candidateBySlug.get(item.property_slug))
    .filter((item): item is Feature => !!item);
  const showcaseImages = new Map(candidates.map(item => [item.building.slug, item.image]));
  const railStart = service.select('home:showcase')?.property_slug;
  const showcasePool = buildings;
  const start = Math.max(0, showcasePool.findIndex(building => building.slug === railStart));
  const showcase = [...showcasePool.slice(start), ...showcasePool.slice(0, start)].flatMap(building => {
    const image = showcaseImages.get(building.slug);
    return [{ slug: building.slug, name: building.name, location: location(building), href: previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? `/retail/${building.slug}` : `/properties/${building.slug}`, src: image ? publicMediaSrc(image) : undefined, alt: image?.alt_text || `Approved cover photo of ${building.name}` }];
  });
  const hero = assignments.find(item => item.slot === 'hero') || featured[0]?.image;
  const retailCover = retailCovers.find(item => item.property_slug === '1365-1st-ave');

  return <><Header /><main id="main-content" className="bg-[#f7f4ee] text-teams-ink">
    <section className="relative isolate flex min-h-[min(720px,78svh)] items-end overflow-hidden bg-teams-charcoal text-white sm:min-h-[680px]">
      {hero && <div className="absolute inset-0 -z-20">{photo(hero, 'Teams Management property', true)}</div>}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1d2022]/90 via-[#1d2022]/35 to-[#1d2022]/15" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.24em] text-[#e5d5b2]"><WebsiteText contentKey="home.text-1">Teams Management · New York City</WebsiteText></p>
        <h1 className="mb-5 max-w-[14ch] font-serif text-5xl font-normal leading-[1.05] sm:text-7xl lg:text-[6rem]"><WebsiteText contentKey="home.text-2">New York properties. People-first management.</WebsiteText></h1>
        <p className="mb-8 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"><WebsiteText contentKey="home.text-3">We care for residential and retail properties across the city, helping residents, prospective renters, and businesses connect with the right place and the right team.</WebsiteText></p>
        <div className="flex flex-wrap gap-3"><Link prefetch={false} className="home-button bg-teams-gold text-[#111]" href="/properties"><WebsiteText contentKey="home.text-4">Explore Our Properties </WebsiteText><span aria-hidden="true">↗</span></Link><Link prefetch={false} className="home-button border border-white/70 text-white hover:bg-white/10" href="/rent-with-us"><WebsiteText contentKey="home.text-5">Rent With Us </WebsiteText><span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-14 pt-12 sm:gap-6 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-3 lg:px-12 lg:pb-24 lg:pt-20" aria-label="Discover residential, retail, and dining"><Link prefetch={false} href="/properties" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#44484b] p-7 text-white sm:min-h-[500px] sm:p-12 lg:p-8"><div className="absolute inset-0 -z-20"><PublishedPhoto src="/residential-discovery.jpg" alt="Modern residential lounge interior" loading="lazy" className="home-photo h-full w-full object-cover" /></div><div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 to-black/15"/><div><p className="home-eyebrow text-white/80"><WebsiteText contentKey="home.text-6">Discover</WebsiteText></p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl lg:text-4xl xl:text-5xl"><WebsiteText contentKey="home.text-7">Residential Properties</WebsiteText></h2><p className="mb-4 max-w-sm text-sm text-white/85"><WebsiteText contentKey="home.text-8">Explore the places we manage across New York.</WebsiteText></p><span className="home-text-link text-white"><WebsiteText contentKey="home.text-9">Explore properties ↗</WebsiteText></span></div></Link><Link prefetch={false} href="/retail" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#3d4142] p-7 text-white sm:min-h-[500px] sm:p-12 lg:p-8">{retailCover && <div className="absolute inset-0 -z-20"><PublishedPhoto src={retailCover.image} alt="Retail storefronts at 1365 1st Ave" loading="lazy" className="home-photo h-full w-full object-cover" /></div>}<div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/25"/><div><p className="home-eyebrow text-white/80"><WebsiteText contentKey="home.text-10">Discover</WebsiteText></p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl lg:text-4xl xl:text-5xl"><WebsiteText contentKey="home.text-11">Retail &amp; Commercial</WebsiteText></h2><p className="mb-4 max-w-sm text-sm text-white/85"><WebsiteText contentKey="home.text-12">View the commercial side of our portfolio.</WebsiteText></p><span className="home-text-link text-white"><WebsiteText contentKey="home.text-13">Explore retail ↗</WebsiteText></span></div></Link><Link prefetch={false} href="/dining#delizia-73" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#4b3830] p-7 text-white sm:min-h-[500px] sm:p-12 lg:p-8"><div className="absolute inset-0 -z-20"><PublishedPhoto src="/dining/delizia-73-pizza-client.jpg" alt="Fresh pizza at Delizia 73" loading="lazy" className="home-photo h-full w-full object-cover" /></div><div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/20"/><div><p className="home-eyebrow text-white/80"><WebsiteText contentKey="home.text-14">Discover</WebsiteText></p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl lg:text-4xl xl:text-5xl"><WebsiteText contentKey="home.text-15">Dining Destination</WebsiteText></h2><p className="mb-4 max-w-sm text-sm text-white/85"><WebsiteText contentKey="home.text-16">Meet Delizia 73 and explore its neighborhood story.</WebsiteText></p><span className="home-text-link text-white"><WebsiteText contentKey="home.text-17">Explore dining ↗</WebsiteText></span></div></Link></section>

    <section className="bg-[#f7f4ee] py-16 sm:py-20 lg:py-24" aria-labelledby="roots-title"><div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16 lg:px-12"><div><p className="home-eyebrow"><WebsiteText contentKey="home.text-18">Rooted in New York. Built to Last.</WebsiteText></p><h2 id="roots-title" className="mb-0 max-w-lg font-serif text-3xl font-normal text-teams-ink sm:text-4xl"><WebsiteText contentKey="home.text-19">A New York story, carried forward across generations.</WebsiteText></h2></div><div><p className="mb-4 max-w-xl leading-relaxed text-teams-secondary"><WebsiteText contentKey="home.text-20">Our founder came to New York from Italy and built his first chapter through construction — learning the value of hard work, craftsmanship, and creating something that endures.</WebsiteText></p><p className="mb-4 max-w-xl leading-relaxed text-teams-secondary"><WebsiteText contentKey="home.text-21">That same entrepreneurial drive later led the family into New York real estate and the founding of Teams Management.</WebsiteText></p><p className="mb-6 max-w-xl leading-relaxed text-teams-secondary"><WebsiteText contentKey="home.text-22">Today, the next generation carries that work forward with the same belief that has always guided us: buildings matter, but the people who live, work, and build their lives within them matter more.</WebsiteText></p><Link prefetch={false} className="home-text-link" href="/about"><WebsiteText contentKey="home.text-23">Discover Our Story </WebsiteText><span aria-hidden="true">↗</span></Link></div></div></section>

    <section className="relative isolate overflow-hidden bg-teams-charcoal py-20 text-white sm:py-28" aria-labelledby="place-title">
      <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full border border-white/10 sm:h-[32rem] sm:w-[32rem]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-16 -z-10 h-80 w-80 rounded-full border border-white/10 sm:h-[32rem] sm:w-[32rem]" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-12 h-px w-16 bg-teams-gold" aria-hidden="true" />
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-20">
          <div><p className="home-eyebrow text-[#e5d5b2]"><WebsiteText contentKey="home.text-24">New York City, up close</WebsiteText></p><h2 id="place-title" className="mb-0 max-w-[12ch] font-serif text-5xl font-normal leading-[1.05] sm:text-7xl"><WebsiteText contentKey="home.text-25">A portfolio shaped by place.</WebsiteText></h2></div>
          <div><p className="mb-7 max-w-md text-lg leading-relaxed text-white/75"><WebsiteText contentKey="home.text-26">Every address is part of a neighborhood, shaped by the people and places around it. Explore our properties across Manhattan, the Bronx, and Queens.</WebsiteText></p><Link prefetch={false} className="home-text-link text-[#e5d5b2]" href="/properties"><WebsiteText contentKey="home.text-27">Explore the portfolio </WebsiteText><span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className="mt-16 grid border-t border-white/20 pt-5 text-xs font-semibold uppercase tracking-[.2em] text-white/65 sm:grid-cols-3 sm:gap-6"><span className="py-2"><WebsiteText contentKey="home.text-28">Manhattan</WebsiteText></span><span className="py-2"><WebsiteText contentKey="home.text-29">The Bronx</WebsiteText></span><span className="py-2"><WebsiteText contentKey="home.text-30">Queens</WebsiteText></span></div>
      </div>
    </section>
    <section className="home-featured border-b border-[#e6dfd2] py-20 sm:py-28" aria-labelledby="featured-title"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
      <div className="mb-11 flex flex-wrap items-end justify-between gap-5"><div><p className="home-eyebrow"><WebsiteText contentKey="home.text-31">The portfolio</WebsiteText></p><h2 id="featured-title" className="font-serif text-4xl font-normal sm:text-6xl"><WebsiteText contentKey="home.text-32">Featured properties</WebsiteText></h2></div><p className="mb-0 max-w-xs text-sm text-teams-secondary"><WebsiteText contentKey="home.text-33">A closer look at selected addresses in our portfolio.</WebsiteText></p></div>
      {featured.length > 0 ? <div className="space-y-14 sm:space-y-20">{featured.map(({building,image},index) => <article key={building.slug} className={`grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-12 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
        <Link prefetch={false} href={previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? `/retail/${building.slug}` : `/properties/${building.slug}`} className="home-image-link block aspect-[4/3] overflow-hidden bg-stone-200 sm:aspect-[16/10] lg:col-span-8" aria-label={`View ${building.name}`}>{photo(image, `Approved cover photo of ${building.name}`)}</Link>
        <div className="lg:col-span-4"><p className="home-eyebrow">{String(index + 1).padStart(2, '0')} / {location(building)}</p><h3 className="mb-3 font-serif text-3xl font-normal sm:text-4xl">{building.name}</h3><p className="mb-6 text-sm text-teams-secondary">{addressLabel(building.address)}</p><Link prefetch={false} className="home-text-link" href={previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? `/retail/${building.slug}` : `/properties/${building.slug}`}>{previewPortfolioEnabled && building.slug === '3425-east-tremont-bronx' ? 'View Commercial Property' : 'View Property'} <span aria-hidden="true">↗</span></Link></div>
      </article>)}</div> : <div className="border-t border-stone-300 py-14"><p className="mb-5"><WebsiteText contentKey="home.text-34">Explore the properties currently available to view.</WebsiteText></p><Link prefetch={false} className="home-text-link" href="/properties"><WebsiteText contentKey="home.text-35">View All Properties ↗</WebsiteText></Link></div>}
      <div className="pt-16 text-center sm:pt-20"><Link prefetch={false} className="home-button border border-teams-ink text-teams-ink hover:bg-teams-ink hover:text-white" href="/properties"><WebsiteText contentKey="home.text-36">View All Properties </WebsiteText><span aria-hidden="true">↗</span></Link></div>
    </div></section>

    <section className="home-rent py-20 sm:py-28"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12"><div><p className="home-eyebrow"><WebsiteText contentKey="home.text-37">Your next step</WebsiteText></p><h2 className="mb-4 font-serif text-4xl font-normal sm:text-6xl"><WebsiteText contentKey="home.text-38">Rent With Us</WebsiteText></h2><p className="mb-0 max-w-lg text-teams-secondary"><WebsiteText contentKey="home.text-39">See our rental pathway and how to get in touch.</WebsiteText></p></div><div className="flex flex-wrap gap-3"><Link prefetch={false} className="home-button bg-teams-gold text-[#111]" href="/rent-with-us"><WebsiteText contentKey="home.text-40">Rent With Us ↗</WebsiteText></Link><Link prefetch={false} className="home-button border border-teams-ink text-teams-ink hover:bg-teams-ink hover:text-white" href="/rent-with-us#rental-inquiry"><WebsiteText contentKey="home.text-41">Start Rental Inquiry ↗</WebsiteText></Link></div></div></section>
    {showcase.length > 0 && <section className="home-across py-16 sm:py-24" aria-labelledby="more-title"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="home-eyebrow"><WebsiteText contentKey="home.text-42">Discover more</WebsiteText></p><h2 id="more-title" className="font-serif text-3xl font-normal sm:text-5xl"><WebsiteText contentKey="home.text-43">Across the city</WebsiteText></h2></div><Link prefetch={false} href="/properties" className="home-text-link shrink-0 text-sm"><WebsiteText contentKey="home.text-44">Browse all ↗</WebsiteText></Link></div><AcrossCityRail items={showcase} /></div></section>}

    <ResidentReviews />
    <section className="home-resident relative isolate overflow-hidden border-y border-stone-300 py-14 sm:py-20" aria-labelledby="resident-title">
      <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border border-teams-gold/30 sm:h-96 sm:w-96" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:px-12">
        <div><p className="home-eyebrow text-teams-secondary"><WebsiteText contentKey="home.text-45">For our residents</WebsiteText></p><h2 id="resident-title" className="mb-4 font-serif text-4xl font-normal sm:text-5xl"><WebsiteText contentKey="home.text-46">Here for the everyday.</WebsiteText></h2><p className="mb-0 max-w-xl text-base text-teams-secondary sm:text-lg"><WebsiteText contentKey="home.text-47">Find resident information, maintenance guidance, and the right way to reach our team when you need us.</WebsiteText></p></div>
        <Link prefetch={false} className="home-resident-link inline-flex min-h-12 items-center justify-between gap-8 border-b-2 border-teams-gold py-3 font-semibold text-teams-ink" href="/tenant-services"><WebsiteText contentKey="home.text-48">Explore Tenant Services </WebsiteText><span aria-hidden="true">↗</span></Link>
      </div>
    </section>
    <section className="texture-graphite bg-teams-charcoal px-5 py-20 text-center text-white sm:py-28"><p className="home-eyebrow text-[#e5d5b2]"><WebsiteText contentKey="home.text-49">Get in touch</WebsiteText></p><h2 className="mx-auto mb-7 max-w-xl font-serif text-4xl font-normal sm:text-6xl"><WebsiteText contentKey="home.text-50">Let’s start a conversation.</WebsiteText></h2><Link prefetch={false} className="home-button bg-teams-gold text-[#111]" href="/contact"><WebsiteText contentKey="home.text-51">Contact Teams ↗</WebsiteText></Link></section>
  </main><Footer /></>;
}

// Keep published copy in the page payload, not the persistent App Router layout.
export default async function WebsitePage() { return renderWebsiteContent(await Home()); }
