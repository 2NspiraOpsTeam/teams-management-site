import type { BuildingPublic } from './database.types';

// Explicit preview-build fixture: verified portfolio addresses only. Never enable in production builds.
export const previewPortfolioEnabled = process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO === '1';

// Supplied property-specific cover, scoped to the preview fixture until publication is approved.
export const previewPropertyCover = (slug: string) =>
  previewPortfolioEnabled && slug === '42-70-156th-st-flushing'
    ? '/preview-properties/42-70-156th-street.jpg'
    : null;

const confirmedAddresses = [
  ['42-70-156th-st-flushing', '42-70 156th St', 'Flushing'],
  ['3425-east-tremont-bronx', '3425 East Tremont Ave', 'Bronx'],
  ['166-170-e-118th-st', '166-170 E 118th St', 'New York'],
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
  gallery: [],
  publication_state: 'draft',
  created_at: '',
  updated_at: '',
}));
