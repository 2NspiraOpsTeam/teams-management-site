import Link from 'next/link';
import { directionsUrl } from '@/lib/map-location';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { adminDb } from '@/lib/admin-auth';
import { propertyMedia, publicMediaSrc } from '@/lib/media-management';
import { getPublicBuilding } from '@/lib/public-buildings';
import { listPublicDining } from '@/lib/public-dining';
import { previewPortfolio, previewPortfolioEnabled, previewStaticCover } from '@/lib/preview-portfolio';

export const runtime = 'edge';

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const building = previewPortfolioEnabled ? previewPortfolio.find(item => item.slug === slug) : await getPublicBuilding(slug);
  if (!building) notFound();
  const staticCover = previewStaticCover(slug);
  const media = staticCover ? [] : await propertyMedia(adminDb(),slug);
  const assignedCover = media.find(item=>item.is_cover);
  const cover = staticCover ?? (assignedCover ? publicMediaSrc(assignedCover) : null);
  const gallery = media.filter(item=>!item.is_cover).map(item=>({src:publicMediaSrc(item),alt:item.alt_text||`Approved property image for ${building.name}`,caption:item.caption}));
  const dining = await listPublicDining(slug);

  return <>
    <Header />
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav aria-label="Breadcrumb" className="text-sm mb-10">
          <Link href="/" className="text-slate-600 hover:underline">Home</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/properties" className="text-slate-600 hover:underline">Properties</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span aria-current="page">{building.name}</span>
        </nav>
        <h1 className="text-4xl font-serif font-semibold text-teams-ink mb-4">{building.name}</h1>
        <p className="text-lg text-slate-600 mb-10">{building.address.street}, {building.address.city}, {building.address.state} {building.address.zip}</p>
        <div className="mb-10 flex flex-wrap gap-3"><a href={directionsUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-ink transition-colors hover:bg-teams-gold-highlight">Map &amp; Directions ↗</a><Link href="/contact" className="inline-flex min-h-11 items-center rounded-sm border border-stone-300 px-6 py-3 font-semibold text-teams-ink transition-colors hover:bg-stone-100">Contact Teams Management</Link></div>
        {cover && <img src={cover} alt={assignedCover?.alt_text||`Street-facing exterior of ${building.address.street}`} className="mb-12 w-full aspect-[16/9] object-cover border border-slate-200" />}
        {gallery.length > 0 && <section aria-labelledby="property-gallery" className="mb-12">
          <h2 id="property-gallery" className="mb-6 text-2xl font-serif font-semibold text-teams-ink">Property gallery</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {gallery.map((item) => <figure key={item.src} className="overflow-hidden border border-slate-200 bg-slate-50">
              <img src={item.src} alt={item.alt} loading="lazy" className="property-image w-full aspect-[4/3] object-cover" />
            {item.caption&&<figcaption className="p-3 text-sm text-slate-600">{item.caption}</figcaption>}</figure>)}
          </div>
        </section>}
        {building.description_public && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Overview</h2><p className="text-slate-700 leading-relaxed">{building.description_public}</p></section>}
        {building.amenities_public.length > 0 && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Amenities</h2><ul className="list-disc pl-6 text-slate-700">{building.amenities_public.map(a => <li key={a.id}>{a.name}</li>)}</ul></section>}
        {dining.length > 0 && <section className="mb-12 border-t border-stone-200 pt-10" aria-labelledby="dining-at-property"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#8b681f]">A neighborhood address</p><h2 id="dining-at-property" className="mt-3 font-serif text-3xl text-teams-ink">Dining at this property</h2><div className="mt-6 grid gap-5 sm:grid-cols-2">{dining.map(venue => <article key={venue.id} className="border border-stone-200 bg-[#f7f4ee] p-6"><h3 className="font-serif text-2xl text-teams-ink">{venue.name}</h3><p className="mt-2 text-sm font-medium text-slate-600">{venue.category}</p><p className="mt-4 leading-relaxed text-slate-700">{venue.summary}</p><Link href={`/dining#${venue.slug}`} className="mt-5 inline-flex min-h-11 items-center border-b-2 border-teams-gold font-semibold text-teams-ink hover:text-[#8b681f]">Explore {venue.name} →</Link></article>)}</div></section>}

      </div>
    </main>
    <Footer />
  </>;
}
