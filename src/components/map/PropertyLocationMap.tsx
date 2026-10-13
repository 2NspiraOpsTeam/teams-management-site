'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function PropertyLocationMap({ name, latitude, longitude, showPin, fullHeight = false }: { name: string; latitude: number; longitude: number; showPin: boolean; fullHeight?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const isNyc = latitude > 40.4 && latitude < 41 && longitude > -74.3 && longitude < -73.6;
  useEffect(() => {
    if (!isNyc || !container.current) return;
    const map = L.map(container.current, { scrollWheelZoom: false }).setView([latitude, longitude], 16);
    L.tileLayer('https://maps.nyc.gov/xyz/1.0.0/carto/basemap-lt/{z}/{x}/{y}.png8', {
      maxZoom: 20,
      attribution: '&copy; City of New York',
    }).addTo(map);
    if (showPin) L.circleMarker([latitude, longitude], { radius: 9, color: '#2D3032', weight: 2, fillColor: '#D4A62A', fillOpacity: 1 }).addTo(map).bindPopup(name);
    return () => { map.remove(); };
  }, [isNyc, latitude, longitude, name, showPin]);

  const className = fullHeight ? 'h-full w-full border-0 bg-stone-100' : 'h-[380px] w-full border-0 bg-stone-100 sm:h-[460px]';
  if (isNyc) return <div ref={container} role="region" aria-label={showPin ? `Map location of ${name}` : `Street area near ${name}; exact property location not verified`} className={className} />;

  const coordinates = `${latitude},${longitude}`;
  const mapUrl = showPin
    ? `https://www.google.com/maps?q=${encodeURIComponent(coordinates)}&z=16&output=embed`
    : `https://www.google.com/maps?ll=${encodeURIComponent(coordinates)}&z=16&output=embed`;
  return <iframe src={mapUrl} title={showPin ? `Google Maps location of ${name}` : `Google Maps street area near ${name}; exact property location not verified`} className={className} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />;
}
