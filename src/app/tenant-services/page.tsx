import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactDetails } from '@/components/contact-details';

export default function TenantServicesPage() {
  return <>
    <Header />
    <main className="min-h-[70vh] bg-slate-50">
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-semibold mb-5">Tenant Services</h1>
          <p className="text-lg text-slate-200 leading-relaxed">The online tenant portal is not available yet. We will share access details with residents when it is ready.</p>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-4">Need assistance now?</h2>
        <p className="text-slate-700 mb-6">For urgent property needs, continue using your established building-management or emergency contact method. For general questions, contact Teams Management directly:</p>
        <ContactDetails />
        <a href="/contact" className="inline-flex px-6 py-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Contact information</a>
      </section>
    </main>
    <Footer />
  </>;
}
