import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function RentWithUsPage() {
  return <><Header /><main>
    <section className="bg-slate-950 text-white py-24"><div className="max-w-5xl mx-auto px-4 sm:px-6"><div className="h-px w-14 bg-teams-gold mb-6" /><p className="uppercase tracking-[.2em] text-xs text-teams-gold-highlight mb-4">A place to begin</p><h1 className="text-4xl sm:text-6xl font-serif mb-6">Rent with Us</h1><p className="max-w-2xl text-lg text-slate-200 leading-relaxed">Explore Teams Management properties and start a conversation about the location that interests you.</p></div></section>
    <section className="py-20 bg-white"><div className="max-w-5xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12"><div><h2 className="text-3xl font-serif text-slate-950 mb-5">Find your starting point</h2><p className="text-slate-700 leading-relaxed mb-7">Browse our published property profiles for verified building information. The portfolio is not an availability or apartment listings feed.</p><Link href="/properties" className="inline-flex border border-teams-gold bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">Explore properties</Link></div><div className="border-l-2 border-teams-gold pl-7"><h2 className="text-3xl font-serif text-slate-950 mb-5">Ask about a property</h2><p className="text-slate-700 leading-relaxed mb-7">For a rental question, include the property address and what you would like to know. Availability, pricing, applications, and requirements are confirmed directly when information is available.</p><Link href="/contact" className="inline-flex border border-teams-gold px-6 py-3 text-slate-950 hover:bg-slate-50">Contact Teams</Link></div></div></section>
  </main><Footer /></>;
}
