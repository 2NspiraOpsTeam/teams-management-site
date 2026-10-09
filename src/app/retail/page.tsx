import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const runtime = 'edge';

export const metadata = {
  title: 'Retail & Commercial | Teams Management',
  description: 'Contact Teams Management about retail and commercial property management in New York City.',
};

export default function RetailPage() {
  return <>
    <Header />
    <main>
      <section className="bg-teams-charcoal text-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-[1.3fr_1fr] gap-10 md:gap-16 items-end">
          <div>
            <p className="text-sm uppercase tracking-[.18em] text-slate-300 mb-5">Teams Management</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl mb-6">Retail & commercial</h1>
            <p className="max-w-xl text-lg text-slate-200 mb-0">A direct connection for questions about the retail and commercial spaces managed by our team.</p>
          </div>
          <div className="border-t border-white/20 pt-6">
            <p className="text-slate-200 mb-5">Property-specific commercial information is shared once it is verified. Contact us to discuss a location or make an inquiry.</p>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-sm bg-teams-gold px-6 py-3 font-semibold text-teams-charcoal transition-all duration-200 hover:bg-teams-gold-highlight hover:-translate-y-0.5">Contact our team <span aria-hidden="true" className="ml-2">→</span></Link>
          </div>
        </div>
      </section>
      <section className="bg-[#F8F7F3] py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 md:gap-20">
          <div>
            <p className="text-sm uppercase tracking-[.18em] text-slate-600 mb-4">Property context</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-teams-charcoal mb-5">The right details, when confirmed.</h2>
          </div>
          <div className="self-end">
            <p className="text-slate-700 mb-5">This section will grow with verified property imagery, locations, and building context. We do not publish unconfirmed space or leasing information.</p>
            <Link href="/properties" className="font-semibold text-teams-charcoal underline underline-offset-4 decoration-slate-400 hover:decoration-teams-gold">Explore the portfolio <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
