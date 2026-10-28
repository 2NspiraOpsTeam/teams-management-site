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

// Cache only numeric slot indexes, never imagery or publication state. Bounded per isolate.
const schedules = new Map<string, Map<FeaturedSlot, number>[]>();
/** Reserve constrained retail first, then allocate a collision-free, non-repeating visit plan. */
export function allocateFeatured<T extends { property_slug: string; property_id: string }>(
  candidates: T[], retailIds: ReadonlySet<string>, visit: number,
): { slots: Map<FeaturedSlot, T | null>; dining: T[] } {
  const pool = [...new Map(candidates.map(item => [item.property_slug, item])).values()]
    .sort((a,b) => a.property_slug.localeCompare(b.property_slug));
  const retail = pool.map((item,index)=>retailIds.has(item.property_id)?index:-1).filter(index=>index>=0);
  const period = Math.max(1, pool.length * Math.max(1,retail.length));
  const key = JSON.stringify([pool.map(item=>[item.property_slug,item.property_id]),retail]);
  let schedule = schedules.get(key);
  if (!schedule) {
    schedule = [];
    for (let cursor=0;cursor<period;cursor++) {
      const plan = new Map<FeaturedSlot, number>();
      const used = new Set<number>();
      const previous = schedule[cursor-1];
      const next = cursor === period-1 ? schedule[0] : undefined;
      // Restricted slots cannot be starved by unconstrained pages consuming their candidates.
      for (const slot of ['retail', ...featuredSlots.filter(slot=>slot!=='retail')] as FeaturedSlot[]) {
        const indexes = slot === 'retail' ? retail : pool.map((_,index)=>index);
        const offset = (cursor + featuredSlots.indexOf(slot)) % Math.max(1,indexes.length);
        const ordered = [...indexes.slice(offset),...indexes.slice(0,offset)];
        const fresh = (index:number) => index !== previous?.get(slot) && index !== next?.get(slot);
        const selected = ordered.find(index=>!used.has(index)&&fresh(index))
          ?? ordered.find(index=>!used.has(index))
          ?? ordered.find(fresh) ?? ordered[0];
        if(selected!==undefined){plan.set(slot,selected);used.add(selected);}
      }
      schedule.push(plan);
    }
    if(schedules.size>=8)schedules.delete(schedules.keys().next().value!);
    schedules.set(key,schedule);
  }
  const selected = schedule[((visit%period)+period)%period];
  const slots = new Map(featuredSlots.map(slot=>[slot, pool[selected.get(slot) ?? -1] ?? null] as const));
  const chosen = slots.get('dining');
  const usedElsewhere = new Set([...slots.entries()].filter(([slot])=>slot!=='dining').map(([,item])=>item?.property_slug));
  const ordered = featuredOrder(pool,'dining',visit);
  const rest = ordered.filter(item=>item.property_slug!==chosen?.property_slug);
  return {slots,dining:[...(chosen?[chosen]:[]),...rest.filter(item=>!usedElsewhere.has(item.property_slug)),...rest.filter(item=>usedElsewhere.has(item.property_slug))]};
}
