'use client';

import { useEffect, useState } from 'react';

export interface GalleryImage { src: string; alt: string; caption?: string | null }

export function PropertyGallery({ images, name, compact = false }: { images: GalleryImage[]; name: string; compact?: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (images.length < 2 || paused || manuallyPaused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % images.length), 6000);
    return () => window.clearInterval(timer);
  }, [images.length, paused, manuallyPaused, reducedMotion]);

  if (!images.length) return <div className={`${compact ? 'aspect-[4/3]' : 'aspect-[16/9]'} bg-teams-charcoal border border-slate-200 flex flex-col items-center justify-center px-6 text-center`} aria-label="Branded placeholder; no property photograph available"><span className="mb-4 font-serif text-4xl text-teams-gold" aria-hidden="true">TM</span><span className="text-xs uppercase tracking-[0.14em] text-white">Property image unavailable</span></div>;

  const current = images[index % images.length];
  const move = (delta: number) => setIndex(value => (value + delta + images.length) % images.length);
  return <figure className="min-w-0" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className="relative overflow-hidden border border-slate-200 bg-slate-100">
      <img src={current.src} alt={current.alt} className={`property-image w-full ${compact ? 'aspect-[4/3]' : 'aspect-[16/9]'} object-cover`} />
      {images.length > 1 && <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
        <button type="button" onClick={() => move(-1)} aria-label={`Previous photo of ${name}`} className="min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">‹</button>
        <span className="rounded-full bg-teams-charcoal/90 px-3 py-1 text-xs font-semibold text-white" aria-label={`Photo ${index + 1} of ${images.length}`}>{index + 1} / {images.length}</span>
        <button type="button" onClick={() => move(1)} aria-label={`Next photo of ${name}`} className="min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">›</button>
      </div>}
    </div>
    {images.length > 1 && !reducedMotion && <button type="button" onClick={() => setManuallyPaused(value => !value)} className="mt-2 min-h-11 text-sm font-medium text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">{manuallyPaused ? 'Play slideshow' : 'Pause slideshow'}</button>}
    {!compact && current.caption && <figcaption className="mt-3 text-sm text-slate-600">{current.caption}</figcaption>}
  </figure>;
}
