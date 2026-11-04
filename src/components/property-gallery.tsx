'use client';

import {highResolutionPhoto} from '@/lib/photo-delivery';
import { useEffect, useState } from 'react';
import {useGalleryActivity} from './gallery-activity';
import {RetainedGalleryPhoto} from './retained-gallery-photo';

export interface GalleryImage { src: string; alt: string; caption?: string | null }

export function PropertyGallery({ images, name, compact = false, hero = false, href, address, preventUpscale = false }: { images: GalleryImage[]; name: string; compact?: boolean; hero?: boolean; href?: string; address?: string; preventUpscale?: boolean }) {
  const activity=useGalleryActivity();
  const [index, setIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [readyPhotos, setReadyPhotos] = useState<Set<string>>(() => new Set());
  const [failedPhotos, setFailedPhotos] = useState<Set<string>>(() => new Set());
  const [retries, setRetries] = useState<Record<string,number>>({});
  const [slowSrc, setSlowSrc] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [motionOptIn, setMotionOptIn] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!activity.active || images.length < 2 || !readyPhotos.has(images[index % images.length]?.src) || paused || manuallyPaused || (reducedMotion && !motionOptIn)) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % images.length), 8000);
    return () => window.clearInterval(timer);
  }, [activity.active, images.length, index, readyPhotos, paused, manuallyPaused, reducedMotion, motionOptIn]);

  const selectedIndex = index % Math.max(images.length, 1);
  const displayed = displayedIndex % Math.max(images.length, 1);
  const requestedSrc = images[selectedIndex]?.src;
  const requestedReady = !!requestedSrc && readyPhotos.has(requestedSrc);
  const retryAttempt = requestedSrc ? retries[requestedSrc] || 0 : 0;
  useEffect(() => {
    setSlowSrc(null);
    if (!requestedSrc || requestedReady) return;
    const timer = window.setTimeout(() => setSlowSrc(requestedSrc), 10000);
    return () => window.clearTimeout(timer);
  }, [requestedSrc, requestedReady, retryAttempt]);
  useEffect(() => {
    if (requestedSrc && readyPhotos.has(requestedSrc)) setDisplayedIndex(selectedIndex);
  }, [requestedSrc, selectedIndex, readyPhotos]);

  const imageAspect = hero ? 'aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/9]' : compact ? 'aspect-[4/3]' : 'aspect-[16/9]';

  if (!images.length) return <div className={`${imageAspect} bg-teams-charcoal border border-slate-200 flex flex-col items-center justify-center px-6 text-center`}><span className="mb-4 font-serif text-4xl text-teams-gold" aria-hidden="true">TM</span><span className="text-xs uppercase tracking-[0.14em] text-white">Property image unavailable</span></div>;

  const current = images[displayed];
  const photo = <div ref={activity.ref}>{images.map((item,photoIndex)=><RetainedGalleryPhoto key={`${item.src}-${photoIndex}`} active={photoIndex===displayed} preload={(photoIndex===selectedIndex && selectedIndex!==displayed) || (activity.active && readyPhotos.has(current.src) && photoIndex===(selectedIndex+1)%images.length)} retry={retries[item.src]||0} src={item.src} sizes={hero?'100vw':compact?'(max-width: 767px) 100vw, 33vw':'(max-width: 767px) 100vw, 80vw'} alt={item.alt} loading={hero ? 'eager' : 'lazy'} decoding="async" fetchPriority={photoIndex===selectedIndex ? (hero ? 'high' : undefined) : 'low'} onReady={() => {setReadyPhotos(value => value.has(item.src) ? value : new Set([...value,item.src]));setLoadedSrc(item.src);}} onFailure={() => {setFailedPhotos(value=>value.has(item.src)?value:new Set([...value,item.src]));}} className={`property-image w-full ${imageAspect} ${preventUpscale ? 'object-scale-down bg-teams-charcoal' : 'object-cover'}`} />)}</div>;
  const move = (delta: number) => {setIndex(value => (value + delta + images.length) % images.length);};
  return <figure className="min-w-0" onMouseEnter={() => { if (!hero) setPaused(true); }} onMouseLeave={() => { if (!hero) setPaused(false); }} onFocusCapture={event => setPaused(!hero || event.target.matches(':focus-visible'))} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className={`relative overflow-hidden ${hero ? "" : "border border-slate-200"} bg-slate-100`}>
      {href ? <a href={href} aria-label={`View Residential Property: ${name}`} className="block focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-teams-gold">{photo}</a> : photo}
      {requestedSrc && !readyPhotos.has(requestedSrc) && <div role="status" className="absolute left-3 right-3 bottom-16 rounded bg-teams-charcoal/90 px-3 py-2 text-sm text-white">{failedPhotos.has(requestedSrc) || slowSrc===requestedSrc ? <><span>{failedPhotos.has(requestedSrc) ? 'Photo unavailable.' : 'Photo is taking longer than expected.'} {readyPhotos.has(current.src) ? 'Showing the previous photo.' : ''}</span><button type="button" className="ml-3 min-h-11 underline" onClick={() => {setSlowSrc(null);setFailedPhotos(value=>{const next=new Set(value);next.delete(requestedSrc);return next;});setRetries(value=>({...value,[requestedSrc]:(value[requestedSrc]||0)+1}));}}>Retry photo</button></> : `Loading photo ${selectedIndex+1}…`}</div>}
      {hero && address && <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent px-4 pb-20 pt-6 text-white sm:px-8 sm:pt-10 lg:px-12">
        <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{name}</h1>
        <address className="mt-3 not-italic text-sm font-medium leading-relaxed sm:text-lg">{address}</address>
      </div>}
      {images.length > 1 && <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
        <button type="button" onClick={() => move(-1)} aria-label={`Previous photo of ${name}`} className="min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">‹</button>
        <span className="rounded-full bg-teams-charcoal/90 px-3 py-1 text-xs font-semibold text-white"><span className="sr-only">Photo </span>{displayed + 1}<span aria-hidden="true"> / </span><span className="sr-only"> of </span>{images.length}</span>
        <button type="button" onClick={() => move(1)} aria-label={`Next photo of ${name}`} className="min-h-11 min-w-11 rounded-full bg-white/95 text-2xl text-teams-ink shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold">›</button>
      </div>}
    </div>
    {!compact && images.length > 1 && <div role="group" className={`mt-3 flex h-[72px] max-w-full gap-2 overflow-x-auto pb-2 ${hero ? "px-4 sm:px-8 lg:px-12" : ""}`} aria-label={`${name} photo thumbnails`}>
      {loadedSrc && images.map((photo, photoIndex) => ({photo, photoIndex})).map(({photo, photoIndex}) => <button hidden={Math.abs(photoIndex-index % images.length)>2} key={`${photo.src}-${photoIndex}`} type="button" onClick={() => {setIndex(photoIndex);}} aria-label={`Show photo ${photoIndex + 1} of ${images.length}: ${photo.alt}`} aria-current={photoIndex === displayed ? 'true' : undefined} className={`h-16 w-20 shrink-0 overflow-hidden rounded-sm border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold ${photoIndex === index % images.length ? 'border-teams-gold' : 'border-transparent hover:border-slate-400'}`}><RetainedGalleryPhoto active={Math.abs(photoIndex-index % images.length)<=2} src={photo.src} sizes="80px" alt="" loading="lazy" className="h-full w-full object-cover" /></button>)}
    </div>}
    {images.length > 1 && <button type="button" onClick={() => { if (reducedMotion && !motionOptIn) { setMotionOptIn(true); setManuallyPaused(false); } else setManuallyPaused(value => !value); }} className={`${hero ? "mx-4 sm:mx-8 lg:mx-12" : ""} mt-2 min-h-11 text-sm font-medium text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold`}>{manuallyPaused || (reducedMotion && !motionOptIn) ? 'Play slideshow' : 'Pause slideshow'}</button>}
    {!compact && <a href={highResolutionPhoto(current.src,10000)} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size photo of ${name}`} className={`${hero ? "mx-4 sm:mx-8 lg:mx-12" : ""} mt-3 inline-flex min-h-11 items-center text-sm font-medium text-teams-ink underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teams-gold`}>Open full-size photo ↗</a>}
    {!compact && current.caption && <figcaption className={`mt-3 text-sm text-slate-600 ${hero ? "px-4 sm:px-8 lg:px-12" : ""}`}>{current.caption}</figcaption>}
  </figure>;
}
