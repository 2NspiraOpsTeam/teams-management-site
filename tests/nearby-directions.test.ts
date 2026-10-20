import { describe, expect, it } from 'vitest';
import highlights from '../src/lib/nearby-highlights.json';
import anchors from '../src/lib/retail-nearby-anchors.json';
import origins from '../src/lib/nearby-property-origins.json';

describe('Neighborhood directions', () => {
  it('pins every sourced place near its own property instead of searching an ambiguous business name', () => {
    const entries = [highlights, anchors].flatMap(dataset => Object.entries(dataset));
    let checked = 0;
    let transitChecked = 0;
    for (const [slug, places] of entries) {
      const origin = (origins as Record<string, { latitude: number; longitude: number }>)[slug];
      for (const place of places) {
        if (place.category === 'transit') {
          expect(place.destinationQuery, `${slug}: transit needs a specific nearby access intersection`).toMatch(/& .+, (?:New York|Bronx|Flushing), NY \d{5}$/);
          transitChecked++;
        }
        if (!place.source.startsWith('https://www.openstreetmap.org/')) continue;
        expect(origin, `Missing origin for ${slug}`).toBeDefined();
        expect(place.mapQuery, `${slug}: ${place.name}`).toMatch(/^-?\d+\.\d+,-?\d+\.\d+$/);
        const [latitude, longitude] = place.mapQuery!.split(',').map(Number);
        const north = (latitude - origin.latitude) * 111_200;
        const east = (longitude - origin.longitude) * 111_200 * Math.cos(latitude * Math.PI / 180);
        expect(Math.hypot(north, east), `${slug}: ${place.name} is not nearby`).toBeLessThan(750);
        if ('destinationQuery' in place && place.destinationQuery) {
          expect(place.destinationQuery, `${slug}: ${place.name} needs a specific street address`).toMatch(/\d+ .+, (?:New York|Bronx|Flushing), NY(?: \d{5})?$/);
        }
        checked++;
      }
    }
    expect(checked).toBe(110);
    expect(transitChecked).toBe(18);
  });
});


it('Sarasota neighborhood cards use specific Florida destinations, not NYC routes', () => {
 const places=highlights['609-golden-gate-pt'];
 expect(places).toHaveLength(5);
 for(const place of places){expect(place.destinationQuery).toMatch(/^\d+ .+, Sarasota, FL 34236$/);expect(place.source).toMatch(/^https:\/\//);expect(place.source).not.toContain('new.mta.info');}
});
