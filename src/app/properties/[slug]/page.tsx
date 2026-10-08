import Link from 'next/link';
import { PropertyCard } from '@/components/property-card';

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  // TODO: Query building from D1 based on slug
  // For now, return placeholder
  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-slate-500 hover:text-slate-900">Home</Link></li>
            <li>/</li>
            <li>
              <a 
                href="/properties" 
                className="text-slate-500 hover:text-slate-900 truncate max-w-[200px]"
              >
                Properties
              </a>
            </li>
            <li>/</li>
            <li className="text-slate-900 font-medium truncate" aria-current="page">
              {params.slug}
            </li>
          </ol>
        </nav>
      </div>

      {/* Property Detail */}
      <section className="py-12 bg-white min-h-[calc(100vh-80px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/properties"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to portfolio
          </Link>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column - Gallery & Info */}
            <div className="lg:col-span-2">
              
              {/* Hero Image Placeholder */}
              <div className="aspect-[16/9] bg-slate-100 rounded-xl mb-8 overflow-hidden">
                <p className="text-slate-400 text-sm text-center px-4 h-full flex items-center justify-center">
                  [Building Exterior Image Placeholder]<br />
                  Primary gallery image from media assignments
                </p>
              </div>

              {/* Building Name */}
              <h1 className="text-3xl font-serif font-semibold text-slate-900 mb-4">
                Property Title Here
              </h1>

              {/* Address */}
              <p className="text-lg text-slate-600 mb-6">
                123 Property Street<br />
                {params.slug}, Neighborhood, NY 10000
              </p>

              {/* Description */}
              <div className="prose prose-slate max-w-none mb-8">
                <h2 className="text-xl font-serif font-semibold text-slate-900 mb-3">Building Overview</h2>
                <p className="text-slate-600 leading-relaxed">
                  [Detailed building description from D1 - development placeholder] This property 
                  represents the finest in Manhattan living with premium amenities and attentive 
                  stewardship by Teams Management.
                </p>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <h2 className="text-xl font-serif font-semibold text-slate-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    '24/7 Concierge',
                    'Fitness Center',
                    'Rooftop Lounge',
                    'Private Dining Room',
                    'Bike Storage',
                    'Package Room'
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center text-sm text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-slate-400 mr-3" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Section */}
              <div className="mb-8">
                <h2 className="text-xl font-serif font-semibold text-slate-900 mb-4">Gallery</h2>
                <div className="aspect-[3/2] bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-400 text-sm text-center px-4">
                    [Gallery Grid]<br />
                    Multiple images from media_assignments table<br />
                    Cover image + additional property photos
                  </p>
                </div>
              </div>

              {/* Note */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">
                  <strong>Note:</strong> Individual unit availability and occupancy are not displayed 
                  publicly in Phase 1. For inquiries about specific units, please contact building management directly.
                </p>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                {/* Contact Card */}
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-4">Contact This Property</h3>
                  
                  <div className="space-y-3">
                    <a 
                      href={`mailto:leasing.${params.slug}@teams-management.com`}
                      className="inline-flex items-center w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M3 16h18M3 16l7.89-5.26a2 2 0 002.22 0L21 16" />
                      </svg>
                      Email Leasing Team
                    </a>

                    <a 
                      href="tel:+"
                      className="inline-flex items-center w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.11l-4.493 1.498a1 1 0 01-.684-.948V10m10 0a2 2 0 012 2v3.28a1 1 0 01-.684.948l-4.493 1.498a1 1 0 01-1.11-.502l-1.498-4.493a1 1 0 01.684-.948H21z" />
                      </svg>
                      Call Management Office
                    </a>
                  </div>

                  <p className="text-xs text-slate-500 mt-4">
                    Building management responds within 24-48 hours.
                  </p>
                </div>

                {/* Location Card */}
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Location</h3>
                  
                  <div className="aspect-video bg-slate-200 rounded mb-4 flex items-center justify-center overflow-hidden">
                    <p className="text-slate-400 text-xs text-center px-2">
                      [Map Placeholder]<br />
                      Google Maps / Mapbox integration coming
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 mb-2">{params.slug}</p>
                  <p className="text-xs text-slate-500">
                    Near {['Central Park', 'Union Square', 'High Line'][Math.floor(Math.random() * 3)]}
                  </p>
                </div>

                {/* Tenant Gateway Card */}
                <Link
                  href="/tenant-services"
                  className="block p-6 bg-slate-900 rounded-lg text-center text-white hover:bg-slate-800 transition-colors"
                >
                  <h3 className="font-semibold mb-2">Tenant Services</h3>
                  <p className="text-sm text-slate-300">
                    Access building amenities and resources when available.
                  </p>
                </Link>

              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
