import type { BuildingPublic } from './database.types';

export function addressLabel(address: BuildingPublic['address']) {
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');
}

export function mapLocationUrl(address: BuildingPublic['address']) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLabel(address))}`;
}

export function streetViewExploreUrl(address: BuildingPublic['address'], location?: { latitude?: number | null; longitude?: number | null; map_verified?: boolean; geocode_status?: string | null }) {
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
