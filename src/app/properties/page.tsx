import { PropertyCard } from '@/components/property-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// Import seed data for development (replace with D1 queries)
import { seedBuildings } from '@/lib/seed-data';

export default function PropertiesPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold text-slate-900 mb-4">
            Our Portfolio
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Explore our curated selection of premium properties across New York City, 
            each managed with exceptional care and attention to detail.
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filter/Sort (placeholder) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div className="flex items-center space-x-3">
              <label htmlFor="sort" className="text-sm font-medium text-slate-700">
                Sort by:
              </label>
              <select 
                id="sort"
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900"
              >
                <option>Newest properties</option>
                <option>Featured buildings</option>
                {/* Add more sort options */}
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-500">Show:</span>
              <select 
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900"
              >
                <option>All properties</option>
                <option>Residential buildings</option>
              </select>
            </div>
          </div>

          {/* Property Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {seedBuildings.map((building) => (
              <PropertyCard key={building.id} building={building} />
            ))}
          </div>

          {/* Empty state / CTA */}
          <div className="text-center p-8 bg-slate-50 rounded-lg">
            <p className="text-slate-600 mb-4">
              We&apos;re currently managing several additional properties that are under construction 
              or coming soon to our portfolio.
            </p>
            <a 
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Inquire About a Property
            </a>
          </div>
        </div>
      </section>

      {/* Map placeholder (optional future feature) */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-semibold mb-6 text-center">
            Find Properties by Location
          </h2>
          <p className="text-slate-300 text-center mb-8 max-w-2xl mx-auto">
            Explore our Manhattan and Brooklyn portfolio on an interactive map showing 
            neighborhoods, amenities, and community highlights.
          </p>
          
          {/* Map placeholder */}
          <div className="aspect-[16/9] bg-slate-800 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 text-sm text-center px-4">
              [Interactive Map Placeholder]<br />
              TODO: Integrate Google Maps or Mapbox with building locations from D1
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
