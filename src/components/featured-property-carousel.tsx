'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Image = { src: string; alt: string };

export function FeaturedPropertyCarousel({ images, name, href }: { images: Image[]; name: string; href: string }) {
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
  useEffect(() => {
    if (images.length < 2 || hovered || focused || paused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % images.length), 4000);
    return () => window.clearInterval(timer);
  }, [images.length, hovered, focused, paused, reducedMotion]);

  const current = images[index % images.length];
  const move = (delta: number) => setIndex(value => (value + delta + images.length) % images.length);
  return <div className="relative lg:col-span-8" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <Link href={href} className="home-image-link block aspect-[4/3] overflow-hidden bg-stone-200 sm:aspect-[16/10]" aria-label={`View ${name}`}>
      <img key={current.src} src={current.src} alt={current.alt} loading="lazy" className="home-photo h-full w-full object-cover" />
    </Link>
    {images.length > 1 && <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 pointer-events-none">
      <button type="button" onClick={() => move(-1)} aria-label={`Previous photo of ${name}`} className="pointer-events-auto min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">‹</button>
      <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white" aria-live="off">{index + 1} / {images.length}</span>
      <button type="button" onClick={() => move(1)} aria-label={`Next photo of ${name}`} className="pointer-events-auto min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">›</button>
    </div>}
    {images.length > 1 && !reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} className="mt-2 min-h-11 text-sm font-medium text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">{paused ? 'Play slideshow' : 'Pause slideshow'}</button>}
  </div>;
}
