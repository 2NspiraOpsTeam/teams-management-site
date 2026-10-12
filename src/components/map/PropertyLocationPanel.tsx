'use client';

import { useEffect, useState } from 'react';

type Props = { name: string; latitude: number; longitude: number; showPin: boolean; fullHeight?: boolean };
type MapComponent = typeof import('./PropertyLocationMap').default;

export function PropertyLocationPanel(props: Props) {
  const [Map, setMap] = useState<MapComponent | null>(null);
  useEffect(() => {
    let mounted = true;
    void import('./PropertyLocationMap').then(module => { if (mounted) setMap(() => module.default); });
    return () => { mounted = false; };
  }, []);
  return Map ? <Map {...props} /> : <div className={props.fullHeight ? 'h-full w-full animate-pulse bg-stone-100' : 'h-[380px] w-full animate-pulse bg-stone-100 sm:h-[460px]'} role="status" aria-label="Loading location map" />;
}
