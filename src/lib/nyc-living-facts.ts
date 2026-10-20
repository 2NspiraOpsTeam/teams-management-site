// NYC Planning PLUTO 26v2, queried 2026-10-11 by exact address and parcel.
// Parcel-wide or ambiguous multi-address matches are intentionally omitted.
// https://data.cityofnewyork.us/resource/64uk-42ks
const facts: Record<string, { zip: string; yearBuilt?: number; bbl?: string }> = {
  '42-70-156th-st-flushing': { zip: '11355', yearBuilt: 1926, bbl: '4053860020' },
  '3425-east-tremont-bronx': { zip: '10465' },
  '166-e-118th-st': { zip: '10035', yearBuilt: 1910, bbl: '1016450044' },
  '170-e-118th-st': { zip: '10035', yearBuilt: 1910, bbl: '1016450041' },
  '71-e-110th-st': { zip: '10029', yearBuilt: 2014, bbl: '1016160030' },
  '173-e-91st-st': { zip: '10128', yearBuilt: 1910, bbl: '1015200034' },
  '1626-2nd-ave': { zip: '10028', yearBuilt: 1920, bbl: '1015470002' },
  '225-e-83rd-st': { zip: '10028', yearBuilt: 1925, bbl: '1015290014' },
  '171-e-74th-st': { zip: '10021', yearBuilt: 1910, bbl: '1014090031' },
  '1374-1st-ave': { zip: '10021', yearBuilt: 1910, bbl: '1014680003' },
  '1365-1st-ave': { zip: '10021', yearBuilt: 1910, bbl: '1014480025' },
  '41-w-46th-st': { zip: '10036', yearBuilt: 1920, bbl: '1012620018' },
  '349-351-w-46th-st': { zip: '10036' },
  '351-w-46th-st': { zip: '10036' },
  '307-w-39th-st': { zip: '10018', yearBuilt: 1920, bbl: '1007630031' },
  '235-w-18th-st': { zip: '10011', yearBuilt: 1901, bbl: '1007680017' },
  '61-gold-st': { zip: '10038' },
};

export function nycLivingFacts(slug: string) { return facts[slug]; }

export function greatSchoolsZipUrl(zip: string) {
  return `https://www.greatschools.org/search/search.page?zip=${encodeURIComponent(zip)}`;
}
