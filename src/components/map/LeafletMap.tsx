'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BuildingPublic } from '@/lib/database.types';
import { addressLabel, mapLocationUrl } from '@/lib/map-location';

type VerifiedBuilding = BuildingPublic & { latitude: number; longitude: number };

export default function LeafletMap({ buildings }: { buildings: VerifiedBuilding[] }) {
  const container = useRef<HTMLDivElement>(null);
  const layers = useRef<{ streets: L.TileLayer; aerial: L.TileLayer; labels: L.TileLayer; map: L.Map } | null>(null);
  const [view, setView] = useState<'aerial' | 'streets'>('aerial');
  useEffect(() => {
    if (!container.current || buildings.length === 0) return;
    const map = L.map(container.current, { scrollWheelZoom: false, zoomControl: true });
    const streets = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri and its data providers',
    }).addTo(map);
    const aerial = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Imagery &copy; Esri and its data providers',
    }).addTo(map);
    const labels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Labels &copy; Esri and its data providers',
    }).addTo(map);
    layers.current = { streets, aerial, labels, map };
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
      link.textContent = 'View on Map';
      link.href = mapLocationUrl(building.address);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      popup.appendChild(title); popup.appendChild(address); popup.appendChild(link);
      L.circleMarker(point, { radius: 9, color: '#2D3032', weight: 2, fillColor: '#D4A62A', fillOpacity: 1 })
        .addTo(map).bindPopup(popup);
    }
    if (points.length === 1) map.setView(points[0], 14);
    else map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 14 });
    return () => { layers.current = null; map.remove(); };
  }, [buildings]);
  useEffect(() => {
    const current = layers.current;
    if (!current) return;
    if (view === 'aerial') {
      current.aerial.addTo(current.map);
      current.labels.addTo(current.map);
    } else {
      current.map.removeLayer(current.aerial);
      current.map.removeLayer(current.labels);
    }
  }, [view]);
  return <div className="relative">
    <div ref={container} className="h-[360px] w-full sm:h-[460px]" role="region" aria-label="Map of verified portfolio locations" />
    <div className="absolute bottom-8 left-3 z-[1000] flex rounded-sm bg-white p-1 shadow-lg" role="group" aria-label="Map view">
      <button type="button" onClick={() => setView('aerial')} aria-pressed={view === 'aerial'} className={`min-h-11 px-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-teams-ink ${view === 'aerial' ? 'bg-teams-ink text-white' : 'text-teams-ink'}`}>Satellite</button>
      <button type="button" onClick={() => setView('streets')} aria-pressed={view === 'streets'} className={`min-h-11 px-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-teams-ink ${view === 'streets' ? 'bg-teams-ink text-white' : 'text-teams-ink'}`}>Streets</button>
    </div>
    {view === 'aerial' && <p className="absolute bottom-20 left-3 z-[1000] rounded-sm bg-white/95 px-2 py-1 text-xs text-teams-ink shadow">Satellite imagery · Esri</p>}
  </div>;
}
