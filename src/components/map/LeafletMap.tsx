'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LeafletMapContainerProps {
  className?: string
  center: [number, number] | null
  zoom: number
  minZoom?: number
  maxZoom?: number
  bounds?: { north: number; south: number; east: number; west: number } | null
  tileLayer: string
  attribution: string
  markersEnabled: boolean
  fitBounds?: boolean
}

// Custom icon for markers
const createDefaultIcon = () => {
  return L.divIcon({
    className: 'leaflet-div-icon',
    html: '<i style="color:#C89A3D;font-size:18px"></i>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

interface MarkerProps {
  position: [number, number]
  popup: React.ReactNode
}

const CustomMarker = ({ position, popup }: MarkerProps) => {
  return (
    <div style={{
      width: '24px', height: '24px',
      borderRadius: '50%',
      backgroundColor: '#C89A3D',
      border: '3px solid white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <span style={{ color: 'white', fontSize: '16px' }}>●</span>
    </div>
  )
}

export function LeafletMapContainer({ 
  className, center, zoom, minZoom = 0, maxZoom = 20, bounds, tileLayer, attribution, markersEnabled, fitBounds = false 
}: LeafletMapContainerProps) {
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!center) return
    
    // Initialize map after container is ready
    const map = L.map(`leaflet-map-${Math.random().toString(36).substr(2, 9)}`, {
      center: center as [number, number],
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true
    })

    // Add tile layer
    L.tileLayer(tileLayer, {
      maxZoom: 19,
      attribution: attribution
    }).addTo(map)

    // Fit bounds if provided
    if (bounds && fitBounds) {
      map.fitBounds([[bounds.south, bounds.west], [bounds.north, bounds.east]])
    }

    mapRef.current = map

    return () => {
      map.remove()
    }
  }, [center, zoom, minZoom, maxZoom, bounds, tileLayer, attribution, fitBounds])

  // Update markers when component remounts with different props
  useEffect(() => {
    if (!mapRef.current || !markersEnabled) return
    
    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer)
      }
    })

    // Add new markers from children props
    // Note: This relies on React keys to properly update marker data
  }, [markersEnabled])

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div id={`leaflet-map-${Math.random().toString(36).substr(2, 9)}`} style={{ height: '400px', width: '100%' }} />
      
      {/* Empty state fallback */}
      {markersEnabled && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center',
          background: 'rgba(255,255,255,0.9)', padding: '1rem 2rem', borderRadius: '8px'
        }}>
          <p>No verified coordinates available for the map.</p>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>Add latitude/longitude to building records via admin panel</p>
        </div>
      )}
    </div>
  )
}

export default LeafletMapContainer

// Default icon for use with L.marker()
const defaultIcon = createDefaultIcon()

export { defaultIcon }
export function Marker({ position, popup }: MarkerProps) {
  const markerRef = useRef<L.Marker | null>(null)
  
  return (
    <div data-testid="map-marker" style={{ visibility: 'hidden' }}>
      {/* Marker will be created/updated in LeafletMapContainer */}
    </div>
  )
}

export function PopupContent({ building }: { building: any }) {
  const address = `${building.address?.street || building.name}, ${building.borough}`
  
  return (
    <div style={{ padding: '0.5rem', minWidth: '200px' }}>
      <h4 style={{ margin: '0 0 0.25rem', color: '#333' }}>{building.name}</h4>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
        {address}
      </p>
      {building.location && (
        <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: '#666' }}>
          Location: {building.location}
        </p>
      )}
      <a 
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ 
          display: 'inline-block', marginTop: '0.5rem',
          padding: '0.375rem 0.75rem',
          background: '#C89A3D', color: '#2F3133', textDecoration: 'none',
          fontSize: '0.85rem', borderRadius: '4px'
        }}
      >
        Get Directions
      </a>
    </div>
  )
}
