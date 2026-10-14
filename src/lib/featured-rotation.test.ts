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

it('allocates filtered retail slots without collisions and avoids immediate repeats', () => {
  const candidates = pool.slice(0,17).map((item,index)=>({...item,property_id:`id-${index}`}));
  const retail = new Set(['id-1','id-2','id-4','id-6','id-8','id-10','id-12']);
  let prior = allocateFeatured(candidates, retail, 0);
  for (let visit=1; visit<100; visit++) {
    const current=allocateFeatured(candidates,retail,visit);
    expect(new Set([...current.slots.values()].map(item=>item?.property_slug)).size).toBe(featuredSlots.length);
    for(const slot of featuredSlots) expect(current.slots.get(slot)?.property_slug, `${slot} at visit ${visit}`).not.toBe(prior.slots.get(slot)?.property_slug);
    expect(retail.has(current.slots.get('retail')!.property_id)).toBe(true);
    prior=current;
  }
});

it('covers the real-sized cover pool and handles period boundaries with filtered retail', () => {
  const candidates=pool.slice(0,17).map((item,index)=>({...item,property_id:`id-${index}`}));
  for(const count of [1,7,15,16,17]){
    const retail=new Set(candidates.slice(0,count).map(item=>item.property_id));
    const period=candidates.length*count;
    const exposure=new Map(featuredSlots.map(slot=>[slot,new Set<string>()]));
    let previous=allocateFeatured(candidates,retail,0);
    for(let visit=1;visit<=period*2;visit++){
      const current=allocateFeatured(candidates,retail,visit);
      expect(new Set([...current.slots.values()].map(item=>item?.property_slug)).size).toBe(featuredSlots.length);
      for(const slot of featuredSlots){
        exposure.get(slot)!.add(current.slots.get(slot)!.property_slug);
        if(slot!=='retail'||count>1)expect(current.slots.get(slot)?.property_slug,`${slot}, retail pool ${count}, visit ${visit}`).not.toBe(previous.slots.get(slot)?.property_slug);
      }
      previous=current;
    }
    for(const slot of featuredSlots)expect(exposure.get(slot)!.size,`${slot}, retail pool ${count}`).toBe(slot==='retail'?count:candidates.length-(count===1?1:0));
  }
});
