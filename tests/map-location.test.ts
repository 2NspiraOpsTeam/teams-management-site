import { describe, expect, it } from 'vitest';
import { directionsToPropertyUrl, directionsFromPropertyUrl, mapLocationUrl, nearbyStreetMapCenter, satelliteMapUrl, streetViewExploreUrl, verifiedLocation } from '../src/lib/map-location';
import type { BuildingPublic } from '../src/lib/database.types';

const building = { address: { street: '61 Gold St', city: 'New York', state: 'NY', zip: '' }, latitude: 40.7, longitude: -74, geocode_status: 'pending', map_verified: false } as BuildingPublic;
describe('public map eligibility', () => {
  it('opens a map search from address before coordinates are verified', () => {
    expect(mapLocationUrl(building.address)).toContain('query=61%20Gold%20St%2C%20New%20York%2C%20NY');
    expect(directionsToPropertyUrl(building.address)).toContain('destination=61%20Gold%20St%2C%20New%20York%2C%20NY');
    expect(mapLocationUrl(building.address)).not.toContain('/dir/');
    expect(satelliteMapUrl(40.7, -74)).toContain('basemap=satellite');
  });
  it('opens Street View directly for verified coordinates', () => {
    expect(streetViewExploreUrl(building.address, { ...building, geocode_status: 'verified', map_verified: true })).toContain('map_action=pano&viewpoint=40.7,-74');
  });
  it('opens the checked street-level panorama for 351 W 46th St', () => {
    expect(streetViewExploreUrl({ street: '351 W 46th St', city: 'New York', state: 'NY', zip: '10036' })).toContain('viewpoint=40.76057,-73.98977&heading=0');
  });
  it('opens the checked panorama for 166 E 118th St', () => {
    expect(streetViewExploreUrl({ street: '166 E 118th St', city: 'New York', state: 'NY', zip: '10035' }, { latitude: 40.799662986705, longitude: -73.940188820388, geocode_status: 'verified', map_verified: true })).toContain('viewpoint=40.79966,-73.94019');
  });
  it('uses checked street imagery instead of indoor photos or a distant panorama', () => {
    const coordinates: Record<string, string> = {
      '349 W 46th St': '40.76057,-73.98977',
      '1365 1st Ave': '40.76862,-73.95540',
      '307 W 39th St': '40.75540,-73.99137',
    };
    for (const [street, expected] of Object.entries(coordinates)) {
      expect(streetViewExploreUrl({ street, city: 'New York', state: 'NY', zip: '' })).toContain(`viewpoint=${expected}`);
    }
    expect(streetViewExploreUrl({ street: '171 E 74th St', city: 'New York', state: 'NY', zip: '' })).toContain('pano=ZiOOKuOkIWeXulzY465m_w');
  });
  it('shows cross-street context without a false pin for the two unverified W 46th addresses', () => {
    for (const street of ['349 W 46th St', '351 W 46th St']) {
      expect(nearbyStreetMapCenter({ street, city: 'New York', state: 'NY', zip: '10036' })).toEqual({ latitude: 40.76057, longitude: -73.98977 });
    }
  });
  it('opens street context for the preview Sarasota unit without treating its building as a verified pin', () => {
    const address = { street: '609 Golden Gate Point, Unit 402', city: 'Sarasota', state: 'FL', zip: '34236' };
    expect(nearbyStreetMapCenter(address)).toEqual({ latitude: 27.33446, longitude: -82.55054 });
    expect(streetViewExploreUrl(address)).toContain('viewpoint=27.33446,-82.55054');
  });
  it('never displays a candidate or unchecked coordinate', () => {
    expect(verifiedLocation(building)).toBe(false);
    expect(verifiedLocation({ ...building, geocode_status: 'verified' })).toBe(false);
    expect(verifiedLocation({ ...building, geocode_status: 'verified', map_verified: true })).toBe(true);
    expect(verifiedLocation({ ...building, geocode_status: 'verified', map_verified: true, latitude: 200 })).toBe(false);
  });
});


it('routes Sarasota destinations by street address and omits the apartment from the route origin',()=>{
 const address={street:'609 Golden Gate Point, Unit 402',city:'Sarasota',state:'FL',zip:'34236'};
 const route=new URL(directionsFromPropertyUrl(address,'1534 Mound Street, Sarasota, FL 34236'));
 expect(route.searchParams.get('origin')).toBe('609 Golden Gate Point, Sarasota, FL 34236');
 expect(route.searchParams.get('destination')).toBe('1534 Mound Street, Sarasota, FL 34236');
 expect(new URL(mapLocationUrl(address)).searchParams.get('query')).toBe('609 Golden Gate Point, Sarasota, FL 34236');
});
