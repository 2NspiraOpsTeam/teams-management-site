'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import geometry from '@/data/61-gold-st-official-geometry.json';
import { PropertyLocationPanel } from './PropertyLocationPanel';

const propertyCoordinate: [number, number] = [-74.005146181808, 40.709506004338];
const viewCenter: [number, number] = [-74.00518, 40.70963];
const photo = 'https://maps.nyc.gov/xyz/1.0.0/photo/2018/{z}/{x}/{y}.png8';
const labels = 'https://maps.nyc.gov/xyz/1.0.0/carto/label-lt/{z}/{x}/{y}.png8';

export function GoldStreetAerial({ name = '61 Gold St', latitude = propertyCoordinate[1], longitude = propertyCoordinate[0], showFootprint = true }: { name?: string; latitude?: number; longitude?: number; showFootprint?: boolean }) {
  const point: [number, number] = [longitude, latitude];
  const center: [number, number] = showFootprint ? viewCenter : point;
  const start: [number, number] = [center[0] - 0.009, center[1] + 0.004];
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const motionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [state, setState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fail = () => { if (!cancelled) { mapRef.current?.remove(); mapRef.current = null; setState('fallback'); } };
    const onMotionChange = () => { if (reduced.matches) { mapRef.current?.stop(); clearTimeout(motionTimerRef.current); setMoving(false); mapRef.current?.jumpTo({ center, zoom: 18.2, pitch: 25, bearing: -25 }); } };
    reduced.addEventListener('change', onMotionChange);

    void (async () => {
      try {
        const maplibregl = await import('maplibre-gl');
        maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
        const probe = document.createElement('canvas');
        if (cancelled || !host.current || !(probe.getContext('webgl2') || probe.getContext('webgl'))) { fail(); return; }
        const map = new maplibregl.Map({
          container: host.current,
          style: {
            version: 8,
            glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
            sources: {
              aerial: { type: 'raster', tiles: [photo], tileSize: 256, minzoom: 0, maxzoom: 20, attribution: '© City of New York · 2018 aerial imagery · CC BY 4.0' },
              streets: { type: 'raster', tiles: [labels], tileSize: 256, minzoom: 0, maxzoom: 20, attribution: '© City of New York' },
            },
            layers: [{ id: 'aerial', type: 'raster', source: 'aerial' }, { id: 'streets', type: 'raster', source: 'streets' }],
          },
          center: reduced.matches ? center : start,
          zoom: reduced.matches ? 18.2 : 13.5,
          pitch: reduced.matches ? 25 : 0,
          bearing: reduced.matches ? -25 : 0,
          attributionControl: false,
          dragRotate: true,
          pitchWithRotate: true,
          maxPitch: 45,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.on('error', () => { if (!map.isStyleLoaded()) fail(); });
        const interrupt = () => { map.stop(); clearTimeout(motionTimerRef.current); setMoving(false); };
        map.on('mousedown', interrupt); map.on('touchstart', interrupt);
        timer = setTimeout(fail, 20000);
        map.once('load', () => {
          clearTimeout(timer);
          if (cancelled) return;
          if (showFootprint) {
            map.addSource('official-footprint', { type: 'geojson', data: { type: 'Feature', properties: { bin: geometry.bin }, geometry: geometry.geometry as GeoJSON.Geometry } });
            map.addLayer({ id: 'official-footprint-outline', type: 'line', source: 'official-footprint', paint: { 'line-color': '#f7d47a', 'line-width': 2.5, 'line-opacity': 0.8 } });
          }
          map.addSource('property-coordinate', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: point } } });
          map.addLayer({ id: 'property-halo', type: 'circle', source: 'property-coordinate', paint: { 'circle-radius': 17, 'circle-color': '#f3b927', 'circle-opacity': 0.25 } });
          map.addLayer({ id: 'property-marker', type: 'circle', source: 'property-coordinate', paint: { 'circle-radius': 6, 'circle-color': '#f8c636', 'circle-stroke-color': '#30270a', 'circle-stroke-width': 2 } });
          map.addLayer({ id: 'property-label', type: 'symbol', source: 'property-coordinate', layout: { 'text-field': `${name} · Teams`, 'text-font': ['Noto Sans Regular'], 'text-size': 15, 'text-offset': [0, -1.6], 'text-anchor': 'bottom' }, paint: { 'text-color': '#fff', 'text-halo-color': '#171717', 'text-halo-width': 2.5 } });
          setState('ready');
          if (reduced.matches) return;
          setMoving(true);
          map.easeTo({ center, zoom: 18.2, pitch: 25, bearing: -25, duration: 6000, essential: false });
          motionTimerRef.current = setTimeout(() => {
            if (cancelled || reduced.matches) return;
            map.easeTo({ bearing: 14, duration: 3500, essential: false });
            motionTimerRef.current = setTimeout(() => setMoving(false), 3500);
          }, 6200);
        });
      } catch (error) { console.error('Aerial map initialization failed', error); fail(); }
    })();
    return () => { cancelled = true; clearTimeout(timer); clearTimeout(motionTimerRef.current); reduced.removeEventListener('change', onMotionChange); mapRef.current?.remove(); mapRef.current = null; };
  }, [name, latitude, longitude, showFootprint]);

  return <section aria-label={`${name} aerial location`}><div className="relative h-[480px] overflow-hidden rounded-lg border border-stone-300 bg-stone-100 sm:h-[650px] lg:h-[740px]"><div ref={host} className={state === 'fallback' ? 'hidden' : 'h-full w-full'} aria-label="Interactive aerial neighborhood map" />{state === 'fallback' && <PropertyLocationPanel name={name} latitude={latitude} longitude={longitude} showPin fullHeight />}{state === 'loading' && <div role="status" className="pointer-events-none absolute inset-x-4 top-4 rounded bg-white/95 p-3 text-sm text-teams-ink shadow">Loading aerial imagery…</div>}<div className="pointer-events-none absolute bottom-16 left-4 max-w-[calc(100%-2rem)] rounded bg-white/95 px-4 py-3 text-teams-ink shadow-lg sm:bottom-4"><strong className="block">{name}</strong><span className="text-sm">NYC aerial imagery · captured 2018</span></div>{moving && <button type="button" className="absolute left-4 top-4 min-h-11 rounded bg-white px-4 py-2 font-semibold shadow" onClick={() => { mapRef.current?.stop(); clearTimeout(motionTimerRef.current); setMoving(false); }}>Skip animation</button>}</div><p className="mt-2 text-sm text-slate-600" role="status">{state === 'fallback' ? 'Aerial view unavailable; showing an interactive standard map.' : state === 'loading' ? 'Loading aerial imagery…' : showFootprint ? 'Drag to pan or rotate; scroll or pinch to zoom. Gold point is the supplied location; the thin outline is the official NYC footprint.' : 'Drag to pan or rotate; scroll or pinch to zoom. Gold point marks the verified property location.'}</p></section>;
}
