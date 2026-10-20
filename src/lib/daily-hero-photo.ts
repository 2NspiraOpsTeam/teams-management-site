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
