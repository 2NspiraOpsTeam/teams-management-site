import {NextResponse} from 'next/server';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {requireAdmin, unauthorized} from '@/lib/admin-auth';
import {analyticsConfig, cloudflareAnalytics, type AnalyticsEnv, type AnalyticsBuilding} from '@/lib/analytics/cloudflare';
import type {AnalyticsReport} from '@/lib/analytics/shared';
export const runtime = 'nodejs';
const cache = new Map<string,{until:number; value:Promise<AnalyticsReport>}>();
export async function GET(request: Request) {
  const admin = await requireAdmin(); if (!admin) return unauthorized();
  const days = Number(new URL(request.url).searchParams.get('days') || 30);
  if (![7,30,90].includes(days)) return NextResponse.json({error:'Choose 7, 30 or 90 days.'},{status:400,headers:{'Cache-Control':'no-store'}});
  try {
    const env = getCloudflareContext().env as AnalyticsEnv;
    if (!analyticsConfig(env)) return NextResponse.json(await cloudflareAnalytics(env,[],days),{headers:{'Cache-Control':'no-store'}});
    const rows = await admin.db.prepare("SELECT name,slug,has_retail,retail_published FROM buildings WHERE publication_state='published' ORDER BY id").all<AnalyticsBuilding>();
    const key = JSON.stringify([env.CF_ANALYTICS_ACCOUNT_ID,env.CF_ANALYTICS_SITE_TAG,env.CF_ANALYTICS_HOST,days,rows.results]);
    let entry = cache.get(key);
    if (!entry || entry.until < Date.now()) {
      if (cache.size > 12) cache.clear();
      const value = cloudflareAnalytics(env,rows.results,days);
      entry = {until:Date.now()+300000,value}; cache.set(key,entry);
      value.catch(()=>cache.delete(key));
    }
    return NextResponse.json(await entry.value,{headers:{'Cache-Control':'no-store'}});
  } catch {
    return NextResponse.json({error:'Website analytics are temporarily unavailable. Try again shortly.'},{status:503,headers:{'Cache-Control':'no-store'}});
  }
}
