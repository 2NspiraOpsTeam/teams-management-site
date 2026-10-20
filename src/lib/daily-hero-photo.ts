// A calendar-day index, rather than elapsed local hours, also handles DST days.
export function dailyHeroPhoto<T extends { media_asset_id: string }>(photos: T[], now = new Date(), offset = 0): T | null {
  const ordered = [...new Map(photos.map(photo => [photo.media_asset_id, photo])).values()]
    .sort((a, b) => a.media_asset_id.localeCompare(b.media_asset_id));
  if (!ordered.length) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find(part => part.type === type)!.value);
  const day = Math.floor(Date.UTC(value('year'), value('month') - 1, value('day')) / 86400000);
  return ordered[(((day + offset) % ordered.length) + ordered.length) % ordered.length];
}

export const dailyHeroPages = ['about','contact','rent-with-us','properties','retail'] as const;
export type DailyHeroPage = typeof dailyHeroPages[number];
type HeaderPhoto = { media_asset_id:string; image:string; checksum?:string|null };
// Compare original bytes when available, not just asset IDs: the same upload can
// be assigned to both contexts or imported under multiple IDs.
const photoKeys = (photo:HeaderPhoto) => [photo.media_asset_id, photo.image, ...(/^[a-f0-9]{64}$/i.test(photo.checksum||'') ? [photo.checksum!] : [])];
export function dailyHeroPlan<T extends HeaderPhoto>(residential:T[],retail:T[],now=new Date()):Record<DailyHeroPage,T|null> {
  const plan = Object.fromEntries(dailyHeroPages.map(page=>[page,null])) as Record<DailyHeroPage,T|null>;
  const used = new Set<string>();
  // Reserve the constrained retail-only selection first, then allocate the four
  // residential pages. Every page computes this same whole-day plan.
  for (const [page,offset] of [['retail',0],['about',0],['contact',1],['rent-with-us',2],['properties',3]] as const) {
    const pool=(page==='retail'?retail:residential).filter(photo=>!photoKeys(photo).some(key=>used.has(key)));
    const photo=dailyHeroPhoto(pool,now,offset);
    plan[page]=photo;
    if(photo)photoKeys(photo).forEach(key=>used.add(key));
  }
  // If there are too few approved distinct covers, keep a neutral background;
  // never repeat a photo or cross the Residential/Retail publication boundary.
  return plan;
}
