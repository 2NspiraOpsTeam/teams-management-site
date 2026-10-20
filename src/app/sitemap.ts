import type { MetadataRoute } from 'next';
import { publicPages, reviewSite, siteOrigin } from '@/lib/site-seo';
import { listPublicBuildings } from '@/lib/public-buildings';
import { listPublicRetail } from '@/lib/public-retail';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  // Review portfolio records are not a production publication decision.
  if(reviewSite)return [];
  const [buildings,retail]=await Promise.all([listPublicBuildings(),listPublicRetail()]);
  const paths=[...publicPages,...buildings.map(b=>`/properties/${b.slug}`),...retail.map(b=>`/retail/${b.slug}`)];
  return [...new Set(paths)].map(path=>({url:new URL(path,siteOrigin).href}));
}
