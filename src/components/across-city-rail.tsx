'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type CityCard = { slug: string; name: string; location: string; href: string; src?: string; alt: string };

export function AcrossCityRail({ items }: { items: CityCard[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
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

  return <div>
    <div ref={rail} className="home-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 sm:gap-6" aria-label="Across the city properties">
      {items.map(item => <Link key={item.slug} href={item.href} className="home-image-link group w-[78vw] shrink-0 snap-start overflow-hidden bg-white sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-6rem)/5)]"><div className="aspect-[4/3] overflow-hidden">{item.src ? <img src={item.src} alt={item.alt} loading="lazy" className="home-photo h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[#ded8ca] p-4 text-center text-sm font-medium uppercase tracking-[.18em] text-teams-ink" role="img" aria-label={`No photo available for ${item.name}`}>Teams Management</div>}</div><div className="flex items-center justify-between gap-2 p-4"><div className="min-w-0"><h3 className="font-serif text-base font-normal leading-snug">{item.name}</h3><p className="mb-0 mt-1 text-xs text-teams-secondary">{item.location}</p></div><span aria-hidden="true">↗</span></div></Link>)}
    </div>
    {items.length > 1 && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-teams-ink"><button type="button" onClick={() => show(index - 1)} aria-label="Previous property" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">‹</button><span aria-live="polite">{index + 1} / {items.length}</span><button type="button" onClick={() => show(index + 1)} aria-label="Next property" className="min-h-11 min-w-11 rounded-full border border-teams-ink text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">›</button></div>}
  </div>;
}
