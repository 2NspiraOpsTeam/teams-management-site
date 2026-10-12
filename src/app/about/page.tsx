export const runtime = 'edge';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShowcase } from '@/components/page-showcase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactDetails } from '@/components/contact-details';

export const metadata: Metadata = {
  title: 'About Teams Management | New York Property Management',
  description: 'Meet Teams Management and our people-centered approach to caring for New York properties, supporting residents, and helping visitors find their place.',
};

const commitments = [
  { title: 'A place that works', body: 'Clear information, straightforward ways to get in touch, and attention to the places people use every day.' },
  { title: 'Clarity for important decisions', body: 'Whether you are exploring a property or asking about a rental, we want the next step to be easy to understand.' },
  { title: 'A more human experience', body: 'A home is more than an address. A storefront is more than a space. People give each property its purpose.' },
];

export default async function AboutPage() {
  return <><Header /><main>
    <section className="gold-street-hero gold-street-hero--about py-16 text-white sm:py-20"><div className="mx-auto max-w-5xl px-4 sm:px-6"><div className="mb-6 h-px w-14 bg-white/50" /><p className="mb-4 text-xs uppercase tracking-[.2em] text-slate-200">About Teams Management</p><h1 className="mb-5 max-w-3xl font-serif text-4xl sm:text-6xl">Places matter. People make them meaningful.</h1><p className="max-w-2xl text-lg leading-relaxed text-slate-100">We care for a New York property portfolio with a simple belief: a well-run place should make everyday life easier and help people feel they belong.</p></div></section>
    <section className="bg-white py-16 sm:py-20"><div className="mx-auto max-w-5xl px-4 sm:px-6"><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Our approach</p><h2 className="mb-6 font-serif text-3xl text-teams-ink sm:text-4xl">Care you can see in the details.</h2><p className="max-w-3xl text-lg leading-relaxed text-slate-700">For residents, that means knowing where to turn when something needs attention. For people looking for a place, it means information that helps them picture what comes next. For the neighborhoods around our buildings, it means recognizing that every address is part of a larger community.</p><div className="mt-12 grid gap-6 md:grid-cols-3">{commitments.map((item, index) => <article key={item.title} className="border-t-2 border-teams-gold pt-5"><span className="text-xs font-semibold tracking-widest text-teams-secondary">0{index + 1} / OUR COMMITMENT</span><h3 className="mb-3 mt-4 font-serif text-2xl text-teams-ink">{item.title}</h3><p className="leading-relaxed text-slate-700">{item.body}</p></article>)}</div></div></section>
    <section className="bg-slate-50 py-14"><div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-2 md:items-center"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Our New York portfolio</p><h2 className="mb-4 font-serif text-3xl text-teams-ink sm:text-4xl">Every address has a story.</h2><p className="leading-relaxed text-slate-700">Explore our properties across Flushing, the Bronx, and Manhattan. Each has its own character, setting, and role in the city.</p></div><div className="md:text-right"><Link href="/properties" className="inline-flex min-h-11 items-center bg-teams-gold px-6 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Explore properties <span className="ml-2" aria-hidden="true">↗</span></Link></div></div></section>
    <section className="bg-white py-14"><div className="mx-auto max-w-5xl px-4 sm:px-6"><h2 className="mb-3 font-serif text-3xl text-teams-ink">Let’s talk about what you need.</h2><p className="mb-7 max-w-2xl text-slate-700">Looking for a property, have a question, or need to reach our team? Start the conversation here.</p><ContactDetails /></div></section>
    <PageShowcase page="about" variant="offset"/>
  </main><Footer /></>;
}
