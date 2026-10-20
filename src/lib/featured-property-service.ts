import type { D1Database } from '@cloudflare/workers-types';
import { currentVisit, allocateFeatured, type FeaturedSlot } from './featured-rotation';
import type { Showcase } from './page-showcase';
import { publicShowcases } from './public-showcases';
import { listPublicRetail } from './public-retail';

export async function featuredPropertyService(db: D1Database) {
  const [visit, eligible, retail] = await Promise.all([currentVisit(), publicShowcases(db), listPublicRetail()]);
  const candidates = [...eligible];
  const plan = allocateFeatured(candidates, new Set(retail.map(item => item.id)), visit);
  return { ...plan, eligible: candidates, select: (slot: FeaturedSlot): Showcase | null => plan.slots.get(slot) ?? null };
}
