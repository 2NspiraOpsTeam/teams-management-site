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
  gallery: [],
  publication_state: 'draft',
  created_at: '',
  updated_at: '',
}));

// Unit-only Sarasota portfolio entry. Do not imply management of the condominium building.
previewPortfolio.push({
  id: 'preview-609-golden-gate-pt-unit-402',
  name: '609 Golden Gate Point, Unit 402',
  slug: '609-golden-gate-pt-unit-402',
  address: { street: '609 Golden Gate Point, Unit 402', city: 'Sarasota', state: 'FL', zip: '34236' },
  description_public: 'Teams Management manages Unit 402 at The Pearl, not the entire condominium building. The 2019 residence has three bedrooms and three full bathrooms, according to Sarasota County records. The county records 2,462 square feet of living area (3,007 square feet gross); a historical sales listing advertised 2,750 square feet. The historical listing describes an open living and dining area, a separate media room and office, a kitchen with a six-burner gas cooktop, terraces accessible from the bedrooms, and an enclosed two-car garage. These are historical details, not a statement of current rental availability, furnishings, or lease terms.',
  amenities_public: [
    { id: 'sarasota-private-foyer', name: 'Elevator access to a private foyer (historical listing)', category: 'lifestyle' },
    { id: 'sarasota-terraces', name: 'Bedroom terrace access (historical listing)', category: 'lifestyle' },
    { id: 'sarasota-pool', name: 'Building heated pool and spa (historical listing)', category: 'wellness' },
    { id: 'sarasota-garage', name: 'Enclosed two-car garage (historical listing)', category: 'lifestyle' },
  ],
  gallery: [],
  publication_state: 'draft',
  created_at: '',
  updated_at: '',
});

// Owner-supplied historical listing photos. Do not imply that furnishings or access are current.
export const sarasotaUnitPhotos = [
  { src: '/preview-properties/609-golden-gate-pt-unit-402/living-room.webp', alt: 'Historical photo of the Unit 402 living area opening onto a terrace', caption: 'Historical Unit 402 living area; furnishings may have changed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/bathroom.webp', alt: 'Historical photo of a bathroom with double vanity and glass shower', caption: 'Historical Unit 402 bathroom photo.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/shower.webp', alt: 'Historical photo of the glass-enclosed shower and bathroom', caption: 'Another historical view of a Unit 402 bathroom.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/bathroom-tub.webp', alt: 'Historical photo of a bathroom with double vanity and freestanding tub', caption: 'Historical Unit 402 bathroom photo; fixtures should be confirmed before a rental is offered.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/bedroom.webp', alt: 'Historical photo of a bedroom with a bed and tall windows', caption: 'Historical Unit 402 bedroom photo; furnishings may have changed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/pearl-entrance.webp', alt: 'Historical photo of The Pearl condominium entrance', caption: 'Historical photo of The Pearl building entrance; Teams Management manages Unit 402 only.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/kitchen-living.webp', alt: 'Historical photo of the open kitchen and living area in Unit 402', caption: 'Historical Unit 402 interior photo; furnishings may have changed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/kitchen-dining.webp', alt: 'Historical photo of the kitchen island, cooktop, and dining area', caption: 'Historical Unit 402 kitchen photo; appliances and furnishings should be confirmed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/kitchen-to-living.webp', alt: 'Historical view from the kitchen toward the living area and terrace', caption: 'Historical Unit 402 interior photo; furnishings may have changed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/interior-terrace.webp', alt: 'Historical interior photo showing two lounge chairs beside a terrace', caption: 'Historical Unit 402 interior photo; furnishings may have changed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/interior-reverse.webp', alt: 'Historical interior photo showing lounge chairs, television, and an adjoining bathroom', caption: 'Another view of the same room in the historical listing.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/building-waterfront.webp', alt: 'Aerial view of The Pearl and the nearby waterfront', caption: 'Historical aerial view of The Pearl and its waterfront surroundings.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/building-pool.webp', alt: 'Aerial view of The Pearl, nearby waterfront, and pool area', caption: 'Historical building aerial; confirm current amenity access with Teams Management.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/garage-402.webp', alt: 'Historical photo of the garage door marked 402', caption: 'Historical photo of the garage marked 402; confirm current parking rights with Teams Management.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/pool.webp', alt: 'Historical photo of the condominium pool', caption: 'Historical building pool photo; confirm current amenity access with Teams Management.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/pool-deck.webp', alt: 'Historical photo of the condominium pool deck and lounge chairs', caption: 'Another historical view of the pool area; amenity access should be confirmed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/waterfront-view.webp', alt: 'Historical view toward the Sarasota waterfront from Golden Gate Point', caption: 'Historical neighborhood waterfront view; not a verified view from Unit 402.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/terrace-view.webp', alt: 'Historical photo of a terrace overlooking the waterfront', caption: 'Historical terrace photo; furnishings and views should be confirmed before a rental is offered.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/laundry.webp', alt: 'Historical photo of a laundry room with washer and dryer', caption: 'Historical interior photo; appliance availability should be confirmed.' },
  { src: '/preview-properties/609-golden-gate-pt-unit-402/office.webp', alt: 'Historical photo of an office with two desks', caption: 'Historical interior photo; furniture is not represented as included.' },
];
