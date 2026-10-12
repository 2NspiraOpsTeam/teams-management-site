import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GoldStreetMapLibre } from '@/components/map/GoldStreetMapLibre';

export const metadata = { title: '61 Gold St | Open 3D Location Prototype', robots: { index: false, follow: false } };

export default function Page() {
  return <><Header /><main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-xs font-semibold uppercase tracking-widest text-teams-secondary">Property-location prototype · Open map</p><h1 className="mt-3 font-serif text-4xl text-teams-ink">Explore 61 Gold St</h1><p className="mb-7 mt-3 text-slate-600">A bird’s-eye look at the Financial District and the property’s neighborhood.</p><GoldStreetMapLibre /><div className="mt-6 flex flex-wrap gap-3"><a className="inline-flex min-h-11 items-center rounded bg-teams-gold px-5 font-semibold text-teams-ink" href="https://www.openstreetmap.org/?mlat=40.709506&mlon=-74.005146#map=18/40.709506/-74.005146" target="_blank" rel="noopener noreferrer">Map ↗</a><a className="inline-flex min-h-11 items-center rounded border border-stone-300 px-5 font-semibold text-teams-ink" href="https://www.openstreetmap.org/directions?to=40.709506%2C-74.005146" target="_blank" rel="noopener noreferrer">Directions ↗</a></div></main><Footer /></>;
}
