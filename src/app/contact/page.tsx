export const runtime = 'edge';
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
  return <><Header /><main className="min-h-[65vh]"><section className="bg-teams-charcoal text-white py-16 sm:py-20"><div className="max-w-5xl mx-auto px-4 sm:px-6"><div className="h-px w-14 bg-white/50 mb-6" /><h1 className="text-4xl sm:text-6xl font-serif mb-5">Contact</h1><p className="max-w-2xl text-lg text-slate-200">Connect with Teams Management about a property, renting, business, or resident services.</p></div></section><section className="bg-white py-16"><div className="max-w-5xl mx-auto px-4 sm:px-6"><section aria-labelledby="contact-details" className="mb-12"><h2 id="contact-details" className="font-serif text-3xl text-teams-ink mb-5">Contact information</h2><ContactDetails /></section><h2 className="font-serif text-3xl text-teams-ink mb-6">How can we help?</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{categories.map(([title, detail]) => <div key={title} className="border-t border-slate-200 p-5 bg-slate-50"><h3 className="font-semibold text-teams-ink mb-2">{title}</h3><p className="text-sm text-slate-700">{detail}</p></div>)}</div></div></section><PageShowcase page="contact" variant="offset"/></main><Footer /></>;
}
