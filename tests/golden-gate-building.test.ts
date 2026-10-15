import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../src/middleware';
import { previewPortfolio, sarasotaBuildingPhotos } from '../src/lib/preview-portfolio';
import { nearbyStreetMapCenter, streetViewExploreUrl } from '../src/lib/map-location';

describe('Golden Gate building identity', () => {
  it('retains the building address without unit specifications', () => {
    const building = previewPortfolio.find(item => item.slug === '609-golden-gate-pt')!;
    expect(building.name).toBe('609 Golden Gate Pt');
    expect(building.address).toEqual({ street: '609 Golden Gate Point', city: 'Sarasota', state: 'FL', zip: '34236' });
    expect(JSON.stringify(building)).not.toMatch(/402|2,462|three-bedroom|three-bath|six-burner/i);
    expect(JSON.stringify(sarasotaBuildingPhotos)).not.toMatch(/402/);
    expect(nearbyStreetMapCenter(building.address)).not.toBeNull();
    expect(streetViewExploreUrl(building.address)).toContain('viewpoint=27.33446,-82.55054');
  });
  it('permanently redirects legacy links while preserving query parameters', () => {
    const response = middleware(new NextRequest('https://teams-management-preview.pages.dev/properties/609-golden-gate-pt-unit-402?source=saved'));
    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://teams-management-preview.pages.dev/properties/609-golden-gate-pt?source=saved');
  });
  it('does not redirect the new canonical route', () => {
    const response = middleware(new NextRequest('https://teams-management-preview.pages.dev/properties/609-golden-gate-pt'));
    expect(response.headers.get('location')).toBeNull();
  });
});
