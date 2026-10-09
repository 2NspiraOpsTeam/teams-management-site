import Link from 'next/link';
import { PortfolioMap } from '@/components/map/PortfolioMap';
import { PropertyCard } from '@/components/property-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { listPublicBuildings } from '@/lib/public-buildings';
import { adminDb } from '@/lib/admin-auth';
import { propertyMedia, publicMediaSrc } from '@/lib/media-management';
import { previewPortfolio, previewPortfolioEnabled, west18thPreviewCover } from '@/lib/preview-portfolio';

export const runtime = 'edge';

export default async function PropertiesPage() {
  const buildings = previewPortfolioEnabled ? previewPortfolio : await listPublicBuildings();
  const covers = await Promise.all(buildings.map(async building => {const media = await propertyMedia(adminDb(),building.slug);const cover=media.find(m=>m.is_cover);return [building.slug,cover?{src:publicMediaSrc(cover),alt:cover.alt_text||`Approved property image for ${building.name}`}:null] as const;}));
  const coverMap = new Map(covers);
  if (previewPortfolioEnabled) {
    coverMap.set('235-w-18th-st', { src: west18thPreviewCover, alt: 'Exterior of 235 W 18th St' });
  }
  return <>
    <Header />
    <main>
      <section className="bg-stone-50 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-teams-ink mb-4">Our Portfolio</h1>
          <p className="text-lg text-slate-600 max-w-2xl">Explore Teams Management properties. Details are added as they are verified.</p>
        </div>
      </section>
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {buildings.length > 0 ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-14 sm:gap-y-20">
            {buildings.map(building => <PropertyCard key={building.id} building={building} coverOverride={coverMap.get(building.slug)} />)}
          </div> : <p className="text-slate-600">Property profiles are being prepared for publication. Please check back soon.</p>}
          <div className="mt-12 text-center p-8 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">Questions about a property or our management services?</p>
            <Link href="/contact" className="inline-flex items-center px-6 py-3 rounded-sm font-medium bg-teams-gold text-teams-ink hover:bg-teams-gold-highlight">Contact Teams Management</Link>
          </div>
        </div>
      </section>
      <PortfolioMap buildings={buildings} />
    </main>
    <Footer />
  </>;
}
