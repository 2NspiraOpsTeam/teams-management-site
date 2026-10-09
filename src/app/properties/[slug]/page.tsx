import Link from 'next/link';
import { directionsUrl } from '@/lib/map-location';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { adminDb } from '@/lib/admin-auth';
import { propertyMedia, publicMediaSrc } from '@/lib/media-management';
import { getPublicBuilding } from '@/lib/public-buildings';
import { previewPortfolio, previewPortfolioEnabled } from '@/lib/preview-portfolio';

export const runtime = 'edge';

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const building = previewPortfolioEnabled ? previewPortfolio.find(item => item.slug === slug) : await getPublicBuilding(slug);
  if (!building) notFound();
  const media = await propertyMedia(adminDb(),slug);
  const assignedCover = media.find(item=>item.is_cover);
  const cover = assignedCover ? publicMediaSrc(assignedCover) : null;
  const gallery = media.filter(item=>!item.is_cover).map(item=>({src:publicMediaSrc(item),alt:item.alt_text||`Approved property image for ${building.name}`,caption:item.caption}));

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
        <h1 className="text-4xl font-serif font-semibold text-teams-charcoal mb-4">{building.name}</h1>
        <p className="text-lg text-slate-600 mb-10">{building.address.street}, {building.address.city}, {building.address.state} {building.address.zip}</p>
        <div className="mb-10 flex flex-wrap gap-3"><a href={directionsUrl(building.address)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-charcoal transition-colors hover:bg-teams-gold-highlight">Map &amp; Directions ↗</a><Link href="/contact" className="inline-flex min-h-11 items-center rounded-sm border border-stone-300 px-6 py-3 font-semibold text-teams-charcoal transition-colors hover:bg-stone-100">Contact Teams Management</Link></div>
        {cover && <img src={cover} alt={assignedCover?.alt_text||`Approved property image for ${building.address.street}`} className="mb-12 w-full aspect-[16/9] object-cover border border-slate-200" />}
        {gallery.length > 0 && <section aria-labelledby="gold-street-gallery" className="mb-12">
          <h2 id="gold-street-gallery" className="mb-6 text-2xl font-serif font-semibold text-teams-charcoal">Gold Street gallery</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {gallery.map((item) => <figure key={item.src} className="overflow-hidden border border-slate-200 bg-[#F8F7F3]">
              <img src={item.src} alt={item.alt} loading="lazy" className="property-image w-full aspect-[4/3] object-cover" />
            {item.caption&&<figcaption className="p-3 text-sm text-slate-600">{item.caption}</figcaption>}</figure>)}
          </div>
        </section>}
        {!building.description_public && <p className="mb-10 border-l-2 border-slate-300 pl-4 text-slate-600">Property details coming soon.</p>}
        {building.description_public && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Overview</h2><p className="text-slate-700 leading-relaxed">{building.description_public}</p></section>}
        {building.amenities_public.length > 0 && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Amenities</h2><ul className="list-disc pl-6 text-slate-700">{building.amenities_public.map(a => <li key={a.id}>{a.name}</li>)}</ul></section>}

      </div>
    </main>
    <Footer />
  </>;
}
