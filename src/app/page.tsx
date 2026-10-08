import { PropertyCard } from '@/components/property-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// Import seed data for development (replace with D1 queries in production)
import { seedBuildings } from '@/lib/seed-data';

export default function Home() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white min-h-[70vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Placeholder for hero image - use building exterior in production */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
              The Property Steward
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Premium property management and portfolio services in New York City. 
              Establishing calm, reliable excellence for our properties and residents.
            </p>
            
            {/* Call to actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
              >
                Contact Teams
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4L3 16" />
                </svg>
              </a>
              
              <a
                href="/tenant-services"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium border border-slate-600 text-white hover:bg-slate-800 transition-colors"
              >
                Tenant Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Properties */}
      <section className="py-20 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">
              Our Portfolio
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Discover our carefully curated selection of premium properties, 
              each managed with the highest standards of care and attention.
            </p>
          </div>

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {seedBuildings.map((building) => (
              <PropertyCard key={building.id} building={building} />
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/properties"
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 transition-colors"
            >
              View Complete Portfolio
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4L3 16" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Company Values / Credentials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-6">
                Why Trust Teams Management
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                We believe in the power of thoughtful stewardship. Our approach combines 
                operational excellence with genuine care for our properties and communities.
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-slate-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-slate-900">Established & Reliable</h3>
                    <p className="text-sm text-slate-500">Proven track record of exceptional service</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-slate-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-slate-900">Operational Excellence</h3>
                    <p className="text-sm text-slate-500">Industry-leading maintenance and management</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-slate-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.988 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM4.75 15.25v-2a3.75 3.75 0 013.75-3.75h7.5a3.75 3.75 0 013.75 3.75v2" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-slate-900">Distinctly NYC</h3>
                    <p className="text-sm text-slate-500">Understanding the nuances of Manhattan living</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder for image - team or property showcase */}
            <div className="bg-slate-100 rounded-xl aspect-[4/3] flex items-center justify-center">
              <p className="text-slate-400 text-sm text-center px-4">
                [Property Showcase Image]<br />
                Premium NYC architecture and<br />community highlights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-semibold mb-4">
            Have Questions?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Whether you're interested in one of our properties, have a service request, or simply want to learn more about our approach to property stewardship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-medium bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
