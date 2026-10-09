import { PageShowcase } from '@/components/page-showcase';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { listPublicBuildings } from '@/lib/public-buildings';
import { adminDb } from '@/lib/admin-auth';
import { homeMedia, propertyMedia, publicMediaSrc, type MediaRow } from '@/lib/media-management';
import { previewPortfolio, previewPortfolioEnabled } from '@/lib/preview-portfolio';
import type { BuildingPublic } from '@/lib/database.types';

export const runtime = 'edge';

type Feature = { building: BuildingPublic; image: MediaRow };
const photo = (image: MediaRow, label: string, eager = false) => <img src={publicMediaSrc(image)} alt={image.alt_text || label} loading={eager ? 'eager' : 'lazy'} className="home-photo h-full w-full object-cover" />;
const location = (building: BuildingPublic) => [building.address.neighborhood, building.address.city, building.address.state].filter(Boolean).join(' · ');

export default async function Home() {
  const db = adminDb();
  const [buildings, assignments] = await Promise.all([previewPortfolioEnabled ? Promise.resolve(previewPortfolio) : listPublicBuildings(), homeMedia(db)]);
  const eligible = (await Promise.all(buildings.map(async building => {
    const images = await propertyMedia(db, building.slug);
    return images.map(image => ({ building, image }));
  }))).flat();
  const byAsset = new Map(eligible.map(item => [item.image.id, item]));
  const curated = assignments.filter(item => item.slot === 'featured').map(item => {
    const match = byAsset.get(item.id);
    return match && { building: match.building, image: item };
  }).filter((item): item is Feature => !!item);
  const unique = (items: Feature[]) => items.filter((item, index) => items.findIndex(other => other.building.slug === item.building.slug) === index);
  const featured = unique([...curated, ...eligible.filter(item => !curated.some(selected => selected.building.slug === item.building.slug))]).slice(0, 3);
  const showcase = unique(eligible.filter(item => !featured.some(selected => selected.building.slug === item.building.slug))).slice(0, 6);
  const hero = assignments.find(item => item.slot === 'hero') || featured[0]?.image;
  const retailImage = featured.find(item => item.building.slug !== featured[0]?.building.slug)?.image || showcase[0]?.image;

  return <><Header /><main className="bg-[#f7f4ee] text-teams-ink">
    <section className="relative isolate flex min-h-[min(780px,86svh)] items-end overflow-hidden bg-teams-charcoal text-white sm:min-h-[720px]">
      {hero && <div className="absolute inset-0 -z-20">{photo(hero, 'Teams Management property', true)}</div>}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1d2022]/90 via-[#1d2022]/35 to-[#1d2022]/15" />
      <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pb-24 lg:px-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[.24em] text-[#e5d5b2]">Teams Management · New York City</p>
        <h1 className="mb-5 max-w-[11ch] font-serif text-5xl font-normal leading-[1.05] sm:text-7xl lg:text-[6rem]">Property at the heart of what we do.</h1>
        <p className="mb-8 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">Explore our New York portfolio and find your next connection to the city.</p>
        <div className="flex flex-wrap gap-3"><Link className="home-button bg-teams-gold text-[#111]" href="/properties">Explore Our Properties <span aria-hidden="true">↗</span></Link><Link className="home-button border border-white/70 text-white hover:bg-white/10" href="/rent-with-us">Rent With Us <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12" aria-labelledby="featured-title">
      <div className="mb-11 flex flex-wrap items-end justify-between gap-5"><div><p className="home-eyebrow">The portfolio</p><h2 id="featured-title" className="font-serif text-4xl font-normal sm:text-6xl">Featured properties</h2></div><p className="mb-0 max-w-xs text-sm text-teams-secondary">A closer look at selected addresses in our portfolio.</p></div>
      {featured.length > 0 ? <div className="space-y-14 sm:space-y-20">{featured.map(({building,image},index) => <article key={building.slug} className={`grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-12 ${index % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
        <Link href={`/properties/${building.slug}`} className="home-image-link block aspect-[4/3] overflow-hidden bg-stone-200 sm:aspect-[16/10] lg:col-span-8" aria-label={`View ${building.name}`}>{photo(image, `Approved photo of ${building.name}`)}</Link>
        <div className="lg:col-span-4"><p className="home-eyebrow">{String(index + 1).padStart(2, '0')} / {location(building)}</p><h3 className="mb-3 font-serif text-3xl font-normal sm:text-4xl">{building.name}</h3><p className="mb-6 text-sm text-teams-secondary">{building.address.street} · {building.address.city}, {building.address.state}</p><Link className="home-text-link" href={`/properties/${building.slug}`}>View Property <span aria-hidden="true">↗</span></Link></div>
      </article>)}</div> : <div className="border-t border-stone-300 py-14"><p className="mb-5">Explore the properties currently available to view.</p><Link className="home-text-link" href="/properties">View All Properties ↗</Link></div>}
    </section>

    {showcase.length > 0 && <section className="bg-[#eae7e2] py-16 sm:py-24" aria-labelledby="more-title"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="home-eyebrow">Discover more</p><h2 id="more-title" className="font-serif text-3xl font-normal sm:text-5xl">Across the city</h2></div><p className="mb-0 hidden text-sm text-teams-secondary sm:block">Browse →</p></div><div className="home-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 sm:gap-6">{showcase.map(({building,image}) => <Link key={building.slug} href={`/properties/${building.slug}`} className="home-image-link group min-w-[78vw] snap-start overflow-hidden bg-white sm:min-w-[42%] lg:min-w-[30%]"><div className="aspect-[4/3] overflow-hidden">{photo(image, `Approved photo of ${building.name}`)}</div><div className="flex items-center justify-between gap-3 p-5"><div><h3 className="font-serif text-xl font-normal">{building.name}</h3><p className="mb-0 text-xs text-teams-secondary">{location(building)}</p></div><span aria-hidden="true">↗</span></div></Link>)}</div></div></section>}

    <section className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20"><Link className="home-button border border-teams-ink text-teams-ink hover:bg-teams-ink hover:text-white" href="/properties">View All Properties <span aria-hidden="true">↗</span></Link></section>

    <section className="grid lg:grid-cols-2" aria-label="Explore by property type"><Link href="/properties" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#44484b] p-7 text-white sm:min-h-[500px] sm:p-12">{featured[0] && <div className="absolute inset-0 -z-20">{photo(featured[0].image, 'Residential property')}</div>}<div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 to-black/15"/><div><p className="home-eyebrow text-white/80">Discover</p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl">Residential Properties</h2><p className="mb-4 max-w-sm text-sm text-white/85">Explore the places we manage across New York.</p><span className="home-text-link text-white">Explore properties ↗</span></div></Link><Link href="/retail" className="home-path relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#3d4142] p-7 text-white sm:min-h-[500px] sm:p-12">{retailImage && <div className="absolute inset-0 -z-20">{photo(retailImage, 'Teams Management property with retail portfolio')}</div>}<div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/25"/><div><p className="home-eyebrow text-white/80">Discover</p><h2 className="mb-3 font-serif text-4xl font-normal sm:text-5xl">Retail &amp; Commercial</h2><p className="mb-4 max-w-sm text-sm text-white/85">View the commercial side of our portfolio.</p><span className="home-text-link text-white">Explore retail ↗</span></div></Link></section>

    <section className="texture-paper border-b border-stone-200 py-16 sm:py-24"><div className="mx-auto grid max-w-7xl items-end gap-8 px-5 sm:px-8 lg:grid-cols-2 lg:px-12"><div><p className="home-eyebrow">New York City</p><h2 className="font-serif text-4xl font-normal sm:text-6xl">A portfolio shaped by place.</h2></div><p className="mb-0 max-w-md text-teams-secondary">From Manhattan to the Bronx and Queens, explore each property in its neighborhood context.</p></div></section>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12"><div><p className="home-eyebrow">Your next step</p><h2 className="mb-4 font-serif text-4xl font-normal sm:text-6xl">Rent With Us</h2><p className="mb-0 max-w-lg text-teams-secondary">See our rental pathway and how to get in touch.</p></div><div className="flex flex-wrap gap-3"><Link className="home-button bg-teams-gold text-[#111]" href="/rent-with-us">Rent With Us ↗</Link><Link className="home-button border border-teams-ink text-teams-ink hover:bg-teams-ink hover:text-white" href="/rent-with-us/apply">Apply ↗</Link></div></section>
    <section className="border-y border-stone-300 bg-white py-9"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"><div><h2 className="mb-1 font-serif text-2xl font-normal">Tenant Services</h2><p className="mb-0 text-sm text-teams-secondary">Information and contact paths for current residents.</p></div><Link className="home-text-link" href="/tenant-services">Resident information ↗</Link></div></section>
<PageShowcase page="home" variant="wide"/>    <section className="texture-graphite bg-teams-charcoal px-5 py-20 text-center text-white sm:py-28"><p className="home-eyebrow text-[#e5d5b2]">Get in touch</p><h2 className="mx-auto mb-7 max-w-xl font-serif text-4xl font-normal sm:text-6xl">Let’s start a conversation.</h2><Link className="home-button bg-teams-gold text-[#111]" href="/contact">Contact Teams ↗</Link></section>
  </main><Footer /></>;
}
