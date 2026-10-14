import { describe, expect, it } from 'vitest';
import { addressLabel, directionsToPropertyUrl, mapLocationUrl, navigationAddressLabel, postalAddressMetadata } from './map-location';

describe('canonical property mailing addresses', () => {
  const address = {street:'1374 1st Ave',city:'New York',state:'NY',zip:'10021'};
  it('uses the preferred mailing format in display, map and directions', () => {
    expect(addressLabel(address)).toBe('1374 1st Ave, New York, NY 10021');
    expect(new URL(mapLocationUrl(address)).searchParams.get('query')).toBe(addressLabel(address));
    expect(new URL(directionsToPropertyUrl(address)).searchParams.get('destination')).toBe(addressLabel(address));
  });
  it('preserves borough naming and never fabricates a missing ZIP', () => {
    expect(addressLabel({...address,city:'Bronx',zip:''})).toBe('1374 1st Ave, Bronx, NY');
    expect(postalAddressMetadata({...address,zip:undefined})).not.toHaveProperty('postalCode');
    expect(postalAddressMetadata(address).postalCode).toBe('10021');
  });
  it('keeps unit-specific mailing display while navigating to the building using stored ZIP', () => {
    const unit={street:'609 Golden Gate Point Unit 402',city:'Sarasota',state:'FL',zip:'34236'};
    expect(addressLabel(unit)).toContain('Unit 402');
    expect(navigationAddressLabel(unit)).toBe('609 Golden Gate Point, Sarasota, FL 34236');
    expect(navigationAddressLabel({...unit,zip:''})).toBe('609 Golden Gate Point, Sarasota, FL');
  });
});
