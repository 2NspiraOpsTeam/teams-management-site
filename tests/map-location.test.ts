import { describe, expect, it } from 'vitest';
import { directionsUrl, verifiedLocation } from '../src/lib/map-location';
import type { BuildingPublic } from '../src/lib/database.types';

const building = { address: { street: '61 Gold St', city: 'New York', state: 'NY', zip: '' }, latitude: 40.7, longitude: -74, geocode_status: 'pending', map_verified: false } as BuildingPublic;
describe('public map eligibility', () => {
  it('offers directions from address before coordinates are verified', () => {
    expect(directionsUrl(building.address)).toContain('destination=61%20Gold%20St%2C%20New%20York%2C%20NY');
  });
  it('never displays a candidate or unchecked coordinate', () => {
    expect(verifiedLocation(building)).toBe(false);
    expect(verifiedLocation({ ...building, geocode_status: 'verified' })).toBe(false);
    expect(verifiedLocation({ ...building, geocode_status: 'verified', map_verified: true })).toBe(true);
    expect(verifiedLocation({ ...building, geocode_status: 'verified', map_verified: true, latitude: 200 })).toBe(false);
  });
});
