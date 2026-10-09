import Link from 'next/link';
import { PropertyCard } from '@/components/property-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { listPublicBuildings } from '@/lib/public-buildings';

export const runtime = 'edge';

export default async function PropertiesPage() {
  const buildings = await listPublicBuildings();
  return <>
    <Header />
    <main>
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold text-slate-900 mb-4">Our Portfolio</h1>
          <p className="text-lg text-slate-600 max-w-2xl">Explore the properties currently featured by Teams Management.</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {buildings.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {buildings.map(building => <PropertyCard key={building.id} building={building} />)}
          </div> : <p className="text-slate-600">Property profiles are being prepared for publication. Please contact Teams Management for current information.</p>}
          <div className="mt-12 text-center p-8 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">Questions about a property or our management services?</p>
            <Link href="/contact" className="inline-flex items-center px-6 py-3 rounded-sm font-medium bg-slate-950 text-white border border-teams-gold hover:bg-slate-800">Contact Teams Management</Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
