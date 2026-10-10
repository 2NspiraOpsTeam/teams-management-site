export const runtime = 'edge';
import { PageShowcase } from '@/components/page-showcase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactDetails } from '@/components/contact-details';

export default async function TenantServicesPage() {
  return <>
    <Header />
    <main className="min-h-[70vh] bg-slate-50">
      <section className="bg-teams-charcoal text-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold mb-5">Tenant Services</h1>
          <p className="text-lg text-slate-200 leading-relaxed">Support and useful information for the people who call our properties home.</p>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-serif font-semibold text-teams-ink mb-4">How can we help?</h2>
        <p className="text-slate-700 mb-6">For urgent property needs, continue using your established building-management or emergency contact method. For general questions, contact Teams Management directly:</p>
        <ContactDetails />
        <a href="/contact" className="inline-flex px-6 py-3 rounded-lg bg-teams-gold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Contact information</a>
      </section>
<PageShowcase page="tenant-services" variant="split"/>    </main>
    <Footer />
  </>;
}
