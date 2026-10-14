import { describe, expect, it } from 'vitest';
import highlights from '../src/lib/nearby-highlights.json';
import anchors from '../src/lib/retail-nearby-anchors.json';
import { nearbyPlaceLinks, type NearbyPlace } from '../src/lib/nearby-place';

const origin = { street: '225 E 83rd St', city: 'New York', state: 'NY', zip: '10028' };
const datasets = [highlights, anchors] as Record<string, NearbyPlace[]>[];

describe('Separate nearby place actions', () => {
  it('routes every place from the property address to its separately stored destination', () => {
    for (const dataset of datasets) for (const [slug, items] of Object.entries(dataset)) for (const item of items) {
      const links = nearbyPlaceLinks(item, origin);
      const route = new URL(links.directionsUrl!);
      expect(route.pathname, `${slug}: ${item.name}`).toBe('/maps/dir/');
      expect(route.searchParams.get('origin')).toBe('225 E 83rd St, New York, NY 10028');
      expect(route.searchParams.get('destination')).toBe(item.directionsDestination);
      expect(item.directionsDestination).not.toBe('');
      expect(route.searchParams.get('travelmode')).toBe('walking');
      expect(links.nameUrl).not.toBe(links.directionsUrl);
      if (item.officialWebsiteUrl) {
        expect(item.websiteVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(item.websiteEvidenceUrl).toMatch(/^https:\/\//);
        expect(item.officialWebsiteUrl).toMatch(/^https:\/\//);
        expect(item.officialWebsiteUrl).not.toMatch(/google\.com\/maps|openstreetmap\.org|data\.ny\.gov/);
        expect(links.nameUrl).toBe(item.officialWebsiteUrl);
      } else {
        expect(links.nameUrl).toBeNull();
        expect(links.nameIsWebsite).toBe(false);
      }
      expect(item).toHaveProperty('distanceLabel');
      expect(item).toHaveProperty('walkTimeLabel');
      expect(item.destinationAddress).toBeTruthy();
      expect(route.searchParams.get('destination')).toContain(item.name);
      expect(route.searchParams.get('destination')).toContain(item.destinationAddress);
      expect(route.searchParams.get('destination')).not.toMatch(/^-?\d+\.\d+,-?\d+\.\d+$/);
      expect(item.locationVerifiedAt).toBeTruthy();
      expect(item.locationEvidenceUrl).toMatch(/^https:\/\//);
    }
  });

  it('leaves an unverified place name unlinked without inventing a website or substituting a source link', () => {
    const item = highlights['225-e-83rd-st'][1] as NearbyPlace;
    const unverified = { ...item, officialWebsiteUrl: 'https://example.com/', websiteVerifiedAt: null };
    const links = nearbyPlaceLinks(unverified, origin);
    expect(links.nameIsWebsite).toBe(false);
    expect(links.nameUrl).not.toBe(unverified.officialWebsiteUrl);
    expect(links.nameUrl).not.toBe(item.source);
    expect(links.nameUrl).toBeNull();
    expect(nearbyPlaceLinks({ ...item, officialWebsiteUrl: 'javascript:alert(1)' }, origin).nameIsWebsite).toBe(false);
  });

  it('keeps Sarasota origins at the building entrance without an apartment identifier', () => {
    const sarasota = { street: '609 Golden Gate Point, Unit 402', city: 'Sarasota', state: 'FL', zip: '34236' };
    const item = highlights['609-golden-gate-pt-unit-402'][4] as NearbyPlace;
    const route = new URL(nearbyPlaceLinks(item, sarasota).directionsUrl!);
    expect(route.searchParams.get('origin')).toBe('609 Golden Gate Point, Sarasota, FL 34236');
    expect(route.searchParams.get('destination')).toBe('Marina Jack, 2 Marina Plaza, Sarasota, FL 34236');
    expect(nearbyPlaceLinks(item, sarasota).nameUrl).toBe('https://www.marinajacks.com/contact.html');
  });
});


it('uses only a verified Google Place ID and never revives coordinate-only routing', () => {
 const item = highlights['225-e-83rd-st'][1] as NearbyPlace;
 const verified = {...item, destinationPlaceId:'ChIJ-test-branch', placeIdVerifiedAt:'2026-10-14', placeIdEvidenceUrl:'https://www.google.com/maps/place/verified'};
 expect(new URL(nearbyPlaceLinks(verified, origin).directionsUrl!).searchParams.get('destination_place_id')).toBe('ChIJ-test-branch');
 expect(new URL(nearbyPlaceLinks({...verified, placeIdVerifiedAt:null}, origin).directionsUrl!).searchParams.has('destination_place_id')).toBe(false);
 expect(nearbyPlaceLinks({...item, destinationAddress:null, directionsDestination:'40.1,-73.1'}, origin).directionsUrl).toBeNull();
 expect(nearbyPlaceLinks({...item, destinationAddress:'40.1,-73.1'}, origin).directionsUrl).toBeNull();
});

it('keeps multiple CVS branches distinct and suppresses the reported closed Gristedes identity', () => {
 const items=Object.values(highlights).flat();
 const cvs=items.filter(x=>x.name==='CVS Pharmacy');
 expect(new Set(cvs.map(x=>x.destinationAddress)).size).toBe(2);
 expect(cvs.map(x=>x.destinationAddress)).toContain('305 East 86th Street, New York, NY 10028');
 expect(items.some(x=>x.source==='https://www.openstreetmap.org/node/2620513862')).toBe(false);
});

it('keeps A Matter of Health website and named First Avenue branch directions separate', () => {
 const item=highlights['1374-1st-ave'].find(x=>x.name==='A Matter of Health') as NearbyPlace;
 const property={street:'1374 1st Ave',city:'New York',state:'NY',zip:'10021'};
 const links=nearbyPlaceLinks(item,property);
 expect(links.nameUrl).toBe('https://amatterofhealthmarket.com/');
 const route=new URL(links.directionsUrl!);
 expect(route.searchParams.get('origin')).toBe('1374 1st Ave, New York, NY 10021');
 expect(route.searchParams.get('destination')).toBe('A Matter of Health, 1347 1st Avenue, New York, NY 10021');
});
