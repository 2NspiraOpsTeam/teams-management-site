export const runtime = 'edge';
import { PageShowcase } from '@/components/page-showcase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactDetails } from '@/components/contact-details';

// Keep this list aligned with verified, live tenant-portal capabilities.
const tenantBenefits = [
  { icon: '⌂', title: 'Your property and unit', description: 'See the property and unit assigned to your account.' },
  { icon: '✎', title: 'Maintenance requests', description: 'Tell us about a maintenance issue from your portal.' },
  { icon: '◷', title: 'Request updates', description: 'Review the status and history of your requests.' },
  { icon: '🔒', title: 'Secure access', description: 'Sign in to your own tenant account and sign out when done.' },
];

export default async function TenantServicesPage() {
  return <>
    <Header />
    <main className="min-h-[70vh] bg-slate-50">
      <section className="gold-street-hero gold-street-hero--tenant-services text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-px w-14 bg-white/50 mb-6" />
          <h1 className="text-4xl sm:text-6xl font-serif mb-5">Tenant Services</h1>
          <p className="text-lg text-slate-200 leading-relaxed">Support and useful information for the people who call our properties home.</p>
        </div>
      </section>
      <section aria-labelledby="tenant-benefits-heading" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
        <div className="h-px w-10 bg-teams-gold mb-5" />
        <h2 id="tenant-benefits-heading" className="text-3xl font-serif text-teams-ink mb-3">What can I do when I log in?</h2>
        <p className="text-slate-700 mb-8">Your tenant portal keeps the essentials in one place.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {tenantBenefits.map(({ icon, title, description }) => (
            <article key={title} className="tenant-service-card border border-slate-200 bg-white p-6">
              <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center bg-teams-gold/20 text-xl text-teams-ink">{icon}</span>
              <h3 className="mt-4 font-serif text-xl text-teams-ink">{title}</h3>
              <p className="mt-2 text-slate-700">{description}</p>
            </article>
          ))}
        </div>
        <a href="/tenant/login" className="mt-8 inline-flex min-h-12 items-center px-6 py-3 bg-teams-gold text-teams-ink font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Tenant Login <span aria-hidden="true" className="ml-3">↗</span></a>
      </section>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="h-px w-10 bg-teams-gold mb-5" /><h2 className="text-3xl font-serif text-teams-ink mb-3">How can we help?</h2>
        <p className="text-slate-700 mb-8 max-w-2xl">Choose the right way to reach us. For urgent property needs, continue using your established building-management or emergency contact method.</p>
        <div className="grid md:grid-cols-2 gap-5">
          <section className="tenant-service-card relative border border-slate-200 bg-white p-7 sm:p-9"><span className="block text-xs font-semibold tracking-widest text-teams-secondary mb-6">01 / RESIDENT ACCESS</span><h3 className="font-serif text-2xl text-teams-ink mb-3">Your tenant account</h3><p className="text-slate-700 mb-7">Sign in to access your available resident services.</p><a href="/tenant/login" className="inline-flex min-h-12 items-center px-6 py-3 bg-teams-gold text-teams-ink font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Tenant Login <span aria-hidden="true" className="ml-3">↗</span></a></section>
          <section className="tenant-service-card relative border border-slate-200 bg-white p-7 sm:p-9"><span className="block text-xs font-semibold tracking-widest text-teams-secondary mb-6">02 / GENERAL QUESTIONS</span><h3 className="font-serif text-2xl text-teams-ink mb-3">Contact the team</h3><p className="text-slate-700 mb-7">Get in touch directly for general questions or guidance.</p><ContactDetails /><a href="/contact" className="mt-6 inline-flex min-h-12 items-center text-teams-ink font-semibold underline decoration-teams-gold underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">More contact information <span aria-hidden="true" className="ml-3">↗</span></a></section>
        </div>
      </section>
<PageShowcase page="tenant-services" variant="split"/>    </main>
    <Footer />
  </>;
}
