export const publicPages = ['/', '/properties', '/retail', '/rent-with-us', '/about', '/services', '/contact', '/dining', '/gallery', '/tenant-services', '/privacy-policy', '/accessibility', '/fair-housing', '/copyright', '/terms-of-use', '/terms-and-conditions'];
export type AnalyticsRow = {label: string; views: number};
export type AnalyticsReport = {
  state: 'ready' | 'setup'; days: number; generatedAt: string; host?: string;
  totals: {views: number; visits: number; propertyViews: number};
  daily: {day: string; views: number; visits: number}[];
  segments: AnalyticsRow[]; devices: AnalyticsRow[]; channels: AnalyticsRow[];
  properties: {name: string; path: string; segment: string; views: number}[];
  pages: AnalyticsRow[];
};
