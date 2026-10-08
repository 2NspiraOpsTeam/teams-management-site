import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ServicesPage() {
  const services = [
    {
      title: 'Property Management',
      description: 'Comprehensive oversight of building operations, including maintenance coordination, vendor management, and resident communications.',
      icon: 'building'
    },
    {
      title: 'Tenant Relations',
      description: 'Responsive support for residents, addressing inquiries, managing service requests, and fostering positive community relationships.',
      icon: 'users'
    },
    {
      title: 'Maintenance Services',
      description: 'Proactive building care through regular inspections, emergency response coordination, and capital project management.',
      icon: 'wrench'
    },
    {
      title: 'Financial Management',
      description: 'Transparent billing practices, reserve fund administration, and detailed reporting for building owners.',
      icon: 'dollar'
    },
    {
      title: 'Community Programs',
      description: 'Organizing resident events, neighborhood partnerships, and initiatives that enhance quality of life within buildings.',
      icon: 'heart'
    }
  ];

  return (
    <>
      <Header />
      
      {/* Hero */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold text-slate-900 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-slate-600">
            Comprehensive property management tailored to the needs of NYC residents and building owners.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <article key={service.title} className="p-6 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Discuss Your Property
            </h3>
            <p className="text-slate-600">
              Service arrangements depend on each property&apos;s needs and management agreement. Contact Teams Management for details about the support available for your building.
            </p>
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Learn More About Our Approach
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4L3 16" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
