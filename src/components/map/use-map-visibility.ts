'use client';

import {useEffect, useRef, useState} from 'react';

/** Keep below-fold map code, location requests and tiles off the critical path. */
export function useMapVisibility<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, {rootMargin: '400px'});
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return {ref, visible};
}
