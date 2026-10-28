import type { NeighborhoodVideoData } from '@/components/neighborhood-video';
// Preview-only editorial context. These are area guides, not claims about the
// property's vacancy, foot traffic, transit distance, or BID membership.
type Neighborhood = { name: string; context: string; guide: string; guideLabel: string; image: string; imageAlt: string; credit: string; creditUrl: string; license: string; licenseUrl?: string; video?: NeighborhoodVideoData };
const areas = {
  throggsNeck: { name: 'Throggs Neck', context: 'Explore the East Tremont Avenue setting and the wider Throggs Neck business community.', guide: 'https://www.throggsneckbid.com/', guideLabel: 'Throggs Neck business guide', image: '/preview-properties/neighborhoods/throggs-neck.jpg', imageAlt: 'A view of Throggs Neck in the Bronx', credit: 'D. Benjamin Miller', creditUrl: 'https://commons.wikimedia.org/wiki/File:Throggs_Neck.jpg', license: 'CC0' },
  flushing: { name: 'Flushing', context: 'Flushing is known for its varied restaurants, shops, and cultural destinations across Queens.', guide: 'https://www.nyctourism.com/new-york/queens/flushing/', guideLabel: 'Explore Flushing', image: '/preview-properties/neighborhoods/flushing.jpg', imageAlt: 'A street scene in Flushing, Queens', credit: 'Epicgenius', creditUrl: 'https://commons.wikimedia.org/wiki/File:Flushing_Queens_May_2025_145.jpg', license: 'CC BY-SA 4.0' },
  eastHarlem: { name: 'East Harlem', context: 'East Harlem’s cultural institutions, shops, and restaurants reflect its longstanding Latin, Caribbean, and African American communities.', guide: 'https://www.nyctourism.com/new-york/manhattan/east-harlem/', guideLabel: 'Explore East Harlem', image: '/preview-properties/neighborhoods/east-harlem.jpg', imageAlt: 'Second Avenue at East 116th Street in East Harlem', credit: 'PrecipiceofDuck', creditUrl: 'https://commons.wikimedia.org/wiki/File:2nd_Avenue_and_East_116th_Street.jpg', license: 'CC BY-SA 4.0' },
  upperEastSide: { name: 'Upper East Side', context: 'The Upper East Side brings together neighborhood shopping, restaurants, and cultural destinations.', guide: 'https://www.nyctourism.com/new-york/manhattan/upper-east-side/', guideLabel: 'Explore the Upper East Side', image: '/preview-properties/neighborhoods/upper-east-side.jpg', imageAlt: 'East 86th Street in the Upper East Side', credit: 'Jim.henderson', creditUrl: 'https://commons.wikimedia.org/wiki/File:East_86th_Street_Cinemas_2025_jeh.jpg', license: 'CC BY-SA 4.0' },
  restaurantRow: { name: 'Restaurant Row', context: 'Discover Restaurant Row, the dining destination on West 46th Street between Eighth and Ninth Avenues, west of this Midtown address. Explore international restaurants and the wider Theater District through the Times Square Alliance guide.', guide: 'https://www.timessquarenyc.org/explore/restaurant-row', guideLabel: 'Explore Restaurant Row', image: '/preview-properties/neighborhoods/restaurant-row.jpg', imageAlt: 'Restaurant Row on West 46th Street, looking west toward Ninth Avenue in June 2007', credit: 'Laslovarga', creditUrl: 'https://commons.wikimedia.org/wiki/File:Restaurant_Row_0473New_York_City.JPG', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', video: { id: '4KHAC74CS3w', title: 'Restaurant Row', channel: 'Times Square NYC', startSeconds: 35 } },
  midtown: { name: 'Midtown', context: 'Midtown combines workplaces, dining, shopping, and some of New York’s best-known visitor destinations.', guide: 'https://www.nyctourism.com/new-york/manhattan/midtown/', guideLabel: 'Explore Midtown', image: '/preview-properties/neighborhoods/midtown.jpg', imageAlt: 'A street scene in Midtown Manhattan', credit: 'Frank Schulenburg', creditUrl: 'https://commons.wikimedia.org/wiki/File:Motorcyclist_in_Midtown_Manhattan-L1002704.jpg', license: 'CC BY-SA 4.0' },
  hellsKitchen: { name: 'Hell’s Kitchen', context: 'West of Times Square, Hell’s Kitchen is known for its international dining and theater scene.', guide: 'https://www.nyctourism.com/new-york/manhattan/hells-kitchen/', guideLabel: 'Explore Hell’s Kitchen', image: '/preview-properties/neighborhoods/hells-kitchen.jpg', imageAlt: 'A street scene in Hell’s Kitchen', credit: 'Epicgenius', creditUrl: 'https://commons.wikimedia.org/wiki/File:Hell%27s_Kitchen_Oct_2025_45.jpg', license: 'CC BY-SA 4.0' },
  chelsea: { name: 'Chelsea', context: 'Chelsea’s mix of galleries, restaurants, and neighborhood shops shapes its commercial streets.', guide: 'https://www.nyctourism.com/new-york/manhattan/chelsea/', guideLabel: 'Explore Chelsea', image: '/preview-properties/neighborhoods/chelsea.jpg', imageAlt: 'West 23rd Street in Chelsea', credit: 'Tdorante10', creditUrl: 'https://commons.wikimedia.org/wiki/File:23rd_St_8th_Av_td_(2023-08-19)_12a_-_Chelsea_Cinemas.jpg', license: 'CC BY-SA 4.0' },
  lowerManhattan: { name: 'Lower Manhattan', context: 'Lower Manhattan combines historic sites, workplaces, cultural landmarks, and dining.', guide: 'https://www.nyctourism.com/new-york/manhattan/lower-manhattan/', guideLabel: 'Explore Lower Manhattan', image: '/preview-properties/neighborhoods/lower-manhattan.jpg', imageAlt: 'Water Street in Lower Manhattan', credit: 'Tdorante10', creditUrl: 'https://commons.wikimedia.org/wiki/File:Water_St_Hanover_Sq_Old_Slip_td_(2018-08-09)_06_-_10_Hanover_Square.jpg', license: 'CC BY-SA 4.0' },
  sarasota: { name: 'Sarasota Bay', context: 'Golden Gate Point sits near downtown Sarasota and the bayfront. Explore the wider waterfront setting and local destinations.', guide: 'https://www.visitsarasota.com/communities/downtown-sarasota', guideLabel: 'Explore downtown Sarasota', image: '/preview-properties/neighborhoods/sarasota.jpg', imageAlt: 'Sarasota Bay Bridge and surrounding waterfront', credit: 'Roger W', creditUrl: 'https://commons.wikimedia.org/wiki/File:Sarasota_Bay_Bridge_from_the_south_(2010).jpg', license: 'CC BY-SA 2.0' },
} satisfies Record<string, Neighborhood>;

const bySlug: Record<string, Neighborhood> = {
  '3425-east-tremont-bronx': areas.throggsNeck,
  '609-golden-gate-pt': areas.sarasota,
  '42-70-156th-st-flushing': areas.flushing,
  '71-e-110th-st': areas.eastHarlem,
  '166-e-118th-st': areas.eastHarlem,
  '170-e-118th-st': areas.eastHarlem,
  '173-e-91st-st': areas.upperEastSide,
  '1626-2nd-ave': areas.upperEastSide,
  '225-e-83rd-st': areas.upperEastSide,
  '171-e-74th-st': areas.upperEastSide,
  '1374-1st-ave': areas.upperEastSide,
  '1365-1st-ave': areas.upperEastSide,
  '41-w-46th-st': areas.restaurantRow,
  '349-351-w-46th-st': areas.hellsKitchen,
  '351-w-46th-st': areas.hellsKitchen,
  '307-w-39th-st': areas.midtown,
  '235-w-18th-st': areas.chelsea,
  '61-gold-st': areas.lowerManhattan,
};

export function previewRetailNeighborhood(slug: string): Neighborhood | null {
  return bySlug[slug] ?? null;
}

export function previewResidenceNeighborhood(slug: string): Neighborhood | null {
  return bySlug[slug] ?? null;
}
