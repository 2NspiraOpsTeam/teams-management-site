import type { BuildingPublic } from './database.types';

export function addressLabel(address: BuildingPublic['address']) {
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');
}

export function mapLocationUrl(address: BuildingPublic['address']) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLabel(address))}`;
}

export function directionsToPropertyUrl(address: BuildingPublic['address']) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLabel(address))}`;
}

export function satelliteMapUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/@?api=1&map_action=map&center=${latitude},${longitude}&zoom=18&basemap=satellite`;
}

// Show street context for preview addresses without a verified property pin.
export function nearbyStreetMapCenter(address: BuildingPublic['address']) {
  if (/^(349|351) W(?:est)?\.? 46th St(?:reet)?\.?$/i.test(address.street.trim()) && address.city.toLowerCase() === 'new york' && address.state.toLowerCase() === 'ny') return { latitude: 40.76057, longitude: -73.98977 };
  if (/^609 Golden Gate Point,? Unit 402$/i.test(address.street.trim()) && address.city.toLowerCase() === 'sarasota' && address.state.toLowerCase() === 'fl') return { latitude: 27.33446, longitude: -82.55054 };
  return null;
}

export function streetViewExploreUrl(address: BuildingPublic['address'], location?: { latitude?: number | null; longitude?: number | null; map_verified?: boolean; geocode_status?: string | null }) {
  // Checked in Google Maps: the generic point selects an indoor/business photo
  // or a distant panorama for these addresses. Use nearby street imagery instead.
  if (address.city.toLowerCase() === 'new york' && address.state.toLowerCase() === 'ny') {
    const street = address.street.trim();
    if (/^349 W(?:est)?\.? 46th St(?:reet)?\.?$/i.test(street)) return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.76057,-73.98977';
    if (/^351 W(?:est)?\.? 46th St(?:reet)?\.?$/i.test(street)) return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.76057,-73.98977&heading=0';
    if (/^166 E(?:ast)?\.? 118th St(?:reet)?\.?$/i.test(street)) return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.79966,-73.94019';
    if (/^1365 1st Ave(?:nue)?\.?$/i.test(street)) return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.76862,-73.95540';
    if (/^307 W(?:est)?\.? 39th St(?:reet)?\.?$/i.test(street)) return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.75540,-73.99137';
    if (/^171 E(?:ast)?\.? 74th St(?:reet)?\.?$/i.test(street)) return 'https://www.google.com/maps/@?api=1&map_action=pano&pano=ZiOOKuOkIWeXulzY465m_w&heading=322';
  }
  if (/^609 Golden Gate Point,? Unit 402$/i.test(address.street.trim()) && address.city.toLowerCase() === 'sarasota' && address.state.toLowerCase() === 'fl') return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=27.33446,-82.55054';
  if (location?.map_verified && location.geocode_status === 'verified' && typeof location.latitude === 'number' && typeof location.longitude === 'number' && Number.isFinite(location.latitude) && Number.isFinite(location.longitude) && location.latitude >= -90 && location.latitude <= 90 && location.longitude >= -180 && location.longitude <= 180) {
    return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.latitude},${location.longitude}`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(addressLabel(address))}&layer=c`;
}

export function verifiedLocation(building: BuildingPublic) {
  const { latitude, longitude, geocode_status, map_verified } = building;
  return map_verified === true && geocode_status === 'verified' &&
    typeof latitude === 'number' && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    typeof longitude === 'number' && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}
