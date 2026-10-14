import { describe, expect, it } from 'vitest';
import { featuredSlots, rotateFeatured, allocateFeatured } from './featured-rotation';

const pool = Array.from({length: 18}, (_, index) => ({property_slug: `property-${String(index).padStart(2, '0')}`}));

describe('visit-based featured schedule', () => {
  it('covers every eligible property over one cycle', () => {
    for (const slot of featuredSlots) {
      const shown = new Set(Array.from({length: pool.length}, (_, visit) => rotateFeatured(pool, slot, visit)?.property_slug));
      expect(shown.size).toBe(pool.length);
    }
  });

  it('assigns distinct properties across page slots when enough are eligible', () => {
    for (let visit = 0; visit < pool.length; visit++) {
      const shown = featuredSlots.map(slot => rotateFeatured(pool, slot, visit)?.property_slug);
      expect(new Set(shown).size).toBe(featuredSlots.length);
    }
  });

  it('is insensitive to database row order and has no result without approved media', () => {
    expect(rotateFeatured(pool, 'about', 3000)).toEqual(rotateFeatured([...pool].reverse(), 'about', 3000));
    expect(rotateFeatured([], 'about', 3000)).toBeNull();
  });
});


describe('shared featured-property allocation', () => {
  const candidates = pool.map((item, index) => ({...item, property_id: `id-${index}`}));
  it('keeps visit-wide slots distinct and changes them next visit', () => {
    const retail = new Set(candidates.map(item => item.property_id));
    const first = allocateFeatured(candidates, retail, 0);
    const second = allocateFeatured(candidates, retail, 1);
    expect(new Set([...first.slots.values()].map(item => item?.property_slug)).size).toBe(featuredSlots.length);
    for (const slot of featuredSlots) expect(second.slots.get(slot)?.property_slug).not.toBe(first.slots.get(slot)?.property_slug);
    expect(allocateFeatured([...candidates].reverse(), retail, 0).slots).toEqual(first.slots);
  });
});
