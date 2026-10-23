'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Progressive enhancement: content is never hidden while waiting for JavaScript. */
export function PublicPageEffects() {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    main.classList.add('public-editorial');
    const header = document.querySelector('header.public-site-header');
    const updateHeader = () => header?.setAttribute('data-scrolled', String(window.scrollY > 24));
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    const stop = () => {
      observer?.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    if (!preference.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          // Only text moves. Photography, maps, videos and form controls stay steady.
          const animation = entry.target.animate(
            [{ opacity: .8, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
            { duration: 540, easing: 'cubic-bezier(.2,.7,.2,1)' },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }, { threshold: .1 });
      main.querySelectorAll('h1, h2, h3').forEach(heading => observer?.observe(heading));
    }
    preference.addEventListener('change', stop);
    return () => {
      stop();
      preference.removeEventListener('change', stop);
      main.classList.remove('public-editorial');
      window.removeEventListener('scroll', updateHeader);
      header?.removeAttribute('data-scrolled');
    };
  }, [pathname]);
  return null;
}
