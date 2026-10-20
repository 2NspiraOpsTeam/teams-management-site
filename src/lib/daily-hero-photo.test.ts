import { describe, expect, it } from 'vitest';
import { dailyHeroPhoto } from './daily-hero-photo';

const photos = ['c', 'a', 'b'].map(media_asset_id => ({ media_asset_id }));
describe('daily page backgrounds', () => {
  it('staggers the three pages and cycles through every eligible image', () => {
    const now = new Date('2026-10-19T12:00:00Z');
    expect(new Set([0, 1, 2].map(offset => dailyHeroPhoto(photos, now, offset)?.media_asset_id)).size).toBe(3);
    expect(dailyHeroPhoto(photos, new Date('2026-10-22T12:00:00Z'))).toEqual(dailyHeroPhoto(photos, now));
  });
  it('stays fixed within a New York day and changes at local midnight', () => {
    const first = dailyHeroPhoto(photos, new Date('2026-10-19T04:00:00Z'));
    expect(dailyHeroPhoto([...photos].reverse(), new Date('2026-10-20T03:59:59Z'))).toEqual(first);
    expect(dailyHeroPhoto(photos, new Date('2026-10-20T04:00:00Z'))).not.toEqual(first);
  });
  it('changes on the calendar boundary across daylight saving time', () => {
    expect(dailyHeroPhoto(photos, new Date('2026-11-02T04:59:59Z')))
      .not.toEqual(dailyHeroPhoto(photos, new Date('2026-11-02T05:00:00Z')));
  });
  it('handles empty, single, and duplicate eligible photos', () => {
    expect(dailyHeroPhoto([])).toBeNull();
    expect(dailyHeroPhoto([photos[0], photos[0]])).toEqual(photos[0]);
  });
});

import { dailyHeroPlan, dailyHeroPages } from './daily-hero-photo';
describe('unique cross-context daily plan',()=>{
  const photo=(id:string,checksum?:string)=>({media_asset_id:id,image:`/${id}.jpg`,checksum});
  it('never repeats a source across all five pages, including shared Residential/Retail covers',()=>{
    const residential=['a','b','c','d','e','f'].map(id=>photo(id));
    for(let day=1;day<=366;day++){
      const now=new Date(Date.UTC(2026,0,day,12));
      const plan=dailyHeroPlan(residential,[residential[0],residential[1]],now);
      expect(new Set(Object.values(plan).map(p=>p?.media_asset_id)).size).toBe(5);
      expect(['a','b']).toContain(plan.retail?.media_asset_id);
      expect(dailyHeroPlan([...residential].reverse(),[residential[1],residential[0]],now)).toEqual(plan);
    }
  });
  it('recognizes duplicate bytes imported with a different asset ID',()=>{
    const checksum='a'.repeat(64);
    const plan=dailyHeroPlan([photo('copy',checksum),...['b','c','d','e'].map(id=>photo(id))],[photo('retail',checksum)]);
    expect(Object.values(plan).some(p=>p?.media_asset_id==='copy')).toBe(false);
    expect(dailyHeroPages.every(page=>plan[page]!==null)).toBe(true);
  });
  it('uses neutral backgrounds instead of duplicates when inventory is insufficient',()=>{
    const same=photo('same');const plan=dailyHeroPlan([same],[same]);
    expect(plan.retail).toEqual(same);
    expect(dailyHeroPages.filter(page=>plan[page]===null)).toHaveLength(4);
  });
});
