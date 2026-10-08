/**
 * Teams Management - Representative Seed Data (Phase 1 Development)
 * 
 * Note: This is fictitious/non-client-sensitive data for development/testing.
 * Replace with real property content before launch via Admin interface.
 */

import type { BuildingPublic, UnitInternal, Layout, MediaAsset, MediaAssignment, Inquiry } from './database.types';

// UUID v4 generator for development
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Building data - fictitious properties for development
export const seedBuildings: BuildingPublic[] = [
  {
    id: generateUUID(),
    name: 'Central Park Tower',
    slug: 'central-park-tower',
    description_public: 'Elegant residential tower overlooking Manhattan\'s iconic green heart.',
    address: {
      street: '307 West 56th Street',
      city: 'New York',
      state: 'NY',
      zip: '10019',
      neighborhood: 'Midtown West'
    },
    amenities_public: [
      { id: generateUUID(), name: '24/7 Concierge', category: 'concierge' }
    ],
    gallery: [],
    publication_state: 'draft',
    management_context: { team_name: 'Central District Team' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Brooklyn Bridge View Residences',
    slug: 'brooklyn-bridge-view',
    description_public: 'Prestigious waterfront living with panoramic Manhattan skyline views.',
    address: {
      street: '55 Water Street',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      neighborhood: 'Downtown Brooklyn'
    },
    amenities_public: [
      { id: generateUUID(), name: 'Sky Deck', category: 'lifestyle' }
    ],
    gallery: [],
    publication_state: 'published',
    management_context: { team_name: 'Downtown Team' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Upper East Side Garden Court',
    slug: 'upper-east-side-garden-court',
    description_public: 'Timeless pre-war elegance with contemporary conveniences.',
    address: {
      street: '1235 Lexington Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10128',
      neighborhood: 'Upper East Side'
    },
    amenities_public: [
      { id: generateUUID(), name: 'Private Garden', category: 'lifestyle' }
    ],
    gallery: [],
    publication_state: 'published',
    management_context: { team_name: 'UES Premium Team' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Reusable Layouts for Phase 1
export const seedLayouts: Layout[] = [
  {
    id: generateUUID(),
    name: 'Studio Compact',
    description: 'Efficient urban studio with thoughtful layout.',
    specifications: {}, // Extend in production
    dimensions: { width_feet: 28, depth_feet: 24 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Studio Spacious',
    description: 'Generous studio layout ideal for urban professionals.',
    specifications: {},
    dimensions: { width_feet: 32, depth_feet: 28 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'One Bedroom A',
    description: 'Classic one-bedroom with separate living area.',
    specifications: {},
    dimensions: { width_feet: 42, depth_feet: 30 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Two Bedroom Standard',
    description: 'Spacious two-bedroom layout for families.',
    specifications: {},
    dimensions: { width_feet: 58, depth_feet: 36 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Unit assignments
export const seedUnits: UnitInternal[] = [
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '15A',
    floor_number: 15,
    layout_id: seedLayouts[0].id,
    status: 'occupied' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '15B',
    floor_number: 15,
    layout_id: seedLayouts[0].id,
    status: 'occupied' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '18C',
    floor_number: 18,
    layout_id: seedLayouts[2].id,
    status: 'occupied' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '20A',
    floor_number: 20,
    layout_id: seedLayouts[1].id,
    status: 'available_internal' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  // Brooklyn Bridge View units
  {
    id: generateUUID(),
    building_id: seedBuildings[1].id,
    unit_identifier: '12B',
    floor_number: 12,
    layout_id: seedLayouts[0].id,
    status: 'occupied' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  // Upper East Side units
  {
    id: generateUUID(),
    building_id: seedBuildings[2].id,
    unit_identifier: '3A',
    floor_number: 3,
    layout_id: seedLayouts[0].id,
    status: 'occupied' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Sample media assets
export const seedMediaAssets = [
  {
    id: generateUUID(),
    storage_key: 'buildings/central-park-tower/exterior-day-v1.jpg',
    file_type: 'image/jpeg',
    width: 2048,
    height: 1365,
    size_bytes: 425000,
    checksum: 'sha256-placeholder-001',
    provenance: 'Professional photography - licensed',
    visibility: 'public' as const,
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    storage_key: 'buildings/brooklyn-bridge/exterior-v1.jpg',
    file_type: 'image/jpeg',
    width: 2048,
    height: 1365,
    size_bytes: 398000,
    checksum: 'sha256-placeholder-002',
    provenance: 'Professional photography - licensed',
    visibility: 'public' as const,
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  },
  
  // Layout floor plans (internal in Phase 1)
  {
    id: generateUUID(),
    storage_key: 'layouts/studio-compact-floorplan-v1.pdf',
    file_type: 'application/pdf',
    width: 0,
    height: 0,
    size_bytes: 245000,
    checksum: 'sha256-placeholder-003',
    provenance: 'Architectural drawings - proprietary',
    visibility: 'internal' as const,
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  },
  
  // Private maintenance photo (never public)
  {
    id: generateUUID(),
    storage_key: 'private/maintenance/breakroom-leak-v1.jpg',
    file_type: 'image/jpeg',
    width: 1920,
    height: 1080,
    size_bytes: 185000,
    checksum: 'sha256-placeholder-004',
    provenance: 'Work order evidence - maintenance report #2341',
    visibility: 'private' as const,
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  }
];

// Media assignments
export const seedMediaAssignments: MediaAssignment[] = [
  {
    asset_id: seedMediaAssets[0].id,
    building_id: seedBuildings[0].id,
    is_cover: true,
    order_index: 0,
    alt_text: 'Central Park Tower exterior with Manhattan skyline',
    caption: 'Iconic residential tower overlooking Central Park'
  },
  {
    asset_id: seedMediaAssets[1].id,
    building_id: seedBuildings[1].id,
    is_cover: true,
    order_index: 0,
    alt_text: 'Brooklyn Bridge View Residences waterfront facade',
    caption: 'Prestigious downtown Brooklyn waterfront living'
  },
  
  // Unit-specific gallery cover
  {
    asset_id: seedMediaAssets[0].id,
    unit_id: seedUnits[7]?.id || '', // Placeholder - actual ID in production
    is_cover: true,
    order_index: 0,
    alt_text: 'Upper East Side Garden Court building view',
    caption: 'Beautiful Upper East Side pre-war building'
  }
];

// Sample inquiries
export const seedInquiries: Inquiry[] = [
  {
    id: generateUUID(),
    source: 'web' as const,
    category: 'property' as const,
    contact_info_hash: 'encrypted-hash-placeholder-001',
    status: 'submitted' as const,
    routing_destination: 'leasing@teams-management.com',
    created_at: new Date().toISOString()
  }
];
