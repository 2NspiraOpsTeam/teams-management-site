import Link from 'next/link';
import { directionsUrl } from '@/lib/map-location';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { adminDb } from '@/lib/admin-auth';
import { propertyMedia, publicMediaSrc } from '@/lib/media-management';
import { getPublicBuilding } from '@/lib/public-buildings';
import { previewPortfolio, previewPortfolioEnabled, sarasotaUnitPhoto } from '@/lib/preview-portfolio';
import { PreviewBuildingDetails } from '@/components/preview-building-details';
import { PropertyGallery } from '@/components/property-gallery';

export const runtime = 'edge';

export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const building = previewPortfolioEnabled ? previewPortfolio.find(item => item.slug === slug) : await getPublicBuilding(slug);
  if (!building) notFound();
  const media = await propertyMedia(adminDb(),slug);
  const images = [...media.filter(item=>item.is_cover),...media.filter(item=>!item.is_cover)].map(item=>({src:publicMediaSrc(item),alt:item.alt_text||`Approved property image for ${building.name}`,caption:item.caption}));
  if (previewPortfolioEnabled && slug === '609-golden-gate-pt-unit-402') images.unshift(sarasotaUnitPhoto);

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
        <section aria-label={`${building.name} photo gallery`} className="mb-12"><PropertyGallery images={images} name={building.name} /></section>
        {previewPortfolioEnabled && <div className="mb-10"><PreviewBuildingDetails slug={building.slug} /></div>}
        {building.description_public && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Overview</h2><p className="text-slate-700 leading-relaxed">{building.description_public}</p></section>}
        {building.amenities_public.length > 0 && <section className="mb-10"><h2 className="text-2xl font-serif font-semibold mb-3">Amenities</h2><ul className="list-disc pl-6 text-slate-700">{building.amenities_public.map(a => <li key={a.id}>{a.name}</li>)}</ul></section>}
        {previewPortfolioEnabled && slug === '609-golden-gate-pt-unit-402' && <section className="mb-10 text-sm text-slate-600" aria-label="Property information sources">
          <h2 className="text-lg font-semibold text-teams-ink mb-2">About these details</h2>
          <p>Unit facts and area measurements come from the <a className="underline" href="https://www.sarasotapropertyappraiser.gov/propertysearch/parcel/details/2010098006" target="_blank" rel="noopener noreferrer">Sarasota County Property Appraiser’s Unit 402 record</a>. Features and building amenities are described in a <a className="underline" href="https://www.homesbymarco.com/properties/609-golden-gate-point-402-sarasota-fl-34236/2343981/3537199" target="_blank" rel="noopener noreferrer">historical sales listing</a> and should be confirmed before a rental is offered. Ask Teams Management about current availability, rent, lease terms, pets, parking, and amenity access.</p>
        </section>}

      </div>
    </main>
    <Footer />
  </>;
}
