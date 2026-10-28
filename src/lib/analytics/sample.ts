import type {AnalyticsReport} from './shared';

/** Display-only illustration. Never stored or submitted to the reporting service. */
export function sampleAnalytics(days: number, now = new Date()): AnalyticsReport {
  const daily = Array.from({length: days}, (_, i) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - days + 1 + i);
    const views = 35 + (i * 17 % 53) + Math.floor(i / 7) * 3;
    return {day: date.toISOString().slice(0, 10), views, visits: Math.floor(views * .62)};
  });
  const views = daily.reduce((sum, row) => sum + row.views, 0);
  const split = (labels: string[], weights: number[]) => {
    let remaining = views;
    return labels.map((label, i) => {
      const count = i === labels.length - 1 ? remaining : Math.floor(views * weights[i]);
      remaining -= count;
      return {label, views: count};
    });
  };
  const segments = split(['Residential', 'Retail', 'Other public pages'], [.58, .24, .18]);
  const propertyViews = Math.floor(views * .4);
  return {
    state: 'ready', days, generatedAt: now.toISOString(), host: 'Sample data · not real visitors',
    totals: {views, visits: daily.reduce((sum, row) => sum + row.visits, 0), propertyViews}, daily, segments,
    devices: split(['Mobile', 'Desktop', 'Tablet'], [.61, .32, .07]),
    channels: split(['Search', 'Direct / unknown', 'Social', 'Other referrals'], [.43, .35, .14, .08]),
    countries: split(['United States', 'Canada', 'United Kingdom', 'Other / unknown'], [.78, .09, .06, .07]),
    properties: [
      {name: 'Sample residential property', path: '/sample-residential', segment: 'residential', views: Math.floor(propertyViews * .7)},
      {name: 'Sample retail property', path: '/sample-retail', segment: 'retail', views: propertyViews - Math.floor(propertyViews * .7)},
    ],
    pages: split(['/', '/properties', '/retail', '/contact'], [.4, .32, .18, .1]),
  };
}
