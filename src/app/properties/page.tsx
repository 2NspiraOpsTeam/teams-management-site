import { WebsiteText } from '@/components/website-text';
import { PageShowcase } from '@/components/page-showcase';
import Link from 'next/link';
import { PortfolioMap } from '@/components/map/PortfolioMap';
import { PropertyCard } from '@/components/property-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { canonicalPreviewBuildings, listPublicBuildings } from '@/lib/public-buildings';
import { adminDb } from '@/lib/admin-auth';
import { propertyMedia, publicMediaSrc } from '@/lib/media-management';
import { previewPortfolio, previewPortfolioEnabled, sarasotaBuildingPhotos } from '@/lib/preview-portfolio';
import { listPublicRetail } from '@/lib/public-retail';

export const runtime = 'nodejs';

export default async function PropertiesPage() {
  const sourceBuildings = (previewPortfolioEnabled ? await canonicalPreviewBuildings(previewPortfolio) : await listPublicBuildings()).filter(building => building.slug !== '3425-east-tremont-bronx');
  const previewLocations = previewPortfolioEnabled ? await adminDb().prepare("SELECT slug, latitude, longitude FROM buildings WHERE map_verified=1 AND geocode_status='verified' AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180").all<{ slug: string; latitude: number; longitude: number }>() : null;
  const locationsBySlug = new Map(previewLocations?.results.map(row => [row.slug, row]));
  const buildings = sourceBuildings.map(building => {
    const location = locationsBySlug.get(building.slug);
    return location ? { ...building, latitude: location.latitude, longitude: location.longitude, geocode_status: 'verified' as const, map_verified: true } : building;
  });
  const retailSlugs = new Set((await listPublicRetail()).map(property => property.slug));
  const galleries = await Promise.all(buildings.map(async building => {const media = await propertyMedia(adminDb(),building.slug);const ordered=[...media.filter(m=>m.is_cover),...media.filter(m=>!m.is_cover)];const images=ordered.map(item=>({src:publicMediaSrc(item),alt:item.alt_text||`Approved property image for ${building.name}`,caption:item.caption}));return [building.slug,images] as const;}));
  const galleryMap = new Map(galleries);
  if (previewPortfolioEnabled) galleryMap.set('609-golden-gate-pt', sarasotaBuildingPhotos);
  return <>
    <Header />
    <main id="main-content">
      <section className="gold-street-hero gold-street-hero--properties text-white py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-white mb-4"><WebsiteText contentKey="properties.text-1">Our Portfolio</WebsiteText></h1>
          <p className="text-lg text-slate-100 max-w-2xl"><WebsiteText contentKey="properties.text-2">Explore the properties and individual residences in our portfolio.</WebsiteText></p>
        </div>
      </section>
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {buildings.length > 0 ? <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10 xl:gap-12">
            <nav aria-label="Property table of contents" className="mb-10 lg:mb-0 lg:self-stretch">
              <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h2 className="font-serif text-xl text-teams-ink"><WebsiteText contentKey="properties.text-3">All properties</WebsiteText></h2>
                <p className="mt-1 text-sm text-slate-600"><WebsiteText contentKey="properties.text-4">Select a property to jump to its listing.</WebsiteText></p>
                <ol className="mt-4 space-y-1">
                  {buildings.map(building => <li key={building.id}>
                    <a href={`#property-${building.slug}`} className="flex min-h-11 items-center rounded-sm px-2 py-2 text-sm font-medium leading-snug text-teams-ink hover:bg-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">{building.name}</a>
                  </li>)}
                </ol>
                <a href="#portfolio-map-heading" className="mt-4 flex min-h-11 items-center rounded-sm border-t border-slate-200 px-2 pt-3 text-sm font-semibold text-teams-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold"><WebsiteText contentKey="properties.text-5">All Properties on Map →</WebsiteText></a>
              </div>
            </nav>
            <div className="min-w-0 space-y-12 sm:space-y-16">
              {buildings.map(building => <PropertyCard key={building.id} anchorId={`property-${building.slug}`} building={building} images={galleryMap.get(building.slug)} hasRetail={retailSlugs.has(building.slug)} />)}
            </div>
          </div> : <p className="text-slate-600"><WebsiteText contentKey="properties.text-6">Contact our team to ask about a property.</WebsiteText></p>}
          <div className="mt-12 text-center p-8 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4"><WebsiteText contentKey="properties.text-7">Questions about a property or our management services?</WebsiteText></p>
            <Link prefetch={false} href="/contact" className="inline-flex items-center px-6 py-3 rounded-sm font-medium bg-teams-gold text-teams-ink hover:bg-teams-gold-highlight"><WebsiteText contentKey="properties.text-8">Contact Teams Management</WebsiteText></Link>
          </div>
        </div>
      </section>
<PageShowcase page="properties" variant="wide"/>      <PortfolioMap buildings={buildings} />
    </main>
    <Footer />
  </>;
}
