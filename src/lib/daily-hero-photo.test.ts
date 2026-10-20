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
