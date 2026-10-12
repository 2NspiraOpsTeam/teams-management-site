'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PropertyLocationPanel } from './PropertyLocationPanel';

const center: [number, number] = [-74.005146181808, 40.709506004338];
const styleUrl = 'https://tiles.openfreemap.org/styles/liberty';

export function GoldStreetMapLibre() {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let motionTimer: ReturnType<typeof setTimeout>;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fail = () => { if (!cancelled) { mapRef.current?.remove(); mapRef.current = null; setState('fallback'); } };
    const onMotionChange = () => { if (reduced.matches) { mapRef.current?.stop(); setMoving(false); if (mapRef.current) mapRef.current.jumpTo({ center, zoom: 16.6, pitch: 65, bearing: -28 }); } };
    reduced.addEventListener('change', onMotionChange);

    void (async () => {
      try {
        const [maplibregl, response] = await Promise.all([import('maplibre-gl'), fetch(styleUrl)]);
        if (!response.ok) throw new Error('Style unavailable');
        const style = await response.json() as any;
        const probe = document.createElement('canvas');
        if (cancelled || !host.current || !(probe.getContext('webgl2') || probe.getContext('webgl'))) { fail(); return; }

        // OpenFreeMap's Liberty style supplies the OSM-derived building layer and heights.
        // Restyle its context; preserve its source attribution and tile endpoints.
        for (const layer of style.layers) {
          if (layer.id === 'background') layer.paint = { ...layer.paint, 'background-color': '#f3efe8' };
          if (layer.id === 'building') layer.paint = { ...layer.paint, 'fill-color': '#b5b7b4', 'fill-outline-color': '#898e8c' };
          if (layer.id === 'building-3d') layer.paint = { ...layer.paint, 'fill-extrusion-color': '#a9adae', 'fill-extrusion-opacity': 0.88, 'fill-extrusion-height': ['get', 'render_height'], 'fill-extrusion-base': ['get', 'render_min_height'] };
          if (layer.id.includes('road') && layer.type === 'line' && layer.paint?.['line-color']) layer.paint['line-color'] = '#d2c9bb';
        }
        const map = new maplibregl.Map({ container: host.current, style, center: reduced.matches ? center : [-74.014, 40.714], zoom: reduced.matches ? 16.6 : 13.5, pitch: reduced.matches ? 65 : 30, bearing: -28, attributionControl: false, dragRotate: true, pitchWithRotate: true });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.on('error', () => { if (!map.isStyleLoaded()) fail(); });
        const interrupt = () => { map.stop(); clearTimeout(motionTimer); setMoving(false); };
        map.on('mousedown', interrupt); map.on('touchstart', interrupt);
        timer = setTimeout(fail, 20000);
        map.once('load', () => {
          clearTimeout(timer);
          if (cancelled) return;
          // Gold treatment marks the verified property coordinate; it does not claim an
          // unverified OSM footprint is exactly the property's building.
          map.addSource('teams-property', { type: 'geojson', data: { type: 'Feature', properties: { name: '61 Gold St' }, geometry: { type: 'Point', coordinates: center } } });
          map.addLayer({ id: 'teams-property-halo', type: 'circle', source: 'teams-property', paint: { 'circle-radius': 17, 'circle-color': '#f3b927', 'circle-opacity': 0.3, 'circle-stroke-color': '#c89513', 'circle-stroke-width': 2 } });
          map.addLayer({ id: 'teams-property-marker', type: 'circle', source: 'teams-property', paint: { 'circle-radius': 7, 'circle-color': '#f8c636', 'circle-stroke-color': '#463509', 'circle-stroke-width': 2 } });
          map.addLayer({ id: 'teams-property-label', type: 'symbol', source: 'teams-property', layout: { 'text-field': '61 Gold St · Teams', 'text-font': ['Noto Sans Regular'], 'text-size': 15, 'text-offset': [0, -2.3], 'text-anchor': 'bottom' }, paint: { 'text-color': '#302a1c', 'text-halo-color': '#fffaf0', 'text-halo-width': 2 } });
          setState('ready');
          if (reduced.matches) return;
          setMoving(true);
          map.easeTo({ center, zoom: 16.6, pitch: 65, bearing: -28, duration: 6000, essential: false });
          motionTimer = setTimeout(() => {
            if (cancelled || reduced.matches) return;
            map.easeTo({ bearing: 28, duration: 4200, essential: false });
            motionTimer = setTimeout(() => setMoving(false), 4200);
          }, 6200);
        });
      } catch { fail(); }
    })();
    return () => { cancelled = true; clearTimeout(timer); clearTimeout(motionTimer); reduced.removeEventListener('change', onMotionChange); mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return <section aria-label="61 Gold Street open 3D property-location prototype"><div className="relative h-[420px] overflow-hidden rounded-lg border border-stone-300 bg-stone-100 sm:h-[600px]"><div ref={host} className={state === 'fallback' ? 'hidden' : 'h-full w-full'} aria-label="Interactive 3D neighborhood map" />{state === 'fallback' && <PropertyLocationPanel name="61 Gold St" latitude={center[1]} longitude={center[0]} showPin />}{state === 'loading' && <div role="status" className="pointer-events-none absolute inset-x-4 top-4 rounded bg-white/95 p-3 text-sm text-teams-ink shadow">Loading the 3D neighborhood view…</div>}<div className="pointer-events-none absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded bg-white/95 px-4 py-3 text-teams-ink shadow-lg"><strong className="block">61 Gold St</strong><span className="text-sm">Financial District · New York, NY 10038</span></div>{moving && <button type="button" className="absolute left-4 top-4 min-h-11 rounded bg-white px-4 py-2 font-semibold shadow" onClick={() => { mapRef.current?.stop(); setMoving(false); }}>Skip animation</button>}</div><p className="mt-2 text-sm text-slate-600" role="status">{state === 'fallback' ? '3D view unavailable; showing an interactive standard map.' : 'Drag to rotate and tilt; scroll or pinch to zoom. Building shapes and heights are approximate OpenStreetMap-derived data.'}</p></section>;
}
