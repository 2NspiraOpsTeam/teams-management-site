import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function TenantServicesPage() {
  return (
    <>
      <Header />

      {/* Hero - Informational Gateway */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-semibold mb-4">Tenant Services Gateway</h1>
          
          {/* Informational message - not faking unavailable service */}
          <div className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur rounded-lg p-8 mb-6">
            <p className="text-lg text-slate-200 leading-relaxed mb-4">
              Welcome to the Tenant Services Gateway. This portal will provide residents with 
              access to important building information, service requests, lease documents, and 
              resident resources.
            </p>
            
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-2">Current Status</h2>
              <p className="text-yellow-400 text-sm">
                🟡 Under Development<br />
                The tenant services platform is being built to serve our residents. We&apos;ll notify 
                tenants when the gateway goes live and what services will be available.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-slate-400 text-sm font-medium mb-2">What&apos;s Coming</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">✓</span>
                    <span>Online resident directory</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">✓</span>
                    <span>Digital service request portal</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">✓</span>
                    <span>Lease document library</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">✓</span>
                    <span>Building announcements and news</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2 mt-1">✓</span>
                    <span>Resident events calendar</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-slate-400 text-sm font-medium mb-2">How to Access Services</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Tenants will receive invitation links and login credentials when the platform 
                  launches. Until then, you can:
                </p>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>Contact building management directly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>Submit service requests via email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2 mt-1">✓</span>
                    <span>Check our website for building information</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-200">
                <strong>Note:</strong> This gateway will not be available at launch. 
                Tenants can reach our team directly via the contact form for any needs.
              </p>
            </div>
          </div>

          <a
            href="/contact"
            className="inline-flex items-center px-8 py-4 rounded-lg font-medium bg-white text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Contact Building Management
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4L3 16" />
            </svg>
          </a>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-8 text-center">
            Why We&apos;re Building Tenant Services
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <article className="p-6 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-slate-600 text-xl">📱</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Digital First</h3>
              <p className="text-sm text-slate-600">
                Providing 24/7 access to information and services that matter most to residents.
              </p>
            </article>

            <article className="p-6 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-slate-600 text-xl">🤝</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Community Building</h3>
              <p className="text-sm text-slate-600">
                Connecting residents to their neighbors, building amenities, and community events.
              </p>
            </article>

            <article className="p-6 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-slate-600 text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Responsive Service</h3>
              <p className="text-sm text-slate-600">
                Faster response times for maintenance requests and building updates.
              </p>
            </article>
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-lg">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Coming Soon Notifications
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              We&apos;ll notify current tenants and potential residents when the tenant services 
              platform launches. Until then, please use the contact form for any inquiries or service needs.
            </p>
            <div className="bg-white border border-slate-200 rounded p-3">
              <p className="text-xs text-slate-500">
                Tenant Services Gateway Status: Under Development<br />
                Expected Launch: To be announced
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
