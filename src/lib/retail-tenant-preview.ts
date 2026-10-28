// Preview-only editorial projection of the client-supplied October 2026 workbook.
// Do not infer current occupancy, street-level storefronts, or availability.
// Add websites only after independently matching the business and property address.
export type CommercialSpace = { name: string; spaces?: string; area?: string; note?: string; website?: string };
export type CommercialDirectory = { heading: string; entries: CommercialSpace[]; note?: string };
export const commercialDirectory: Record<string, CommercialDirectory> = {
  '42-70-156th-st-flushing': { heading: 'Listed office occupants', entries: [
    { name: 'New York Symphony Church', spaces: 'Office A' }, { name: 'AI DentTech Inc.', spaces: 'Office C' }
  ] },
  '170-e-118th-st': { heading: 'Listed commercial occupants', entries: [
    { name: "Benjamin's Breakfast & More Corp.", spaces: 'STORE 1' }, { name: "Pipo's Restaurant", spaces: 'STORE 2' }
  ] },
  '166-e-118th-st': { heading: 'Listed commercial occupants', entries: [
    { name: 'Pipos Restaurant', spaces: 'STORE 1', website: 'https://piposrestaurant0898.s4shops.com/' }, { name: 'Lotus Thai Kitchen 6359 Inc.', spaces: 'STORE A&B' },
    { name: 'Ana Molina(Ines Cruz)', spaces: 'STORAGE', note: 'Storage, not a storefront.' }
  ], note: 'Store and storage entries are shown separately.' },
  '1365-1st-ave': { heading: 'Retail spaces at 1365 First Avenue', entries: [
    { name: 'Mexiterranean Restaurant', spaces: 'STORE', area: '750 sq ft ground floor · 200 sq ft basement', website: 'https://mexiterraneangrillnyc.com/' },
    { name: 'Maria Cortes NY Salon', spaces: 'STORE', website: 'https://www.mariacortesny.com/' }
  ] },
  '1374-1st-ave': { heading: 'Listed commercial occupant', entries: [
    { name: 'Delizia Restaurant Corp.', spaces: 'STORE', website: 'https://delizia73.com/' }
  ] },
  '1626-2nd-ave': { heading: 'Listed commercial occupant', entries: [
    { name: '1626 Restaurant Group LLC dba FUMO', spaces: 'STORE', area: '1,900 sq ft', website: 'https://www.fumorestaurant.com/location/fumo-upper-east-side/' }
  ] },
  '225-e-83rd-st': { heading: 'Listed commercial occupant', entries: [
    { name: 'NY Sang Yuan Body Works', spaces: 'STORE · Lower Level', area: '1,535 sq ft', website: 'https://nysangyuanbodyworks.com/' }
  ] },
  '235-w-18th-st': { heading: 'Listed commercial occupants', entries: [
    { name: 'LEN CS Co LTD | Salon', spaces: 'BE', area: '650 sq ft' },
    { name: 'Nicholas Jones d/b/a Manhattan Tattoos', spaces: 'BR', website: 'https://manhattantattoosnyc.com/' },
    { name: 'Tamy NY Inc. Hair Salon', spaces: 'BW' }
  ] },
  '41-w-46th-st': { heading: 'Listed commercial occupant', entries: [
    { name: 'Mala Midtown LLC dba Mala Project', spaces: 'STORE', area: '2,000 sq ft', website: 'https://www.malaproject.com/' }
  ] },
  '349-351-w-46th-st': { heading: 'Listed commercial occupant', entries: [
    { name: 'JazzCultural LLC', spaces: 'STORE', website: 'https://www.jazzcultural.com/' }
  ] },
  '171-e-74th-st': { heading: 'Listed commercial occupants', entries: [
    { name: 'Neurothareputix LLC c/o Dr. Robert Scolnick', spaces: '1-1, 1-2, 1-3 and Mezz', website: 'https://neurotherapeutixnyc.com/contact-us/' },
    { name: 'Caspare Physical Therapy Wellness P.C.', spaces: '1-4, 2F and 2R', website: 'https://www.phitwell.com/' },
    { name: 'Dr. Vincent Appow', spaces: 'C-1', area: '441 sq ft' },
    { name: 'Dr. Roger Wolfsohn', spaces: 'C-2', area: '250 sq ft' },
    { name: 'Samuel Lippin PT', spaces: 'C-3', area: '260 sq ft', website: 'https://samlippinpt.com/' },
    { name: 'Kristen R Riani', spaces: 'C-4', area: '260 sq ft', website: 'https://www.kristenriani.com/' },
    { name: 'Elizabeth Wolff d/b/a Wampum Capital LLC', spaces: '6TH FlOOR OFFICE' }
  ], note: 'These are commercial spaces across multiple floors, not seven confirmed street-level storefronts.' },
  '307-w-39th-st': { heading: 'Listed commercial occupant', entries: [
    { name: 'HOT POT', spaces: 'STORE', area: '1st floor: 2,366.08 sq ft · basement: 955.86 sq ft · total: 3,321.94 sq ft', website: 'https://www.houhotpot.com/' }
  ] }
};
