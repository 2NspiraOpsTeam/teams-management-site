export const runtime = 'nodejs';
import { PageShowcase } from '@/components/page-showcase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactDetails } from '@/components/contact-details';

const categories = [
  ['General', 'Questions about Teams Management.'],
  ['Property Inquiry', 'Ask about a specific published property or address.'],
  ['Rent With Us', 'Prospective renter questions.'],
  ['Owner/Business', 'Company and business inquiries.'],
  ['Tenant Services', 'Current resident questions and guidance.'],
];

export default function ContactPage() {
  return <><Header /><main id="main-content" className="min-h-[65vh]"><section className="gold-street-hero gold-street-hero--contact text-white py-16 sm:py-20"><div className="max-w-5xl mx-auto px-4 sm:px-6"><div className="h-px w-14 bg-white/50 mb-6" /><p className="mb-4 text-xs uppercase tracking-[.2em] text-slate-200">Contact Teams Management</p><h1 className="text-4xl sm:text-6xl font-serif mb-5">Let’s Start a Conversation.</h1><p className="max-w-2xl text-lg text-slate-200">Whether you’re looking for a home, exploring a business opportunity, or have a question about one of our properties, we’re here to connect.</p></div></section><section className="bg-white py-16 sm:py-20"><div className="max-w-5xl mx-auto px-4 sm:px-6"><section aria-labelledby="contact-details" className="contact-details-panel mb-16 p-6 sm:p-9"><div className="h-px w-10 bg-teams-gold mb-5" /><h2 id="contact-details" className="font-serif text-3xl text-teams-ink mb-5">Contact information</h2><ContactDetails /></section><div className="mb-7"><div className="h-px w-10 bg-teams-gold mb-5" /><h2 className="font-serif text-3xl text-teams-ink mb-2">How can we help?</h2><p className="text-slate-600 mb-0">Find the right starting point for your question.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{categories.map(([title, detail], index) => <div key={title} className="contact-topic relative border border-slate-200 p-6 bg-slate-50"><span aria-hidden="true" className="block text-xs font-semibold tracking-widest text-teams-secondary mb-6">{String(index + 1).padStart(2, '0')}</span><h3 className="font-semibold text-teams-ink mb-2">{title}</h3><p className="text-sm text-slate-700 mb-0">{detail}</p></div>)}</div></div></section><PageShowcase page="contact" variant="offset"/></main><Footer /></>;
}
