import {highResolutionPhoto} from './photo-variants';
import {preload} from 'react-dom';
import type { CSSProperties } from 'react';
import { adminDb } from './admin-auth';
import { publicShowcases } from './public-showcases';
import { dailyHeroPlan, type DailyHeroPage } from './daily-hero-photo';
import { listPublicRetail } from './public-retail';

export async function dailyHeroStyle(page:DailyHeroPage):Promise<CSSProperties> {
  const db=adminDb();
  const [residential,retail,listed]=await Promise.all([
    publicShowcases(db,true,'residential',true),
    publicShowcases(db,true,'retail',true),
    listPublicRetail(),
  ]);
  const published=new Set(listed.map(item=>item.id));
  const photo=dailyHeroPlan(
    residential.filter(item=>item.property_slug!=='3425-east-tremont-bronx'),
    retail.filter(item=>published.has(item.property_id)),
  )[page];
  if (photo) {
    preload(highResolutionPhoto(photo.image, 960), {as:'image', fetchPriority:'high', media:'(max-width: 767px)'});
    preload(highResolutionPhoto(photo.image), {as:'image', fetchPriority:'high', media:'(min-width: 768px)'});
  }
  // Versioned offline-prepared source; original files and cover selections are retained.
  return {
    '--gold-street-photo':photo?`url(${JSON.stringify(highResolutionPhoto(photo.image))})`:'none',
    '--gold-street-photo-mobile':photo?`url(${JSON.stringify(highResolutionPhoto(photo.image,960))})`:'none',
  } as CSSProperties;
}
