import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function NotFound() {
  return <><Header /><main id="main-content" className="min-h-[65vh] bg-[#f7f4ee] px-5 py-20 sm:py-28"><div className="mx-auto max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-teams-secondary">Page not found</p><h1 className="mt-4 font-serif text-4xl text-teams-ink sm:text-5xl">Let’s help you find your way.</h1><p className="mt-6 max-w-xl text-teams-secondary">This page isn’t available. Explore our portfolio or contact the Teams Management team.</p><div className="mt-8 flex flex-wrap gap-4"><Link href="/properties" className="inline-flex min-h-11 items-center bg-teams-gold px-6 py-3 font-semibold text-teams-ink">Browse properties ↗</Link><Link href="/contact" className="inline-flex min-h-11 items-center border-b border-teams-ink font-semibold">Contact Teams ↗</Link></div></div></main><Footer /></>;
}
