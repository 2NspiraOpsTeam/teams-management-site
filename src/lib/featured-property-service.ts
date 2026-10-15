import type { D1Database } from '@cloudflare/workers-types';
import { currentVisit, allocateFeatured, type FeaturedSlot } from './featured-rotation';
import { eligibleShowcases, type Showcase } from './page-showcase';
import { listPublicRetail } from './public-retail';
import { previewPortfolioEnabled, sarasotaBuildingPhotos } from './preview-portfolio';

export async function featuredPropertyService(db: D1Database) {
  const [visit, eligible, retail] = await Promise.all([currentVisit(), eligibleShowcases(db), listPublicRetail()]);
  const candidates = [...eligible];
  if (previewPortfolioEnabled && !candidates.some(item => item.property_slug === '609-golden-gate-pt')) {
    candidates.push({ property_id: 'preview-sarasota', property_slug: '609-golden-gate-pt', property_name: '609 Golden Gate Pt', address_json: '{}', media_asset_id: 'preview-sarasota', storage_key: sarasotaBuildingPhotos[0].src, image: sarasotaBuildingPhotos[0].src, alt_text: sarasotaBuildingPhotos[0].alt, caption: null });
  }
  const plan = allocateFeatured(candidates, new Set(retail.map(item => item.id)), visit);
  return { ...plan, eligible: candidates, select: (slot: FeaturedSlot): Showcase | null => plan.slots.get(slot) ?? null };
}
