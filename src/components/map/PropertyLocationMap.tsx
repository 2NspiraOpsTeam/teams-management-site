'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function PropertyLocationMap({ name, latitude, longitude, showPin, fullHeight = false }: { name: string; latitude: number; longitude: number; showPin: boolean; fullHeight?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const point: L.LatLngExpression = [latitude, longitude];
    const map = L.map(container.current, { scrollWheelZoom: false }).setView(point, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    if (showPin) L.circleMarker(point, { radius: 9, color: '#2D3032', weight: 2, fillColor: '#D4A62A', fillOpacity: 1 }).addTo(map).bindTooltip(name);
    return () => { map.remove(); };
  }, [name, latitude, longitude, showPin]);
  return <div ref={container} className={fullHeight ? 'h-full w-full bg-stone-100' : 'h-[380px] w-full bg-stone-100 sm:h-[460px]'} role="region" aria-label={showPin ? `Interactive map of ${name}` : `Interactive street-area map near ${name}; no property pin shown`} />;
}
