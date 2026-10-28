'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mapTileFallback } from '@/lib/map-tile-fallback';

export default function PropertyLocationMap({ name, latitude, longitude, showPin, mapQuery, fullHeight = false }: { name: string; latitude: number; longitude: number; showPin: boolean; mapQuery?: string; fullHeight?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const isNyc = latitude > 40.4 && latitude < 41 && longitude > -74.3 && longitude < -73.6;
  useEffect(() => {
    if (!isNyc || !container.current) return;
    setTilesFailed(false);
    const map = L.map(container.current, { scrollWheelZoom: false }).setView([latitude, longitude], 16);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      errorTileUrl: mapTileFallback,
      attribution: 'Tiles &copy; Esri and its data providers',
    }).on('tileerror', () => setTilesFailed(true)).addTo(map);
    if (showPin) L.circleMarker([latitude, longitude], { radius: 9, color: '#2D3032', weight: 2, fillColor: '#D4A62A', fillOpacity: 1 }).addTo(map).bindPopup(name);
    return () => { map.remove(); };
  }, [isNyc, latitude, longitude, name, showPin]);

  const className = fullHeight ? 'h-full w-full border-0 bg-stone-100' : 'h-[380px] w-full border-0 bg-stone-100 sm:h-[460px]';
  if (isNyc) return <div className={fullHeight ? 'relative h-full' : undefined}><div ref={container} role="region" aria-label={showPin ? `Map location of ${name}` : `Street area near ${name}; exact property location not verified`} className={className} />{tilesFailed && <p role="status" className="mt-2 text-sm text-slate-600">Some map details are unavailable. Use View on Map to open this property in Google Maps.</p>}</div>;

  const coordinates = `${latitude},${longitude}`;
  const mapUrl = showPin
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery || coordinates)}&ll=${encodeURIComponent(coordinates)}&z=16&output=embed`
    : `https://www.google.com/maps?ll=${encodeURIComponent(mapQuery || coordinates)}&ll=${encodeURIComponent(coordinates)}&z=16&output=embed`;
  return <iframe src={mapUrl} title={showPin ? `Google Maps location of ${name}` : `Google Maps street area near ${name}; exact property location not verified`} className={className} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />;
}
