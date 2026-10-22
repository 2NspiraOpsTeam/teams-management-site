import { describe, expect, it } from 'vitest';
import { parsePublicBuildingRow } from '../src/lib/public-building-projection';

describe('public building projection', () => {
  it('does not include internal building or unit data', () => {
    const row = {
      id: 'building-1', name: 'Test Property', slug: 'test-property',
      description_public: 'Public overview', address_json: '{"street":"1 Main St","city":"New York","state":"NY","zip":"10001"}',
      amenities_public: '[]', gallery: '[{"asset_id":"private-photo"}]', publication_state: 'published' as const,
      created_at: '2026-10-08', updated_at: '2026-10-08',
      llc_name: 'PRIVATE LLC', internal_notes: 'PRIVATE PROPERTY NOTE', year_purchased: '2011', tax_block: '768', tax_lot: '17', apartment_count: 20, store_count: 3, floor_count: 4, stabilization_summary: 'PRIVATE BREAKDOWN', management_context: '{"notes":"private"}', units: [{ status: 'occupied' }],
    };
    const publicValue = parsePublicBuildingRow(row);
    expect(publicValue.address.street).toBe('1 Main St');
    expect(publicValue).not.toHaveProperty('management_context');
    expect(publicValue).not.toHaveProperty('units');
    expect(publicValue).not.toHaveProperty('status');
    for(const field of ['llc_name','internal_notes','year_purchased','tax_block','tax_lot','apartment_count','store_count','floor_count','stabilization_summary'])expect(publicValue).not.toHaveProperty(field);
    expect(publicValue.gallery).toEqual([]);
  });
});
