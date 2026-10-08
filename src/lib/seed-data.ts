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
    description_public: 'Elegant residential tower overlooking Manhattan\'s iconic green heart. Sophisticated living in the city that never sleeps.',
    address: {
      street: '307 West 56th Street',
      city: 'New York',
      state: 'NY',
      zip: '10019',
      neighborhood: 'Midtown West'
    },
    amenities_public: [
      { id: generateUUID(), name: '24/7 Concierge', category: 'concierge' },
      { id: generateUUID(), name: 'Fitness Center', category: 'fitness' },
      { id: generateUUID(), name: 'Rooftop Lounge', category: 'lifestyle' },
      { id: generateUUID(), name: 'Bike Storage', category: 'wellness' }
    ],
    gallery: [], // Will be populated from media assignments
    publication_state: 'draft',
    management_context: { team_name: 'Central District Team' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Brooklyn Bridge View Residences',
    slug: 'brooklyn-bridge-view',
    description_public: 'Prestigious waterfront living with panoramic Manhattan skyline views. A sanctuary of modern luxury in the heart of Downtown.',
    address: {
      street: '55 Water Street',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      neighborhood: 'Downtown Brooklyn'
    },
    amenities_public: [
      { id: generateUUID(), name: 'Sky Deck', category: 'lifestyle' },
      { id: generateUUID(), name: 'Yoga Studio', category: 'wellness' },
      { id: generateUUID(), name: 'Resident Lounge', category: 'lifestyle' }
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
    description_public: 'Timeless pre-war elegance with contemporary conveniences. Classic Manhattan sophistication in one of the city\'s most desirable neighborhoods.',
    address: {
      street: '1235 Lexington Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10128',
      neighborhood: 'Upper East Side'
    },
    amenities_public: [
      { id: generateUUID(), name: 'Private Garden', category: 'lifestyle' },
      { id: generateUUID(), name: 'Pet Spa', category: 'wellness' },
      { id: generateUUID(), name: 'Business Center', category: 'workspace' }
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
    description: 'Efficient urban studio with thoughtful layout and natural light.',
    window_type: 'bay',
    ceiling_height_feet: 9.5,
    dimensions: { width_feet: 28, depth_feet: 24 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Studio Spacious',
    description: 'Generous studio layout ideal for urban professionals seeking comfort and style.',
    window_type: 'garden',
    ceiling_height_feet: 10,
    dimensions: { width_feet: 32, depth_feet: 28 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'One Bedroom A',
    description: 'Classic one-bedroom with separate living area and chef\'s kitchen.',
    window_type: 'bay',
    ceiling_height_feet: 9.5,
    dimensions: { width_feet: 42, depth_feet: 30 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    name: 'Two Bedroom Standard',
    description: 'Spacious two-bedroom layout perfect for families or professionals.',
    window_type: 'standard',
    ceiling_height_feet: 9,
    dimensions: { width_feet: 58, depth_feet: 36 },
    asset_version: 1,
    reused_by_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Unit assignments - connecting units to buildings and layouts
export const seedUnits: UnitInternal[] = [
  // Central Park Tower - Floor 15-20
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '15A',
    floor_number: 15,
    layout_id: seedLayouts[0].id, // Studio Compact
    status: 'occupied',
    square_footage: 780,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '15B',
    floor_number: 15,
    layout_id: seedLayouts[0].id, // Studio Compact (shared layout)
    status: 'occupied',
    square_footage: 795,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '18C',
    floor_number: 18,
    layout_id: seedLayouts[2].id, // One Bedroom A
    status: 'occupied',
    square_footage: 1150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[0].id,
    unit_identifier: '20A',
    floor_number: 20,
    layout_id: seedLayouts[1].id, // Studio Spacious
    status: 'available_internal',
    square_footage: 850,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  // Brooklyn Bridge View - Floors 12-18
  {
    id: generateUUID(),
    building_id: seedBuildings[1].id,
    unit_identifier: '12B',
    floor_number: 12,
    layout_id: seedLayouts[0].id, // Studio Compact
    status: 'occupied',
    square_footage: 765,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[1].id,
    unit_identifier: '14A',
    floor_number: 14,
    layout_id: seedLayouts[2].id, // One Bedroom A
    status: 'occupied',
    square_footage: 1080,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[1].id,
    unit_identifier: '16C',
    floor_number: 16,
    layout_id: seedLayouts[3].id, // Two Bedroom Standard
    status: 'occupied',
    square_footage: 1450,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  
  // Upper East Side Garden Court - Floors 3-8
  {
    id: generateUUID(),
    building_id: seedBuildings[2].id,
    unit_identifier: '3A',
    floor_number: 3,
    layout_id: seedLayouts[0].id, // Studio Compact
    status: 'occupied',
    square_footage: 680,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[2].id,
    unit_identifier: '5C',
    floor_number: 5,
    layout_id: seedLayouts[2].id, // One Bedroom A
    status: 'occupied',
    square_footage: 1120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    building_id: seedBuildings[2].id,
    unit_identifier: '7B',
    floor_number: 7,
    layout_id: seedLayouts[3].id, // Two Bedroom Standard
    status: 'occupied',
    square_footage: 1580,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Sample media assets (R2 keys would be populated with actual uploads)
export const seedMediaAssets = [
  // Building exterior photos
  {
    id: generateUUID(),
    storage_key: 'buildings/central-park-tower/exterior-day-v1.jpg',
    file_type: 'image/jpeg',
    width: 2048,
    height: 1365,
    size_bytes: 425000,
    checksum: 'sha256-placeholder-001',
    provenance: 'Professional photography - licensed',
    visibility: 'public',
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
    visibility: 'public',
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    storage_key: 'buildings/ues-garden/exterior-brick-v1.jpg',
    file_type: 'image/jpeg',
    width: 2048,
    height: 1365,
    size_bytes: 375000,
    checksum: 'sha256-placeholder-003',
    provenance: 'Professional photography - licensed',
    visibility: 'public',
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  },
  
  // Lobby photos
  {
    id: generateUUID(),
    storage_key: 'buildings/central-park-tower/lobby-marble-v1.jpg',
    file_type: 'image/jpeg',
    width: 2048,
    height: 1365,
    size_bytes: 512000,
    checksum: 'sha256-placeholder-004',
    provenance: 'Internal photography',
    visibility: 'public',
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  },
  
  // Layout floor plans (private in Phase 1)
  {
    id: generateUUID(),
    storage_key: 'layouts/studio-compact-floorplan-v1.pdf',
    file_type: 'application/pdf',
    width: 0,
    height: 0,
    size_bytes: 245000,
    checksum: 'sha256-placeholder-005',
    provenance: 'Architectural drawings - proprietary',
    visibility: 'internal',
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
    checksum: 'sha256-placeholder-006',
    provenance: 'Work order evidence - maintenance report #2341',
    visibility: 'private',
    uploaded_by: generateUUID(),
    created_at: new Date().toISOString()
  }
];

// Media assignments - linking assets to buildings/units
export const seedMediaAssignments: MediaAssignment[] = [
  // Central Park Tower gallery
  {
    id: generateUUID(),
    asset_id: seedMediaAssets[0].id,
    building_id: seedBuildings[0].id,
    is_cover: true,
    order_index: 0,
    alt_text: 'Central Park Tower exterior with Manhattan skyline',
    caption: 'Iconic residential tower overlooking Central Park'
  },
  {
    id: generateUUID(),
    asset_id: seedMediaAssets[3].id,
    building_id: seedBuildings[0].id,
    is_cover: false,
    order_index: 1,
    alt_text: 'Marble lobby with concierge desk',
    caption: 'Elegant entryway with 24/7 concierge'
  },
  
  // Brooklyn Bridge View gallery
  {
    id: generateUUID(),
    asset_id: seedMediaAssets[1].id,
    building_id: seedBuildings[1].id,
    is_cover: true,
    order_index: 0,
    alt_text: 'Brooklyn Bridge View Residences waterfront facade',
    caption: 'Prestigious downtown Brooklyn waterfront living'
  },
  
  // Upper East Side gallery
  {
    id: generateUUID(),
    asset_id: seedMediaAssets[2].id,
    building_id: seedBuildings[2].id,
    is_cover: true,
    order_index: 0,
    alt_text: 'Classic pre-war brick facade on Lexington Avenue',
    caption: 'Timeless elegance in the Upper East Side'
  },
  
  // Unit-specific gallery (cover image for building overview)
  {
    id: generateUUID(),
    asset_id: seedMediaAssets[0].id,
    unit_id: seedUnits[7].id, // One UES unit
    is_cover: true,
    order_index: 0,
    alt_text: 'Upper East Side Garden Court building view',
    caption: 'Beautiful Upper East Side pre-war building'
  }
];

// Sample inquiries for testing the workflow
export const seedInquiries: Inquiry[] = [
  {
    id: generateUUID(),
    source: 'web',
    category: 'property',
    contact_info_hash: 'encrypted-hash-placeholder-001',
    status: 'submitted',
    routing_destination: 'leasing@teams-management.com',
    created_at: new Date().toISOString()
  },
  {
    id: generateUUID(),
    source: 'web',
    category: 'general',
    contact_info_hash: 'encrypted-hash-placeholder-002',
    status: 'resolved',
    routing_destination: 'info@teams-management.com',
    created_at: new Date().toISOString(),
    resolved_at: new Date(Date.now() + 86400000).toISOString() // Tomorrow
  }
];
