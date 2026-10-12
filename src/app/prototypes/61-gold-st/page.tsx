import { getRequestContext } from '@cloudflare/next-on-pages';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GoldStreet3D } from '@/components/map/GoldStreet3D';

export const runtime = 'edge';
export const metadata = { title: '61 Gold St | 3D Location Prototype', robots: { index: false, follow: false } };

export default function GoldStreetPrototype() {
  const apiKey = (getRequestContext().env as { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string }).NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return <><Header /><main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-xs font-semibold uppercase tracking-widest text-teams-secondary">Property-location prototype</p><h1 className="mt-3 font-serif text-4xl text-teams-ink">Explore 61 Gold St</h1><p className="mb-7 mt-3 text-slate-600">A bird’s-eye view of the Financial District and the property’s neighborhood.</p><GoldStreet3D apiKey={apiKey} /><div className="mt-6 flex flex-wrap gap-3"><a className="inline-flex min-h-11 items-center rounded bg-teams-gold px-5 font-semibold text-teams-ink" href="https://www.google.com/maps/search/?api=1&query=61%20Gold%20St%2C%20New%20York%2C%20NY%2010038" target="_blank" rel="noopener noreferrer">Map &amp; Directions ↗</a><a className="inline-flex min-h-11 items-center rounded border border-stone-300 px-5 font-semibold text-teams-ink" href="https://www.google.com/maps/dir/?api=1&destination=61%20Gold%20St%2C%20New%20York%2C%20NY%2010038" target="_blank" rel="noopener noreferrer">Get directions ↗</a></div></main><Footer /></>;
}
