import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function AboutPage() {
  return <><Header /><main>
    <section className="bg-slate-50 py-16"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><div className="mb-5 h-px w-12 bg-teams-gold" aria-hidden="true" /><h1 className="mb-4 text-4xl font-serif font-semibold text-slate-900">About Teams Management</h1><p className="text-lg text-slate-600">Property management in New York City.</p></div></section>
    <section className="bg-white py-16"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><h2 className="mb-6 text-2xl font-serif font-semibold text-slate-900">Our Portfolio</h2><p className="max-w-2xl text-slate-600">The Teams Management Phase 1 portfolio includes properties in Flushing, the Bronx, and New York. Individual property profiles are being prepared for publication.</p><a href="/contact" className="mt-6 inline-flex border border-teams-gold bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Contact Teams Management</a></div></section>
  </main><Footer /></>;
}
