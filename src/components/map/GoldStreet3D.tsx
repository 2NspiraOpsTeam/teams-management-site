'use client';

import { useEffect, useRef, useState } from 'react';
import { PropertyLocationPanel } from './PropertyLocationPanel';

const property = { lat: 40.709506004338, lng: -74.005146181808, altitude: 40 };
type Camera = { center: typeof property; range: number; tilt: number; heading: number };
type Map3D = HTMLElement & {
  mode: string;
  flyCameraTo: (options: { endCamera: Camera; durationMillis: number }) => void;
  flyCameraAround: (options: { camera: Camera; durationMillis: number; repeatCount: number }) => void;
  stopCameraAnimation: () => void;
};
declare global { interface Window { google?: { maps?: { importLibrary: (name: string) => Promise<{ Map3DElement: new (options: Camera) => Map3D }> } } } }

const finalCamera: Camera = { center: property, range: 650, tilt: 67, heading: -35 };
const openingCamera: Camera = { center: { lat: 40.7127, lng: -74.0058, altitude: 100 }, range: 8500, tilt: 60, heading: -30 };

export function GoldStreet3D({ apiKey }: { apiKey?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>(apiKey ? 'loading' : 'fallback');
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    if (!apiKey || !host.current) return;
    let cancelled = false;
    let map: Map3D | undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onReduced = () => { if (reduced.matches) map?.stopCameraAnimation(); };
    reduced.addEventListener('change', onReduced);
    const fail = () => { if (!cancelled) setState('fallback'); };
    const timer = window.setTimeout(fail, 18000);
    const initialize = async () => {
      try {
        if (!window.google?.maps?.importLibrary) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Map script failed'));
            document.head.appendChild(script);
          });
        }
        const { Map3DElement } = await window.google!.maps!.importLibrary('maps3d');
        if (cancelled || !host.current) return;
        map = new Map3DElement(reduced.matches ? finalCamera : openingCamera);
        map.mode = 'SATELLITE';
        map.style.width = '100%';
        map.style.height = '100%';
        map.setAttribute('aria-label', 'Interactive 3D view near 61 Gold Street, New York');
        host.current.appendChild(map);
        map.addEventListener('pointerdown', () => { map?.stopCameraAnimation(); setMotion(false); });
        map.addEventListener('gmp-error', fail);
        map.addEventListener('gmp-steadychange', () => { window.clearTimeout(timer); if (!cancelled) setState('ready'); }, { once: true });
        if (!reduced.matches) {
          setMotion(true);
          map.addEventListener('gmp-animationend', () => {
            if (cancelled || reduced.matches) { setMotion(false); return; }
            map?.flyCameraAround({ camera: finalCamera, durationMillis: 9000, repeatCount: 0.55 });
            map?.addEventListener('gmp-animationend', () => setMotion(false), { once: true });
          }, { once: true });
          map.flyCameraTo({ endCamera: finalCamera, durationMillis: 6500 });
        }
      } catch { fail(); }
    };
    void initialize();
    return () => { cancelled = true; window.clearTimeout(timer); reduced.removeEventListener('change', onReduced); map?.stopCameraAnimation(); map?.remove(); };
  }, [apiKey]);

  return <section aria-label="61 Gold Street 3D property-location prototype">
    <div className="relative h-[420px] overflow-hidden rounded-lg border border-stone-300 bg-stone-100 sm:h-[600px]">
      {state !== 'fallback' && <div ref={host} className="h-full w-full" />}
      {state === 'fallback' && <PropertyLocationPanel name="61 Gold St" latitude={property.lat} longitude={property.lng} showPin />}
      {state === 'loading' && <div role="status" className="pointer-events-none absolute inset-x-4 top-4 rounded bg-white/95 p-3 text-sm text-teams-ink shadow">Loading the 3D neighborhood view…</div>}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 w-fit max-w-[calc(100%-2rem)] rounded bg-white/95 px-4 py-3 text-teams-ink shadow-lg">
        <strong className="block">61 Gold St</strong><span className="text-sm">Financial District · New York, NY 10038</span>
      </div>
      {motion && <button type="button" className="absolute right-4 top-4 min-h-11 rounded bg-white px-4 py-2 font-semibold shadow" onClick={() => { const element = host.current?.firstElementChild as Map3D | null; element?.stopCameraAnimation(); setMotion(false); }}>Skip animation</button>}
    </div>
    <p className="mt-2 text-sm text-slate-600" role="status">{state === 'fallback' ? '3D view unavailable; showing an interactive standard map.' : 'Drag to rotate and tilt; scroll or pinch to zoom. 3D imagery may differ from current conditions.'}</p>
  </section>;
}
