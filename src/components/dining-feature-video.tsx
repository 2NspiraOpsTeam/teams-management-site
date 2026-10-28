'use client';

import { useEffect, useRef } from 'react';

export function DiningFeatureVideo() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (motion.matches) video.current?.pause();
      else void video.current?.play().catch(() => {});
    };
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);

  return <video ref={video} className="absolute inset-0 h-full w-full object-cover" src="/dining/delizia-73-film.mp4" poster="/dining/delizia-73-film-poster.jpg" aria-label="Delizia 73 restaurant video" muted loop playsInline controls preload="metadata" />;
}
