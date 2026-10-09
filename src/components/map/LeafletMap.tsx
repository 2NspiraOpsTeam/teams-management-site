'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BuildingPublic } from '@/lib/database.types';
import { addressLabel, directionsUrl } from '@/lib/map-location';

type VerifiedBuilding = BuildingPublic & { latitude: number; longitude: number };

export default function LeafletMap({ buildings }: { buildings: VerifiedBuilding[] }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current || buildings.length === 0) return;
    const map = L.map(container.current, { scrollWheelZoom: false, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    const points: L.LatLngExpression[] = [];
    for (const building of buildings) {
      const point: L.LatLngExpression = [building.latitude, building.longitude];
      points.push(point);
      const popup = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = building.name;
      const address = document.createElement('p');
      address.textContent = addressLabel(building.address);
      const link = document.createElement('a');
      link.textContent = 'Map & Directions';
      link.href = directionsUrl(building.address);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      popup.appendChild(title); popup.appendChild(address); popup.appendChild(link);
      L.circleMarker(point, { radius: 9, color: '#2D3032', weight: 2, fillColor: '#B58A3A', fillOpacity: 1 })
        .addTo(map).bindPopup(popup);
    }
    if (points.length === 1) map.setView(points[0], 14);
    else map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 14 });
    return () => { map.remove(); };
  }, [buildings]);
  return <div ref={container} className="h-[360px] w-full sm:h-[460px]" role="region" aria-label="Map of verified portfolio locations" />;
}
