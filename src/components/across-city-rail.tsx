'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type CityCard = { slug: string; name: string; location: string; src: string; alt: string };

export function AcrossCityRail({ items }: { items: CityCard[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const show = useCallback((next: number, smooth = true) => {
    const target = (next + items.length) % items.length;
    const container = rail.current;
    const card = container?.children[target] as HTMLElement | undefined;
    if (container && card) {
      container.scrollTo({ left: card.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft, behavior: smooth && !reducedMotion ? 'smooth' : 'instant' });
    }
    setIndex(target);
  }, [items.length, reducedMotion]);

  useEffect(() => {
    if (items.length < 2 || hovered || focused || paused || reducedMotion) return;
    const timer = window.setInterval(() => show(index + 1), 6000);
    return () => window.clearInterval(timer);
  }, [items.length, hovered, focused, paused, reducedMotion, index, show]);

  return <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div ref={rail} className="home-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 sm:gap-6" aria-label="Across the city properties" onTouchStart={() => setPaused(true)}>
      {items.map(item => <Link key={item.slug} href={`/properties/${item.slug}`} className="home-image-link group min-w-[78vw] snap-start overflow-hidden bg-white sm:min-w-[42%] lg:min-w-[30%]"><div className="aspect-[4/3] overflow-hidden"><img src={item.src} alt={item.alt} loading="lazy" className="home-photo h-full w-full object-cover" /></div><div className="flex items-center justify-between gap-3 p-5"><div><h3 className="font-serif text-xl font-normal">{item.name}</h3><p className="mb-0 text-xs text-teams-secondary">{item.location}</p></div><span aria-hidden="true">↗</span></div></Link>)}
    </div>
    {items.length > 1 && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-teams-ink"><button type="button" onClick={() => show(index - 1)} aria-label="Previous property" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">‹</button><span aria-live="polite">{index + 1} / {items.length}</span><button type="button" onClick={() => show(index + 1)} aria-label="Next property" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">›</button>{!reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} className="min-h-11 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{paused ? 'Play rotation' : 'Pause rotation'}</button>}</div>}
  </div>;
}
