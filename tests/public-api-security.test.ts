import { describe, expect, it } from 'vitest';
import { parsePublicBuildingRow } from '../src/lib/public-building-projection';

describe('public building projection', () => {
  it('does not include internal building or unit data', () => {
    const row = {
      id: 'building-1', name: 'Test Property', slug: 'test-property',
      description_public: 'Public overview', address_json: '{"street":"1 Main St","city":"New York","state":"NY","zip":"10001"}',
      amenities_public: '[]', gallery: '[{"asset_id":"private-photo"}]', publication_state: 'published' as const,
      created_at: '2026-10-08', updated_at: '2026-10-08',
      management_context: '{"notes":"private"}', units: [{ status: 'occupied' }],
    };
    const publicValue = parsePublicBuildingRow(row);
    expect(publicValue.address.street).toBe('1 Main St');
    expect(publicValue).not.toHaveProperty('management_context');
    expect(publicValue).not.toHaveProperty('units');
    expect(publicValue).not.toHaveProperty('status');
    expect(publicValue.gallery).toEqual([]);
  });
});
