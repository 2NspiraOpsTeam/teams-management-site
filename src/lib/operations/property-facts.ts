// Admin-only operational metadata. Never include in a public/tenant projection.
export const propertyFactFields = [
 ['year_purchased','Year purchased / acquisition notes','text'],
 ['tax_block','Block','text'], ['tax_lot','Lot','text'],
 ['apartment_count','Apartments · property total','number'],
 ['store_count','Stores · property total','number'],
 ['floor_count','Floors','number'],
 ['stabilization_summary','Stabilization / regulation breakdown','text'],
] as const;
