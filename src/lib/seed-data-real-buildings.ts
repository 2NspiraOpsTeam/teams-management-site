/**
 * Teams Management - Real Building Addresses (Phase 1)
 * From Jeffrey's specifications
 * 
 * TODO: Add property names, descriptions, and imagery before launch
 */

// All addresses from the client specification
export const realBuildings = [
  { slug: '42-70-156th-st-flushing', address: '42-70 156th St.', neighborhood: 'Flushing' },
  { slug: '3425-east-tremont-ave', address: '3425 East Tremont Ave.', neighborhood: 'Bronx' },
  { slug: '166-170-e-118th-st', address: '166-170 E 118th St.', neighborhood: 'East Harlem' },
  { slug: '71-e-110th-st', address: '71 E 110th St.', neighborhood: 'Harlem' },
  { slug: '173-e-91st-st', address: '173 E 91st St.', neighborhood: 'Upper East Side' },
  { slug: '1626-2nd-ave', address: '1626 2nd Ave.', neighborhood: 'East Harlem' },
  { slug: '225-e-83rd-st', address: '225 E 83rd St.', neighborhood: 'Upper East Side' },
  { slug: '171-e-74th-st', address: '171 E 74th St.', neighborhood: 'Upper East Side' },
  { slug: '1374-1st-ave', address: '1374 1st Ave.', neighborhood: 'Upper East Side' },
  { slug: '1365-1st-ave', address: '1365 1st Ave.', neighborhood: 'Upper East Side' },
  { slug: '41-w-46th-st', address: '41 W 46th St.', neighborhood: 'Midtown' },
  { slug: '349-351-w-46th-st', address: '349-351 W 46th St.', neighborhood: 'Midtown' },
  { slug: '307-w-39th-st', address: '307 W 39th St.', neighborhood: 'Chelsea' },
  { slug: '235-w-18th-st', address: '235 W 18th St.', neighborhood: 'West Village' },
  { slug: '61-gold-st', address: '61 Gold St.', neighborhood: 'Financial District' }
];

// For development, use a mix of published/draft states
export const buildingStates = [
  { slug: realBuildings[0].slug, state: 'published' },
  { slug: realBuildings[1].slug, state: 'draft' },
  { slug: realBuildings[2].slug, state: 'published' },
  { slug: realBuildings[3].slug, state: 'published' },
  { slug: realBuildings[4].slug, state: 'published' },
  { slug: realBuildings[5].slug, state: 'draft' },
  { slug: realBuildings[6].slug, state: 'published' },
  { slug: realBuildings[7].slug, state: 'published' },
  { slug: realBuildings[8].slug, state: 'draft' },
  { slug: realBuildings[9].slug, state: 'draft' },
  { slug: realBuildings[10].slug, state: 'published' },
  { slug: realBuildings[11].slug, state: 'published' },
  { slug: realBuildings[12].slug, state: 'draft' },
  { slug: realBuildings[13].slug, state: 'published' },
  { slug: realBuildings[14].slug, state: 'draft' }
];

// TODO: Before launch - add these fields via admin or data import:
// - Property name (e.g., "The Hudson" or client-assigned name)
// - Description
// - Full address with ZIP code
// - Coordinates
// - Amenities list
// - Photography/gallery
// - Management team assignment
