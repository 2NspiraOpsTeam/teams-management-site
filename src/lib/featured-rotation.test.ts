import { describe, expect, it } from 'vitest';
import { featuredSlots, rotateFeatured } from './featured-rotation';

const pool = Array.from({length: 18}, (_, index) => ({property_slug: `property-${String(index).padStart(2, '0')}`}));

describe('weekly featured schedule', () => {
  it('covers every eligible property over one cycle', () => {
    for (const slot of featuredSlots) {
      const shown = new Set(Array.from({length: pool.length}, (_, week) => rotateFeatured(pool, slot, week)?.property_slug));
      expect(shown.size).toBe(pool.length);
    }
  });

  it('assigns distinct properties across page slots when enough are eligible', () => {
    for (let week = 0; week < pool.length; week++) {
      const shown = featuredSlots.map(slot => rotateFeatured(pool, slot, week)?.property_slug);
      expect(new Set(shown).size).toBe(featuredSlots.length);
    }
  });

  it('is insensitive to database row order and has no result without approved media', () => {
    expect(rotateFeatured(pool, 'about', 3000)).toEqual(rotateFeatured([...pool].reverse(), 'about', 3000));
    expect(rotateFeatured([], 'about', 3000)).toBeNull();
  });
});
