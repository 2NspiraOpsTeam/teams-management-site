/** A visit advances one position; slot offsets keep simultaneous showcases distinct. */
import { cookies } from 'next/headers';
export const featuredSlots = ['home:0', 'home:1', 'home:2', 'home:showcase', 'about', 'properties', 'retail', 'rent-with-us', 'gallery', 'contact', 'tenant-services', 'dining'] as const;
export type FeaturedSlot = typeof featuredSlots[number];
export const visitCookie = 'teams_feature_visit';
export const cursorCookie = 'teams_feature_cursor';

export async function currentVisit(): Promise<number> {
  const value = (await cookies()).get(visitCookie)?.value;
  const parsed = Number(value);
  return value && Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function rotateFeatured<T extends { property_slug: string }>(items: T[], slot: FeaturedSlot, visit: number): T | null {
  const pool = [...new Map(items.map(item => [item.property_slug, item])).values()]
    .sort((a, b) => a.property_slug.localeCompare(b.property_slug));
  if (!pool.length) return null;
  const offset = featuredSlots.indexOf(slot);
  return pool[((visit + offset) % pool.length + pool.length) % pool.length];
}

export function featuredOrder<T extends { property_slug: string }>(items: T[], slot: FeaturedSlot, visit: number): T[] {
  const pool = [...new Map(items.map(item => [item.property_slug, item])).values()]
    .sort((a, b) => a.property_slug.localeCompare(b.property_slug));
  if (!pool.length) return [];
  const first = rotateFeatured(pool, slot, visit)!;
  const index = pool.findIndex(item => item.property_slug === first.property_slug);
  return [...pool.slice(index), ...pool.slice(0, index)];
}

/** One deterministic, visit-wide allocation for every public featured-property slot. */
export function allocateFeatured<T extends { property_slug: string; property_id: string }>(
  candidates: T[], retailIds: ReadonlySet<string>, visit: number,
): { slots: Map<FeaturedSlot, T | null>; dining: T[] } {
  const unique = [...new Map(candidates.map(item => [item.property_slug, item])).values()];
  const slots = new Map<FeaturedSlot, T | null>();
  const occupied = new Set<string>();
  for (const slot of featuredSlots) {
    const pool = slot === 'retail' ? unique.filter(item => retailIds.has(item.property_id)) : unique;
    const ordered = featuredOrder(pool, slot, visit);
    const selected = ordered.find(item => !occupied.has(item.property_slug)) ?? ordered[0] ?? null;
    slots.set(slot, selected);
    if (selected) occupied.add(selected.property_slug);
  }
  const diningOrder = featuredOrder(unique, 'dining', visit);
  const dining = [...diningOrder.filter(item => ![...slots.entries()].some(([slot, chosen]) => slot !== 'dining' && chosen?.property_slug === item.property_slug)),
    ...diningOrder.filter(item => [...slots.entries()].some(([slot, chosen]) => slot !== 'dining' && chosen?.property_slug === item.property_slug))];
  return { slots, dining };
}
