import type { Metadata } from 'next';

export const reviewSite = process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO === '1';
export const siteOrigin = reviewSite ? 'https://teams-management-preview.pages.dev' : 'https://www.teamsmanagement.com';
export function pageMetadata(path:string,title:string,description:string):Metadata {
  const url=new URL(path,siteOrigin).href;
  return {title,description,alternates:{canonical:url},openGraph:{type:'website',siteName:'Teams Management',title,description,url},twitter:{card:'summary',title,description}};
}
export const publicPages = [
  '/', '/about', '/properties', '/retail', '/rent-with-us', '/gallery', '/contact',
  '/tenant-services', '/services', '/dining', '/privacy-policy', '/terms-of-use',
  '/accessibility', '/fair-housing', '/copyright',
] as const;
