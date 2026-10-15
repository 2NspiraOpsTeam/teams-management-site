export const runtime = 'nodejs';
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
  { title: 'For residents', body: 'Know where to turn when something needs attention.' },
  { title: 'For people looking for a place', body: 'Find clear information to help picture what comes next.' },
  { title: 'For our neighborhoods', body: 'See each address as part of a larger community.' },
];

export default async function AboutPage() {
  return <><Header /><main id="main-content">
    <section className="gold-street-hero gold-street-hero--about py-16 text-white sm:py-20"><div className="mx-auto max-w-5xl px-4 sm:px-6"><div className="mb-6 h-px w-14 bg-white/50" /><p className="mb-4 text-xs uppercase tracking-[.2em] text-slate-200">About Teams Management</p><h1 className="mb-5 max-w-3xl font-serif text-4xl sm:text-6xl">Places matter. People make them meaningful.</h1><p className="max-w-2xl text-lg leading-relaxed text-slate-100">We care for a New York property portfolio with a simple belief: a well-run place should make everyday life easier and help people feel they belong.</p></div></section>
    <section className="bg-[#f7f4ee] py-14 sm:py-20" aria-labelledby="our-story-title"><div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-[.8fr_1.2fr] md:gap-12"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Our roots</p><h2 id="our-story-title" className="font-serif text-3xl text-teams-ink sm:text-4xl">Built in New York. Carried forward across generations.</h2></div><div className="space-y-4 leading-relaxed text-slate-700"><p>Our founder came from Italy to New York City and began his entrepreneurial journey in construction, learning firsthand the value of craftsmanship, perseverance, and building things meant to last.</p><p>Over time, that experience evolved into New York real estate and the founding of Teams Management.</p><p>Today, the next generation carries that legacy forward — bringing together decades of experience with a thoughtful, modern approach to property stewardship.</p><p>We believe the true value of a building is measured not only by the structure itself, but by the lives, businesses, relationships, and communities it supports.</p><p className="font-serif text-xl text-teams-ink">Every Building Has a Story. Every Person Matters.</p></div></div></section>
    <section className="bg-white py-16 sm:py-20"><div className="mx-auto max-w-5xl px-4 sm:px-6"><div className="grid gap-5 md:grid-cols-[1fr_1fr] md:items-end md:gap-12"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">People · Trust · Relationships · Community</p><h2 className="font-serif text-3xl text-teams-ink sm:text-4xl">Care you can see in the details.</h2></div><p className="max-w-md text-lg leading-relaxed text-slate-700">We believe good property management begins with respect and trust, then shows itself in the everyday details that matter to people.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{commitments.map((item, index) => <article key={item.title} className="border border-slate-200 bg-slate-50 p-6 sm:p-7"><span className="font-serif text-3xl text-teams-secondary" aria-hidden="true">0{index + 1}</span><div className="my-5 h-0.5 w-10 bg-teams-gold" /><h3 className="mb-3 font-serif text-2xl text-teams-ink">{item.title}</h3><p className="leading-relaxed text-slate-700">{item.body}</p></article>)}</div></div></section>
    <section className="bg-slate-50 py-14"><div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-2 md:items-center"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Our New York portfolio</p><h2 className="mb-4 font-serif text-3xl text-teams-ink sm:text-4xl">Every address has a story.</h2><p className="leading-relaxed text-slate-700">Explore our properties across Flushing, the Bronx, and Manhattan. Each has its own character, setting, and role in the city.</p></div><div className="md:text-right"><Link prefetch={false} href="/properties" className="inline-flex min-h-11 items-center bg-teams-gold px-6 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-ink">Explore properties <span className="ml-2" aria-hidden="true">↗</span></Link></div></div></section>
    <section className="bg-white py-14"><div className="mx-auto max-w-5xl px-4 sm:px-6"><h2 className="mb-3 font-serif text-3xl text-teams-ink">Let’s talk about what you need.</h2><p className="mb-7 max-w-2xl text-slate-700">Looking for a property, have a question, or need to reach our team? Start the conversation here.</p><ContactDetails /></div></section>
    <PageShowcase page="about" variant="offset"/>
  </main><Footer /></>;
}
