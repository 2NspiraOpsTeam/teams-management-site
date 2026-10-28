import {publicPages, type AnalyticsReport} from './shared';
export type AnalyticsEnv = {CF_ANALYTICS_ACCOUNT_ID?: string; CF_ANALYTICS_SITE_TAG?: string; CF_ANALYTICS_HOST?: string; CF_ANALYTICS_API_TOKEN?: string};
export type AnalyticsBuilding = {name: string; slug: string; has_retail: number; retail_published: number};
type Row = {count: number; dimensions: Record<string,string>; sum: {visits: number}};
type Groups = {daily: Row[]; pages: Row[]; devices: Row[]; channels: Row[]; countries?: Row[]};
export function analyticsConfig(env: AnalyticsEnv) {
  const {CF_ANALYTICS_ACCOUNT_ID:account, CF_ANALYTICS_SITE_TAG:site, CF_ANALYTICS_HOST:host, CF_ANALYTICS_API_TOKEN:token} = env;
  return account && site && host && token && /^[a-f0-9]{32}$/.test(account) && /^[a-f0-9]{32}$/.test(site) && /^(?=.{1,253}$)[a-z0-9]+(?:[.-][a-z0-9]+)*$/.test(host) ? {account,site,host,token} : null;
}
export function analyticsQuery(config: NonNullable<ReturnType<typeof analyticsConfig>>, buildings: AnalyticsBuilding[], days: number, now = new Date()) {
  const since = new Date(now); since.setUTCDate(since.getUTCDate() - days + 1); since.setUTCHours(0,0,0,0);
  const paths = [...publicPages, ...buildings.flatMap(b=>[`/properties/${b.slug}`, ...(b.has_retail && b.retail_published ? [`/retail/${b.slug}`] : [])])];
  const filter = `siteTag:${JSON.stringify(config.site)},requestHost:${JSON.stringify(config.host)},datetime_geq:${JSON.stringify(since.toISOString())},datetime_leq:${JSON.stringify(now.toISOString())},requestPath_in:${JSON.stringify(paths)}`;
  const group = (alias: string, dimension: string, limit: number) => `${alias}:rumPageloadEventsAdaptiveGroups(limit:${limit},filter:{${filter}}){count dimensions{${dimension}}sum{visits}}`;
  return `{viewer{accounts(filter:{accountTag:${JSON.stringify(config.account)}}){${group('daily','date',100)} ${group('pages','requestPath',1000)} ${group('devices','deviceType',20)} ${group('channels','refererHost',1000)} ${group('countries','countryName',300)}}}}`;
}
export function normalizeAnalytics(groups: Groups, buildings: AnalyticsBuilding[], days: number, host: string, now = new Date()): AnalyticsReport {
  for (const [key,limit] of [['daily',100],['pages',1000],['devices',20],['channels',1000]] as const) {
    if (!Array.isArray(groups[key]) || groups[key].length >= limit) throw Error('Analytics incomplete');
    for (const row of groups[key]) if (!Number.isFinite(row.count) || row.count < 0 || !Number.isFinite(row.sum?.visits) || row.sum.visits < 0) throw Error('Analytics invalid');
  }
  if (groups.countries) {
    if (groups.countries.length >= 300) throw Error('Analytics incomplete');
    for (const row of groups.countries) if (!Number.isFinite(row.count) || row.count < 0) throw Error('Analytics invalid');
  }
  const daily = Array.from({length: days}, (_, i) => {
    const date = new Date(now); date.setUTCDate(date.getUTCDate() - days + i + 1);
    const day = date.toISOString().slice(0,10); const row = groups.daily.find(r=>r.dimensions.date === day);
    return {day, views: row?.count || 0, visits: row?.sum.visits || 0};
  });
  const properties = buildings.flatMap(b=>['residential','retail'].flatMap(segment=> {
    const path = `/${segment === 'retail' ? 'retail' : 'properties'}/${b.slug}`;
    const row = groups.pages.find(r=>r.dimensions.requestPath === path);
    return row ? [{name:b.name, path, segment, views:row.count}] : [];
  })).sort((a,b)=>b.views-a.views);
  const segments = ['residential','retail','other'].map(label=>({label:label === 'residential' ? 'Residential' : label === 'retail' ? 'Retail' : 'Other public pages',views:groups.pages.filter(r=>label === 'residential' ? /^\/properties(?:\/|$)/.test(r.dimensions.requestPath) : label === 'retail' ? /^\/retail(?:\/|$)/.test(r.dimensions.requestPath) : !/^\/(?:properties|retail)(?:\/|$)/.test(r.dimensions.requestPath)).reduce((sum,r)=>sum+r.count,0)}));
  // Referrer hosts are provider-reported page-view attribution, not acquisition sessions.
  const channels = new Map<string,number>();
  for (const row of groups.channels) {
    const ref = row.dimensions.refererHost;
    const label = !ref ? 'Direct / unknown' : ref === host ? 'Internal navigation' : /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(ref) ? 'Search' : /(^|\.)(facebook\.com|instagram\.com|linkedin\.com|t\.co|twitter\.com|x\.com|tiktok\.com)$/.test(ref) ? 'Social' : 'Other referrals';
    channels.set(label,(channels.get(label)||0)+row.count);
  }
  return {state:'ready',days,host,generatedAt:now.toISOString(),totals:{views:daily.reduce((s,r)=>s+r.views,0),visits:daily.reduce((s,r)=>s+r.visits,0),propertyViews:properties.reduce((s,r)=>s+r.views,0)},daily,countries:(groups.countries || []).map(r=>({label:r.dimensions.countryName || 'Unknown',views:r.count})).sort((a,b)=>b.views-a.views),segments,properties:properties.slice(0,10),pages:groups.pages.map(r=>({label:r.dimensions.requestPath,views:r.count})).sort((a,b)=>b.views-a.views).slice(0,8),devices:groups.devices.map(r=>({label:r.dimensions.deviceType || 'Unknown',views:r.count})),channels:[...channels].map(([label,views])=>({label,views})).sort((a,b)=>b.views-a.views)};
}
export async function cloudflareAnalytics(env: AnalyticsEnv, buildings: AnalyticsBuilding[], days: number, fetcher = fetch): Promise<AnalyticsReport> {
  const config = analyticsConfig(env);
  if (!config) return {state:'setup',days,generatedAt:new Date().toISOString(),totals:{views:0,visits:0,propertyViews:0},daily:[],segments:[],properties:[],devices:[],channels:[],pages:[]};
  const response = await fetcher('https://api.cloudflare.com/client/v4/graphql', {method:'POST',headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},body:JSON.stringify({query:analyticsQuery(config,buildings,days)}),signal:AbortSignal.timeout(12000)});
  const result = await response.json() as {errors?: unknown; data?: {viewer?: {accounts?: Groups[]}}};
  const groups = result.data?.viewer?.accounts?.[0];
  if (!response.ok || result.errors || !groups) throw Error('Analytics unavailable');
  return normalizeAnalytics(groups,buildings,days,config.host);
}
