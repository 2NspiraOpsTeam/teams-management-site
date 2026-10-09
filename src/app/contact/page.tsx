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
  return <><Header /><main className="min-h-[65vh]"><section className="bg-slate-950 text-white py-20"><div className="max-w-5xl mx-auto px-4 sm:px-6"><div className="h-px w-14 bg-slate-400 mb-6" /><h1 className="text-4xl sm:text-6xl font-serif mb-5">Contact</h1><p className="max-w-2xl text-lg text-slate-200">Connect with Teams Management about a property, renting, business, or resident services.</p></div></section><section className="bg-white py-16"><div className="max-w-5xl mx-auto px-4 sm:px-6"><div role="status" className="border-l-2 border-slate-300 bg-slate-50 p-6 mb-10"><h2 className="font-serif text-2xl text-slate-950 mb-2">Online inquiries are temporarily unavailable</h2><p className="text-slate-700">The online contact form is not accepting messages yet. Please email or call us using the details below; no message is collected on this page.</p></div><section aria-labelledby="contact-details" className="mb-12"><h2 id="contact-details" className="font-serif text-3xl text-slate-950 mb-5">Contact information</h2><ContactDetails /></section><h2 className="font-serif text-3xl text-slate-950 mb-6">How can we help?</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{categories.map(([title, detail]) => <div key={title} className="border-t border-slate-200 p-5 bg-slate-50"><h3 className="font-semibold text-slate-950 mb-2">{title}</h3><p className="text-sm text-slate-700">{detail}</p></div>)}</div></div></section></main><Footer /></>;
}
