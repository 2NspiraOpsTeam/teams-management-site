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
  destinationCoordinates: { latitude: number; longitude: number } | null;
  distanceLabel: string | null;
  walkTimeLabel: string | null;
  directionsDestination: string;
};

export function nearbyPlaceLinks(item: NearbyPlace, address: BuildingPublic['address']) {
  const coordinates = item.destinationCoordinates;
  const mapDestination = coordinates
    ? `${coordinates.latitude},${coordinates.longitude}`
    : item.destinationAddress || item.directionsDestination;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapDestination)}`;
  // No search-derived business websites, source URLs, or generic city fallbacks.
  const official = item.officialWebsiteUrl && item.websiteVerifiedAt && item.websiteEvidenceUrl
    && /^https:\/\//.test(item.officialWebsiteUrl) ? item.officialWebsiteUrl : null;
  return {
    nameUrl: official || mapUrl,
    nameIsWebsite: Boolean(official),
    mapUrl,
    directionsUrl: directionsFromPropertyUrl(address, item.directionsDestination),
  };
}
