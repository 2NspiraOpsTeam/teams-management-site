import type { MetadataRoute } from 'next';
import { reviewSite, siteOrigin } from '@/lib/site-seo';
export default function robots():MetadataRoute.Robots {
  if(reviewSite)return {rules:{userAgent:'*',disallow:'/'}};
  return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/access','/tenant/','/tenant$','/api/','/rent-with-us/apply']},sitemap:`${siteOrigin}/sitemap.xml`,host:siteOrigin};
}
