// Public, building-level aggregates manually reviewed from the supplied source records.
// Never import the source workbook: it contains tenant names and financial records.
// This preview-only projection intentionally omits occupants, rents, lease dates, and unit IDs.
export interface PreviewBuildingFacts {
  apartments: number;
  residentialFloors?: string;
  bedroomMix?: string;
  sizeRange?: string;
  retail?: string[];
}

export const previewBuildingFacts: Record<string, PreviewBuildingFacts> = {
  '42-70-156th-st-flushing': { apartments: 36, residentialFloors: '1–4', bedroomMix: '1–3 bedrooms', sizeRange: '565–1,150 sq ft' },
  '170-e-118th-st': { apartments: 33, bedroomMix: '1–2 bedrooms', sizeRange: '390–500 sq ft', retail: ["Benjamin’s Breakfast & More", "Pipo’s Restaurant"] },
  '166-e-118th-st': { apartments: 33, bedroomMix: '1–2 bedrooms', sizeRange: '390–500 sq ft', retail: ['Pipos Restaurant', 'Lotus Thai Kitchen'] },
  '1365-1st-ave': { apartments: 12, residentialFloors: '2–4', retail: ['Mexiterranean Restaurant', 'Maria Cortes NY Salon'] },
  '349-351-w-46th-st': { apartments: 12, residentialFloors: '1–3', bedroomMix: 'Studios', sizeRange: '315–460 sq ft', retail: ['JazzCultural'] },
  '1374-1st-ave': { apartments: 14, residentialFloors: '1–4', retail: ['Delizia Restaurant'] },
  '71-e-110th-st': { apartments: 10, residentialFloors: '2–6', bedroomMix: '2 bedrooms', sizeRange: '1,080 sq ft' },
  '1626-2nd-ave': { apartments: 9, residentialFloors: '1–4', bedroomMix: 'Studios–2 bedrooms', sizeRange: '350–690 sq ft' },
  '225-e-83rd-st': { apartments: 12, residentialFloors: '1–5', bedroomMix: 'Studios–3 bedrooms', sizeRange: '350–850 sq ft', retail: ['NY Sang Yuan Body Works'] },
  '235-w-18th-st': { apartments: 20, residentialFloors: '1–5', bedroomMix: '1 bedroom', sizeRange: '350–450 sq ft' },
  '41-w-46th-st': { apartments: 8, residentialFloors: '2–5', bedroomMix: 'Studios and 2 bedrooms', sizeRange: '460–990 sq ft', retail: ['Mala Project'] },
  '171-e-74th-st': { apartments: 9, residentialFloors: '3–5', bedroomMix: 'Studios and 1 bedroom', sizeRange: '415–600 sq ft' },
  '307-w-39th-st': { apartments: 16, residentialFloors: '2–5', retail: ['Hot Pot'] },
};
