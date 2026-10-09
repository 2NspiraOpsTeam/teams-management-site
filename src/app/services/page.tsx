import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ServicesPage() {
  return <><Header /><main>
    <section className="bg-slate-50 py-16"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><div className="mb-5 h-px w-12 bg-slate-400" aria-hidden="true" /><h1 className="mb-4 text-4xl font-serif font-semibold text-slate-900">Services</h1><p className="text-lg text-slate-600">Contact Teams Management for information specific to your property.</p></div></section>
    <section className="bg-white py-16"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl border-t border-slate-200 pt-6"><h2 className="mb-4 text-2xl font-serif font-semibold text-slate-900">Property-specific information</h2><p className="text-slate-600">Service arrangements vary by property and management agreement. This preview does not list unverified services or make property-specific commitments.</p><a href="/contact" className="mt-6 inline-flex bg-teams-gold px-6 py-3 font-semibold text-slate-950 hover:bg-teams-gold-highlight">Contact Teams Management</a></div></div></section>
  </main><Footer /></>;
}
