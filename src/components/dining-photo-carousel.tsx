'use client';

import { useEffect, useState } from 'react';

type Photo = { src: string; alt: string; caption: string | null };

export function DiningPhotoCarousel({ name, photos }: { name: string; photos: Photo[] }) {
  const [index,setIndex] = useState(0);
  const [paused,setPaused] = useState(false);
  const [reducedMotion,setReducedMotion] = useState(true);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener('change',update);
    return () => media.removeEventListener('change',update);
  },[]);
  useEffect(() => {
    if (photos.length < 2 || paused || reducedMotion || hovered || focused) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % photos.length),4000);
    return () => window.clearInterval(timer);
  },[photos.length,paused,reducedMotion,hovered,focused]);
  const photo = photos[index % photos.length];
  if (!photo) return <div className="flex min-h-72 items-center justify-center p-10 text-center font-serif text-3xl text-teams-ink lg:min-h-[540px]">A place to gather.</div>;
  return <div className="relative h-full min-h-72 lg:min-h-[540px]" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <img key={photo.src} src={photo.src} alt={photo.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
    {photo.caption && <p className="absolute right-3 top-3 rounded-sm bg-teams-charcoal/80 px-3 py-1 text-xs text-white">{photo.caption}</p>}
    {photos.length > 1 && <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
      <button type="button" onClick={() => setIndex(value => (value - 1 + photos.length) % photos.length)} aria-label={`Previous photo of ${name}`} className="min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teams-gold">‹</button>
      <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white" aria-live="off">{index + 1} / {photos.length}</span>
      <button type="button" onClick={() => setIndex(value => (value + 1) % photos.length)} aria-label={`Next photo of ${name}`} className="min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teams-gold">›</button>
    </div>}
    {photos.length > 1 && !reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded bg-white/95 px-3 py-2 text-sm font-semibold text-teams-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teams-gold">{paused ? 'Play photos' : 'Pause photos'}</button>}
  </div>;
}
