export const publicPages = ['/', '/properties', '/retail', '/rent-with-us', '/about', '/services', '/contact', '/dining', '/gallery', '/tenant-services', '/privacy-policy', '/accessibility', '/fair-housing', '/copyright', '/terms-of-use', '/terms-and-conditions'];
export type AnalyticsRow = {label: string; views: number};
export type AnalyticsReport = {
  state: 'ready' | 'setup'; days: number; generatedAt: string; host?: string;
  totals: {views: number; visits: number; propertyViews: number};
  daily: {day: string; views: number; visits: number}[];
  segments: AnalyticsRow[]; devices: AnalyticsRow[]; channels: AnalyticsRow[];
  properties: {name: string; path: string; segment: string; views: number}[];
  pages: AnalyticsRow[]; countries?: AnalyticsRow[];
};

export type TrendInterval = 'daily' | 'weekly' | 'monthly';
export function aggregateTrend(rows: AnalyticsReport['daily'], interval: TrendInterval) {
  const buckets = new Map<string, {day:string; views:number; visits:number}>();
  for (const row of rows) {
    const date = new Date(`${row.day}T00:00:00Z`);
    if (interval === 'weekly') date.setUTCDate(date.getUTCDate() - (date.getUTCDay()+6)%7);
    if (interval === 'monthly') date.setUTCDate(1);
    const day = date.toISOString().slice(0, interval === 'monthly' ? 7 : 10);
    const bucket = buckets.get(day) || {day, views:0, visits:0};
    bucket.views += row.views; bucket.visits += row.visits; buckets.set(day,bucket);
  }
  return [...buckets.values()].sort((a,b)=>a.day.localeCompare(b.day));
}
