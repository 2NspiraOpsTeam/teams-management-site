export const runtime = 'edge';
import { PageShowcase } from '@/components/page-showcase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactDetails } from '@/components/contact-details';

export default async function TenantServicesPage() {
  return <>
    <Header />
    <main id="main-content" className="min-h-[70vh] bg-slate-50">
      <section className="gold-street-hero gold-street-hero--tenant-services text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px w-14 bg-white/50 mb-6" />
          <h1 className="text-4xl sm:text-6xl font-serif mb-5">Tenant Services</h1>
          <p className="text-lg text-slate-200 leading-relaxed">Support and useful information for the people who call our properties home.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="h-px w-10 bg-teams-gold mb-5" /><h2 className="text-3xl font-serif text-teams-ink mb-3">How can we help?</h2>
        <p className="text-slate-700 mb-8 max-w-2xl">Choose the right way to reach us. For urgent property needs, continue using your established building-management or emergency contact method.</p>
        <div className="grid md:grid-cols-2 gap-5">
          <section className="tenant-service-card relative border border-slate-200 bg-white p-7 sm:p-9"><span className="block text-xs font-semibold tracking-widest text-teams-secondary mb-6">01 / RESIDENT ACCESS</span><h3 className="font-serif text-2xl text-teams-ink mb-3">Your tenant account</h3><p className="text-slate-700 mb-7">Sign in to access your available resident services.</p><a href="/tenant/login" className="inline-flex min-h-12 items-center px-6 py-3 bg-teams-gold text-teams-ink font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Tenant Login <span aria-hidden="true" className="ml-3">↗</span></a></section>
          <section className="tenant-service-card relative border border-slate-200 bg-white p-7 sm:p-9"><span className="block text-xs font-semibold tracking-widest text-teams-secondary mb-6">02 / GENERAL QUESTIONS</span><h3 className="font-serif text-2xl text-teams-ink mb-3">Contact the team</h3><p className="text-slate-700 mb-7">Get in touch directly for general questions or guidance.</p><ContactDetails /><a href="/contact" className="mt-6 inline-flex min-h-12 items-center text-teams-ink font-semibold underline decoration-teams-gold underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">More contact information <span aria-hidden="true" className="ml-3">↗</span></a></section>
        </div>
        <div className="mt-8 border-l-2 border-teams-gold bg-white px-5 py-4 text-sm leading-relaxed text-slate-700">
          <p>Tenant Portal access is for authorized tenants only. Keep sign-in codes private and access only records assigned to you. Teams may suspend access if an account is misused or security is at risk.</p>
          <p className="mt-3 font-semibold text-teams-ink">For emergencies involving immediate danger to life or property, call 911 or the appropriate emergency service. Do not rely on the Tenant Portal for emergency response.</p>
        </div>
      </section>
<PageShowcase page="tenant-services" variant="split"/>    </main>
    <Footer />
  </>;
}
