import { describe, expect, it } from 'vitest';
import { mapLocationUrl, streetViewExploreUrl, verifiedLocation } from '../src/lib/map-location';
import type { BuildingPublic } from '../src/lib/database.types';

const building = { address: { street: '61 Gold St', city: 'New York', state: 'NY', zip: '' }, latitude: 40.7, longitude: -74, geocode_status: 'pending', map_verified: false } as BuildingPublic;
describe('public map eligibility', () => {
  it('opens a map search from address before coordinates are verified', () => {
    expect(mapLocationUrl(building.address)).toContain('query=61%20Gold%20St%2C%20New%20York%2C%20NY');
  });
  it('opens Street View directly for verified coordinates', () => {
    expect(streetViewExploreUrl(building.address, { ...building, geocode_status: 'verified', map_verified: true })).toContain('map_action=pano&viewpoint=40.7,-74');
  });
  it('opens the checked street-level panorama for 351 W 46th St', () => {
    expect(streetViewExploreUrl({ street: '351 W 46th St', city: 'New York', state: 'NY', zip: '10036' })).toContain('viewpoint=40.76057,-73.98977&heading=0');
  });
  it('never displays a candidate or unchecked coordinate', () => {
    expect(verifiedLocation(building)).toBe(false);
    expect(verifiedLocation({ ...building, geocode_status: 'verified' })).toBe(false);
    expect(verifiedLocation({ ...building, geocode_status: 'verified', map_verified: true })).toBe(true);
    expect(verifiedLocation({ ...building, geocode_status: 'verified', map_verified: true, latitude: 200 })).toBe(false);
  });
});
