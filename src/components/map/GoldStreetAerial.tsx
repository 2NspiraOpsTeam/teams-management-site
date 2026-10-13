'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

export function GoldStreetAerial({ name = '61 Gold St', latitude = 40.709506004338, longitude = -74.005146181808 }: { name?: string; latitude?: number; longitude?: number; showFootprint?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const [view, setView] = useState<'aerial' | 'streets'>('aerial');
  const [moving, setMoving] = useState(false);
  const [imageryFailed, setImageryFailed] = useState(false);
  const aerialRef = useRef<Leaflet.TileLayer | null>(null);
  const labelsRef = useRef<Leaflet.TileLayer | null>(null);

  useEffect(() => {
    if (!host.current) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('leaflet').then(({ default: L }) => {
    if (disposed || !host.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const destination: Leaflet.LatLngExpression = [latitude, longitude];
    const map = L.map(host.current, { scrollWheelZoom: false, zoomControl: false, preferCanvas: true });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Streets &copy; Esri and its data providers',
    }).addTo(map);
    const aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Imagery &copy; Esri and its data providers',
    }).addTo(map);
    const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Labels &copy; Esri and its data providers',
    }).addTo(map);
    aerialRef.current = aerial;
    labelsRef.current = labels;
    aerial.on('tileerror', () => { setImageryFailed(true); map.removeLayer(aerial); map.removeLayer(labels); });
    L.circleMarker(destination, { radius: 9, color: '#2D3032', weight: 2, fillColor: '#D4A62A', fillOpacity: 1 })
      .addTo(map).bindPopup(name);
    const stop = () => { map.stop(); setMoving(false); };
    map.on('mousedown touchstart', stop);
    const onReduce = () => { if (reduced.matches) { stop(); map.setView(destination, 18); } };
    reduced.addEventListener('change', onReduce);
    if (reduced.matches) map.setView(destination, 18);
    else {
      map.setView([latitude + 0.004, longitude - 0.009], 14);
      setMoving(true);
      const timer = window.setTimeout(() => map.flyTo(destination, 18, { duration: 5 }), 500);
      map.once('moveend', () => setMoving(false));
      cleanup = () => { window.clearTimeout(timer); reduced.removeEventListener('change', onReduce); map.remove(); mapRef.current = null; };
      return;
    }
    cleanup = () => { reduced.removeEventListener('change', onReduce); map.remove(); mapRef.current = null; };
    });
    return () => { disposed = true; cleanup?.(); };
  }, [latitude, longitude, name]);

  useEffect(() => {
    const map = mapRef.current;
    const aerial = aerialRef.current;
    const labels = labelsRef.current;
    if (!map || !aerial || !labels) return;
    if (view === 'aerial' && !imageryFailed) { aerial.addTo(map); labels.addTo(map); }
    else { map.removeLayer(aerial); map.removeLayer(labels); }
  }, [view, imageryFailed]);

  return <section aria-label={`${name} aerial location`}>
    <div className="relative h-[480px] overflow-hidden rounded-lg border border-stone-300 bg-stone-100 sm:h-[650px] lg:h-[740px]">
      <div ref={host} className="h-full w-full" role="region" aria-label={`Interactive map of ${name}`} />
      <div className="absolute left-3 top-3 z-[1000] flex rounded-sm bg-white p-1 shadow-lg" role="group" aria-label="Map view">
        <button type="button" onClick={() => setView('aerial')} disabled={imageryFailed} aria-pressed={view === 'aerial' && !imageryFailed} className="min-h-11 px-3 text-sm font-semibold disabled:opacity-50">Aerial</button>
        <button type="button" onClick={() => setView('streets')} aria-pressed={view === 'streets' || imageryFailed} className="min-h-11 px-3 text-sm font-semibold">Streets</button>
      </div>
      {moving && <button type="button" onClick={() => { mapRef.current?.stop(); setMoving(false); }} className="absolute right-3 top-3 z-[1000] min-h-11 rounded-sm bg-white px-3 text-sm font-semibold shadow">Skip animation</button>}
      <p className="pointer-events-none absolute bottom-7 left-3 z-[1000] rounded-sm bg-white/95 px-2 py-1 text-xs text-teams-ink shadow">{imageryFailed || view === 'streets' ? 'Street map · Esri' : 'Aerial imagery · Esri'}</p>
    </div>
    <p className="mt-2 text-sm text-slate-600" role="status">{imageryFailed ? 'Aerial imagery is unavailable; showing the interactive street map.' : 'Aerial view of the surrounding area. The gold marker shows the verified property location; imagery is not live.'}</p>
  </section>;
}
