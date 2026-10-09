import { PropertyCard } from '@/components/property-card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

import { listPublicBuildings } from '@/lib/public-buildings';

export const runtime = 'edge';

export default async function Home() {
  const buildings = (await listPublicBuildings()).slice(0, 3);
  
  // Curated preview images for Gold Street (2-4 strongest images)
  // These are used as portfolio visual support, not full gallery
  const curatedGoldStreetImages = [
    '/input-IMG_1540---8fb1ca65-a1a8-4978-b538-0e29844bd4e8.jpg', // Primary cover - building exterior/NYC context
    '/input-IMG_1767---4fd2b4cc-d24d-480a-84c3-fcbc244e515b.jpg',  // Architectural detail
  ];
  
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white min-h-[70vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Placeholder for hero image - use building exterior in production */}
          <div className="absolute inset-0 bg-slate-950" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="h-0.5 w-16 bg-teams-gold mb-6" aria-hidden="true" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
              The Property Steward
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Teams Management properties across New York City. Explore published profiles or contact the team for information.
            </p>
            
            {/* Call to actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-sm font-medium bg-slate-950 text-white border border-teams-gold hover:bg-slate-800 transition-colors"
              >
                Contact Teams
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4L3 16" />
                </svg>
              </a>
              
              <a
                href="/rent-with-us"
                className="inline-flex items-center justify-center px-6 py-3 rounded-sm font-medium border border-teams-gold text-white hover:bg-white hover:text-slate-950 transition-colors"
              >
                Rent with Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Visual Showcase - Curated Gold Street images */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-serif text-slate-800 mb-2">
              Portfolio Visuals
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Featured imagery from the Gold Street property. Property profiles will expand as details are approved.
            </p>
          </div>

          {/* Curated image grid - 2-4 images maximum */}
          {curatedGoldStreetImages.map((src) => (
            <div key="gold-street-preview" className="relative overflow-hidden rounded-sm border border-slate-100 mb-6">
              <img
                src={src}
                alt="Portfolio visual showcase from Gold Street property"
                className="w-full aspect-[2/1] object-cover bg-slate-50 hover:scale-105 transition-transform duration-300"
                loading="lazy"
              </img>
            </div>
          )))}
        </div>
      </section>

      {/* Selected Properties */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-px w-12 bg-teams-gold mx-auto mb-5" aria-hidden="true" />
            <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-4">
              Featured properties
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Property profiles are published as approved information becomes available.
            </p>
          </div>

          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {buildings.map((building) => (
              <PropertyCard key={building.id} building={building} />
            ))}
          </div>

          {buildings.length === 0 && <p className="mx-auto max-w-2xl border-t border-teams-gold pt-6 text-center text-slate-600">Property profiles are being prepared for publication. Please contact our team for information about the portfolio.</p>}

          <div className="text-center mt-12">
            <a
              href="/properties"
              className="inline-flex items-center px-6 py-3 rounded-sm font-medium text-slate-900 bg-white border border-teams-gold hover:bg-slate-100 transition-colors"
            >
              Explore properties
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
                About the Portfolio
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                The Phase 1 portfolio includes addresses in Flushing, the Bronx, and New York. Property-specific details will be added after review.
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-slate-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-slate-900">Verified Locations</h3>
                    <p className="text-sm text-slate-500">Addresses supplied for the Teams Management portfolio</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-slate-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-slate-900">Publication by Review</h3>
                    <p className="text-sm text-slate-500">Property details remain draft until approved</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-slate-700 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.988 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM4.75 15.25v-2a3.75 3.75 0 013.75-3.75h7.5a3.75 3.75 0 013.75 3.75v2" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-slate-900">Building Stories</h3>
                    <p className="text-sm text-slate-500">Property profiles will grow as verified details are approved</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 text-white aspect-[4/3] flex flex-col justify-end p-8 sm:p-12 border-b-4 border-teams-gold">
              <div className="h-px w-14 bg-teams-gold mb-6" aria-hidden="true" />
              <p className="uppercase tracking-[.2em] text-xs text-teams-gold-highlight mb-4">New York portfolio</p>
              <p className="font-serif text-3xl sm:text-4xl leading-tight">Every address has a story.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#fafaf8] border-y border-teams-gold/30"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8"><div><h2 className="text-2xl font-serif text-slate-950 mb-3">Rent with Us</h2><p className="text-slate-700 mb-4">A starting point for prospective renters.</p><a href="/rent-with-us" className="underline decoration-teams-gold underline-offset-4">Learn more</a></div><div><h2 className="text-2xl font-serif text-slate-950 mb-3">Gallery</h2><p className="text-slate-700 mb-4">View approved property imagery as it becomes available.</p><a href="/gallery" className="underline decoration-teams-gold underline-offset-4">Explore gallery</a></div><div><h2 className="text-2xl font-serif text-slate-950 mb-3">Tenant Services</h2><p className="text-slate-700 mb-4">Information for current residents.</p><a href="/tenant-services" className="underline decoration-teams-gold underline-offset-4">Resident information</a></div></div></section>

      {/* Contact CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-semibold mb-4">
            Have Questions?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            For property, rental, business, or resident questions, find the appropriate contact pathway.
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
