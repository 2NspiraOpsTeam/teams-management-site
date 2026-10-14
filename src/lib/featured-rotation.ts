/** Stable UTC-week schedule. Every eligible property receives the same exposure
 * across a full cycle; page slots are distinct when the pool is large enough. */
export const featuredSlots = ['home:0', 'home:1', 'home:2', 'home:showcase', 'about', 'properties', 'retail', 'rent-with-us', 'gallery', 'contact', 'tenant-services', 'dining'] as const;
export type FeaturedSlot = typeof featuredSlots[number];

export function utcWeek(now = new Date()): number {
  return Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
}

export function rotateFeatured<T extends { property_slug: string }>(items: T[], slot: FeaturedSlot, week = utcWeek()): T | null {
  const pool = [...new Map(items.map(item => [item.property_slug, item])).values()]
    .sort((a, b) => a.property_slug.localeCompare(b.property_slug));
  if (!pool.length) return null;
  const offset = featuredSlots.indexOf(slot);
  return pool[((week + offset) % pool.length + pool.length) % pool.length];
}

export function featuredOrder<T extends { property_slug: string }>(items: T[], slot: FeaturedSlot, week = utcWeek()): T[] {
  const pool = [...new Map(items.map(item => [item.property_slug, item])).values()]
    .sort((a, b) => a.property_slug.localeCompare(b.property_slug));
  if (!pool.length) return [];
  const first = rotateFeatured(pool, slot, week)!;
  const index = pool.findIndex(item => item.property_slug === first.property_slug);
  return [...pool.slice(index), ...pool.slice(0, index)];
}
