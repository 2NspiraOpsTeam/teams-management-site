import type { BuildingPublic } from './database.types';
import { directionsFromPropertyUrl } from './map-location';

/** Editorially verified URLs are stored separately from mapped destinations. */
export type NearbyPlace = {
  category: string;
  label: string;
  name: string;
  source: string;
  mapQuery?: string;
  destinationQuery?: string;
  addressDetail?: string;
  officialWebsiteUrl: string | null;
  websiteVerifiedAt: string | null;
  websiteEvidenceUrl: string | null;
  destinationAddress: string | null;
  destinationPlaceId?: string | null;
  placeIdVerifiedAt?: string | null;
  placeIdEvidenceUrl?: string | null;
  locationVerifiedAt?: string | null;
  locationEvidenceUrl?: string | null;
  destinationCoordinates: { latitude: number; longitude: number } | null;
  distanceLabel: string | null;
  walkTimeLabel: string | null;
  directionsDestination: string;
};

export function nearbyPlaceLinks(item: NearbyPlace, address: BuildingPublic['address']) {
  // Coordinates are positioning data, never a visitor-facing destination identity.
  const destinationAddress = item.destinationAddress?.trim();
  const destination = destinationAddress && !/^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(destinationAddress)
    ? `${item.name}, ${destinationAddress}` : null;
  const placeId = item.destinationPlaceId && item.placeIdVerifiedAt && item.placeIdEvidenceUrl
    ? item.destinationPlaceId : null;
  const mapUrl = destination ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}${placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : ''}` : null;
  // No search-derived business websites, source URLs, or generic city fallbacks.
  const official = item.officialWebsiteUrl && item.websiteVerifiedAt && item.websiteEvidenceUrl
    && /^https:\/\//.test(item.officialWebsiteUrl) ? item.officialWebsiteUrl : null;
  return {
    nameUrl: official,
    nameIsWebsite: Boolean(official),
    mapUrl,
    directionsUrl: destination ? directionsFromPropertyUrl(address, destination, placeId) : null,
  };
}
