import type { BuildingPublic } from './database.types';

export function addressLabel(address: BuildingPublic['address']) {
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(', ');
}

export function directionsUrl(address: BuildingPublic['address']) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressLabel(address))}`;
}

export function verifiedLocation(building: BuildingPublic) {
  const { latitude, longitude, geocode_status, map_verified } = building;
  return map_verified === true && geocode_status === 'verified' &&
    typeof latitude === 'number' && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    typeof longitude === 'number' && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}
