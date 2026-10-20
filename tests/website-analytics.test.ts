import {describe,it,expect,vi} from 'vitest';
import {analyticsConfig,analyticsQuery,normalizeAnalytics,cloudflareAnalytics} from '@/lib/analytics/cloudflare';
const env={CF_ANALYTICS_ACCOUNT_ID:'a'.repeat(32),CF_ANALYTICS_SITE_TAG:'b'.repeat(32),CF_ANALYTICS_HOST:'teams.example.com',CF_ANALYTICS_API_TOKEN:'server-only-test'};
const buildings=[{name:'Example property',slug:'example-property',has_retail:1,retail_published:1}];
const row=(count:number,dimensions:Record<string,string>,visits=0)=>({count,dimensions,sum:{visits}});
const groups=()=>({daily:[row(10,{date:'2026-10-20'},3)],pages:[row(4,{requestPath:'/properties/example-property'}),row(2,{requestPath:'/retail/example-property'}),row(3,{requestPath:'/properties'}),row(1,{requestPath:'/'})],devices:[row(7,{deviceType:'Mobile'}),row(3,{deviceType:'Desktop'})],channels:[row(4,{refererHost:'www.google.com'}),row(2,{refererHost:'teams.example.com'}),row(4,{refererHost:''})]});
describe('Cloudflare website intelligence',()=>{
 it('requires an isolated site, exact hostname and server credential',()=>{expect(analyticsConfig({})).toBeNull();expect(analyticsConfig({...env,CF_ANALYTICS_HOST:'https://example.com/'})).toBeNull();expect(analyticsConfig(env)?.host).toBe(env.CF_ANALYTICS_HOST);});
 it('scopes provider query to public paths and exact site/host',()=>{const query=analyticsQuery(analyticsConfig(env)!,buildings,7,new Date('2026-10-20T18:00:00Z'));expect(query).toContain('2026-10-14T00:00:00.000Z');expect(query).toContain('requestHost:"teams.example.com"');expect(query).toContain('siteTag:');expect(query).toContain('/retail/example-property');expect(query).not.toContain('/admin');expect(query).not.toContain('/tenant/login');expect(query).not.toContain(env.CF_ANALYTICS_API_TOKEN);});
 it('does not query unpublished retail paths',()=>{expect(analyticsQuery(analyticsConfig(env)!,[{...buildings[0],retail_published:0}],7)).not.toContain('/retail/example-property');});
 it('zero fills days and separates property detail views from section interest',()=>{const result=normalizeAnalytics(groups(),buildings,7,env.CF_ANALYTICS_HOST,new Date('2026-10-20T18:00:00Z'));expect(result.daily).toHaveLength(7);expect(result.daily[0].views).toBe(0);expect(result.totals).toEqual({views:10,visits:3,propertyViews:6});expect(result.segments.map(r=>r.views)).toEqual([7,2,1]);expect(result.channels).toContainEqual({label:'Search',views:4});expect(result.properties).toHaveLength(2);});
 it('rejects truncated or malformed provider data instead of showing partial totals',()=>{expect(()=>normalizeAnalytics({...groups(),pages:Array(1000).fill(row(1,{requestPath:'/'}))},buildings,7,'example.com')).toThrow('incomplete');expect(()=>normalizeAnalytics({...groups(),daily:[row(-1,{date:'2026-10-20'})]},buildings,7,'example.com')).toThrow('invalid');});
 it('shows setup without calling Cloudflare when credentials are absent',async()=>{const fetcher=vi.fn();const result=await cloudflareAnalytics({},[],30,fetcher);expect(result.state).toBe('setup');expect(fetcher).not.toHaveBeenCalled();});
 it('keeps provider errors and credentials out of public errors',async()=>{const fetcher=vi.fn().mockResolvedValue(Response.json({errors:[{message:'private provider detail'}]}));await expect(cloudflareAnalytics(env,buildings,7,fetcher)).rejects.toThrow('Analytics unavailable');});
 it('uses an authenticated server-side provider request',async()=>{const fetcher=vi.fn().mockResolvedValue(Response.json({data:{viewer:{accounts:[groups()]}}}));expect((await cloudflareAnalytics(env,buildings,7,fetcher)).state).toBe('ready');expect(fetcher.mock.calls[0][0]).toBe('https://api.cloudflare.com/client/v4/graphql');expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer server-only-test');});
});

describe('Admin analytics API boundary',()=>{
 it('guards anonymous access before reading the analytics service',async()=>{
   vi.resetModules();
   const requireAdmin=vi.fn().mockResolvedValue(null);
   vi.doMock('@/lib/admin-auth',()=>({requireAdmin,unauthorized:()=>new Response('{"error":"Unauthorized"}',{status:401,headers:{'Cache-Control':'no-store'}})}));
   const context=vi.fn();vi.doMock('@opennextjs/cloudflare',()=>({getCloudflareContext:context}));
   const {GET}=await import('@/app/api/admin/analytics/route');
   const response=await GET(new Request('https://example.test/api/admin/analytics'));
   expect(response.status).toBe(401);expect(response.headers.get('Cache-Control')).toBe('no-store');expect(context).not.toHaveBeenCalled();
 });
 it('rejects unsupported date ranges and reports missing configuration without zeros as live data',async()=>{
   vi.resetModules();
   const prepare=vi.fn();
   vi.doMock('@/lib/admin-auth',()=>({requireAdmin:async()=>({email:'synthetic@example.test',db:{prepare}}),unauthorized:()=>new Response(null,{status:401})}));
   vi.doMock('@opennextjs/cloudflare',()=>({getCloudflareContext:()=>({env:{}})}));
   const {GET}=await import('@/app/api/admin/analytics/route');
   expect((await GET(new Request('https://example.test/api/admin/analytics?days=999'))).status).toBe(400);
   const response=await GET(new Request('https://example.test/api/admin/analytics?days=7'));
   expect(response.headers.get('Cache-Control')).toBe('no-store');expect((await response.json()).state).toBe('setup');expect(prepare).not.toHaveBeenCalled();
 });
});


describe('Calendar traffic grouping and geography',()=>{
 it('groups Monday weeks across year boundaries without losing counts',async()=>{
  const {aggregateTrend}=await import('@/lib/analytics/shared');
  const rows=[{day:'2025-12-31',views:3,visits:1},{day:'2026-01-01',views:5,visits:2},{day:'2026-01-05',views:2,visits:1}];
  expect(aggregateTrend(rows,'weekly')).toEqual([{day:'2025-12-29',views:8,visits:3},{day:'2026-01-05',views:2,visits:1}]);
  expect(aggregateTrend(rows,'monthly')).toEqual([{day:'2025-12',views:3,visits:1},{day:'2026-01',views:7,visits:3}]);
  expect(aggregateTrend(rows,'daily')).toEqual(rows);
  expect(aggregateTrend([],'monthly')).toEqual([]);
 });
 it('preserves unknown countries and ranks approximate country page views',()=>{
  const report=normalizeAnalytics({...groups(),countries:[row(3,{countryName:''}),row(7,{countryName:'United States'})]},buildings,7,'example.com');
  expect(report.countries).toEqual([{label:'United States',views:7},{label:'Unknown',views:3}]);
  expect(analyticsQuery(analyticsConfig(env)!,buildings,30)).toContain('dimensions{countryName}');
 });
});
