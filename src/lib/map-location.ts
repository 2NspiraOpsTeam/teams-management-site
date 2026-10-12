import type { BuildingPublic } from './database.types';

export function addressLabel(address: BuildingPublic['address']) {
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');
}

export function mapLocationUrl(address: BuildingPublic['address']) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLabel(address))}`;
}

export function streetViewExploreUrl(address: BuildingPublic['address'], location?: { latitude?: number | null; longitude?: number | null; map_verified?: boolean; geocode_status?: string | null }) {
  // The address search does not reliably resolve to a panorama. This street-level
  // viewpoint was checked in Google Maps for the separately listed 351 address.
  if (/^351 W(?:est)?\.? 46th St(?:reet)?\.?$/i.test(address.street.trim()) && address.city.toLowerCase() === 'new york' && address.state.toLowerCase() === 'ny') {
    return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.76057,-73.98977&heading=0';
  }
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
