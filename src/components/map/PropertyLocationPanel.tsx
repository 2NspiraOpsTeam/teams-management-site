'use client';

import { useEffect, useState } from 'react';
import {useMapVisibility} from './use-map-visibility';

type Props = { name: string; latitude: number; longitude: number; showPin: boolean; mapQuery?: string; fullHeight?: boolean };
type MapComponent = typeof import('./PropertyLocationMap').default;

export function PropertyLocationPanel(props: Props) {
  const visibility = useMapVisibility<HTMLDivElement>();
  const [Map, setMap] = useState<MapComponent | null>(null);
  useEffect(() => {
    if (!visibility.visible) return;
    let mounted = true;
    void import('./PropertyLocationMap').then(module => { if (mounted) setMap(() => module.default); });
    return () => { mounted = false; };
  }, [visibility.visible]);
  return <div ref={visibility.ref} className={props.fullHeight ? 'h-full w-full' : undefined}>{Map ? <Map {...props} /> : <div className={props.fullHeight ? 'h-full w-full animate-pulse bg-stone-100' : 'h-[380px] w-full animate-pulse bg-stone-100 sm:h-[460px]'} role="status" aria-label="Loading location map" />}</div>;
}
