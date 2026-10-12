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
  ['349-w-46th-st', '349 W 46th St', 'New York'],
  ['351-w-46th-st', '351 W 46th St', 'New York'],
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

const tremont = previewPortfolio.find(item => item.slug === '3425-east-tremont-bronx');
if (tremont) tremont.description_public = 'A two-story commercial property on East Tremont Avenue in the Bronx, combining street-facing retail frontage with office space above.';

// Unit-only Sarasota portfolio entry. Do not imply management of the condominium building.
previewPortfolio.push({
  id: 'preview-609-golden-gate-pt-unit-402',
  name: '609 Golden Gate Point, Unit 402',
  slug: '609-golden-gate-pt-unit-402',
  address: { street: '609 Golden Gate Point, Unit 402', city: 'Sarasota', state: 'FL', zip: '34236' },
  description_public: 'Teams Management manages Unit 402 at The Pearl. This three-bedroom, three-bath residence offers approximately 2,462 square feet of living space. It features an open living and dining area, a separate media room and office, a kitchen with a six-burner gas cooktop, and bedroom terrace access.',
  amenities_public: [
    { id: 'sarasota-private-foyer', name: 'Private elevator foyer access', category: 'lifestyle' },
    { id: 'sarasota-terraces', name: 'Bedroom terrace access', category: 'lifestyle' },
    { id: 'sarasota-pool', name: 'Building pool and spa', category: 'wellness' },
    { id: 'sarasota-garage', name: 'Enclosed two-car garage', category: 'lifestyle' },
  ],
  gallery: [],
  publication_state: 'draft',
  created_at: '',
  updated_at: '',
});

// Owner-supplied historical listing photos. Do not imply that furnishings or access are current.
export const sarasotaUnitPhotos = [
  { src: '/preview-properties/609-golden-gate-pt-unit-402/living-room.webp', alt: 'Unit 402 living area opening onto a terrace', caption: 'Living area' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/bathroom.webp', alt: 'Bathroom with double vanity and glass shower', caption: 'Bathroom' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/shower.webp', alt: 'Glass-enclosed shower and bathroom', caption: 'Shower' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/bathroom-tub.webp', alt: 'Bathroom with double vanity and freestanding tub', caption: 'Bathroom and tub' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/bedroom.webp', alt: 'Bedroom with tall windows', caption: 'Bedroom' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/pearl-entrance.webp', alt: 'The Pearl condominium entrance', caption: 'Building entrance' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/kitchen-living.webp', alt: 'Open kitchen and living area in Unit 402', caption: 'Kitchen and living area' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/kitchen-dining.webp', alt: 'Kitchen island, cooktop, and dining area', caption: 'Kitchen and dining area' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/kitchen-to-living.webp', alt: 'View from the kitchen toward the living area and terrace', caption: 'Open living area' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/interior-terrace.webp', alt: 'Interior room beside a terrace', caption: 'Interior and terrace' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/interior-reverse.webp', alt: 'Interior room and adjoining bathroom', caption: 'Interior room' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/building-waterfront.webp', alt: 'Aerial view of The Pearl and nearby waterfront', caption: 'The Pearl and surroundings' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/building-pool.webp', alt: 'Aerial view of The Pearl and pool area', caption: 'The Pearl and pool area' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/garage-402.webp', alt: 'Garage door marked 402', caption: 'Garage' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/pool.webp', alt: 'The Pearl condominium pool', caption: 'Building pool' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/pool-deck.webp', alt: 'The Pearl condominium pool deck', caption: 'Pool deck' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/waterfront-view.webp', alt: 'Waterfront near Golden Gate Point', caption: 'Golden Gate Point waterfront' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/terrace-view.webp', alt: 'Terrace overlooking the waterfront', caption: 'Terrace' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/laundry.webp', alt: 'Laundry room with washer and dryer', caption: 'Laundry room' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/office.webp', alt: 'Office area', caption: 'Office' },
];

// Owner-supplied Apartment 1B images. Keep unit imagery scoped to this preview detail page.
export const east110UnitPhotos = [
  { src: '/preview-properties/71-e-110th-st/living-wide.jpg', alt: 'Wide view of the living area in Apartment 1B', caption: 'Apartment 1B · Living area' },
  { src: '/preview-properties/71-e-110th-st/kitchen.jpg', alt: 'Kitchen with wood cabinets and stainless-steel appliances in Apartment 1B', caption: 'Apartment 1B · Kitchen' },
  { src: '/preview-properties/71-e-110th-st/bedroom-one.jpg', alt: 'Bedroom with a window and wood flooring in Apartment 1B', caption: 'Apartment 1B · Bedroom' },
  { src: '/preview-properties/71-e-110th-st/bedroom-two.jpg', alt: 'Second bedroom view with mirrored closet doors in Apartment 1B', caption: 'Apartment 1B · Bedroom' },
  { src: '/preview-properties/71-e-110th-st/bathroom.jpg', alt: 'Bathroom with tub, vanity, and laundry appliance in Apartment 1B', caption: 'Apartment 1B · Bathroom' },
];

// Owner-supplied Penthouse A images; never present its terrace as shared grounds.
export const east110PenthousePhotos = [
  { src: '/preview-properties/71-e-110th-st/penthouse-living.jpg', alt: 'Living area and city-facing windows in Penthouse A', caption: 'Penthouse A · Living area' },
  { src: '/preview-properties/71-e-110th-st/penthouse-kitchen.jpg', alt: 'Open kitchen and adjoining living area in Penthouse A', caption: 'Penthouse A · Kitchen and living area' },
  { src: '/preview-properties/71-e-110th-st/penthouse-bedroom.jpg', alt: 'Room with mirrored closet and terrace door in Penthouse A', caption: 'Penthouse A · Interior room' },
  { src: '/preview-properties/71-e-110th-st/penthouse-bathroom.jpg', alt: 'Bathroom with tub and laundry appliance in Penthouse A', caption: 'Penthouse A · Bathroom' },
  { src: '/preview-properties/71-e-110th-st/penthouse-terrace.jpg', alt: 'Private terrace photographed from Penthouse A', caption: 'Penthouse A · Terrace' },
];
