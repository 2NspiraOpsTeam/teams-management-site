import type { BuildingPublic } from './database.types';

// Explicit preview-build fixture: verified portfolio addresses only. Never enable in production builds.
export const previewPortfolioEnabled = process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO === '1';

// Approved Gold Street preview sequence; scoped to this property's preview route.
export const goldStreetGallery = [
  '/preview-properties/61-gold-st/input-IMG_1540---8fb1ca65-a1a8-4978-b538-0e29844bd4e8.jpg',
  '/preview-properties/61-gold-st/input-IMG_1621---5b1701de-49f5-465f-afeb-0d6d7f05dfd5.jpg',
  '/preview-properties/61-gold-st/input-IMG_1768---aee1973b-f300-46c7-95fa-e60c1c3205c7.jpg',
  '/preview-properties/61-gold-st/input-IMG_1767---4fd2b4cc-d24d-480a-84c3-fcbc244e515b.jpg',
  '/preview-properties/61-gold-st/input-IMG_1622---13fe8f18-9eff-4772-9462-c883aadf1958.jpg',
  '/preview-properties/61-gold-st/input-IMG_1519---1dc9bbce-eba4-4a7b-a16a-9b751e51006c.jpg',
  '/preview-properties/61-gold-st/input-brooklyn_bridge---26ecca4c-d9fd-4d83-840c-315d9018e018.png',
  '/preview-properties/61-gold-st/input-IMG_1517---d432685b-dd66-4e50-9446-fde47ea8585f.jpg',
  '/preview-properties/61-gold-st/input-IMG_1520---436992c6-0073-4f96-86d9-708fb2a6b23f.jpg',
  '/preview-properties/61-gold-st/input-IMG_5284---88aaeaac-e28b-4bd6-a193-2f0c0d9bab21.jpg',
] as const;

const confirmedAddresses = [
  ['42-70-156th-st-flushing', '42-70 156th St', 'Flushing'],
  ['3425-east-tremont-bronx', '3425 East Tremont Ave', 'Bronx'],
  ['166-e-118th-st', '166 E 118th St', 'New York'],
  ['170-e-118th-st', '170 E 118th St', 'New York'],
  ['71-e-110th-st', '71 E 110th St', 'New York'],
  ['173-e-91st-st', '173 E 91st St', 'New York'],
  ['1626-2nd-ave', '1626 2nd Ave', 'New York'],
  ['225-e-83rd-st', '225 E 83rd St', 'New York'],
  ['171-e-74th-st', '171 E 74th St', 'New York'],
  ['1374-1st-ave', '1374 1st Ave', 'New York'],
  ['1365-1st-ave', '1365 1st Ave', 'New York'],
  ['41-w-46th-st', '41 W 46th St', 'New York'],
  ['349-351-w-46th-st', '349-351 W 46th St', 'New York'],
  ['307-w-39th-st', '307 W 39th St', 'New York'],
  ['235-w-18th-st', '235 W 18th St', 'New York'],
  ['61-gold-st', '61 Gold St', 'New York'],
] as const;

export const previewPortfolio: BuildingPublic[] = confirmedAddresses.map(([slug, street, city]) => ({
  id: `preview-${slug}`,
  name: street,
  slug,
  address: { street, city, state: 'NY', zip: '' },
  description_public: null,
  amenities_public: [],
  gallery: slug === '235-w-18th-st' ? ['/preview-properties/235-w-18th-st/235-w-18th-st-exterior-01.jpg'] : [],
  publication_state: 'draft',
  created_at: '',
  updated_at: '',
}));
