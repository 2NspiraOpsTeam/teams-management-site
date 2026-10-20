import type { CSSProperties } from 'react';
import { adminDb } from './admin-auth';
import { eligibleShowcases } from './page-showcase';
import { dailyHeroPlan, type DailyHeroPage } from './daily-hero-photo';
import { listPublicRetail } from './public-retail';

export async function dailyHeroStyle(page:DailyHeroPage):Promise<CSSProperties> {
  const db=adminDb();
  const [residential,retail,listed]=await Promise.all([
    eligibleShowcases(db,true,'residential',true),
    eligibleShowcases(db,true,'retail',true),
    listPublicRetail(),
  ]);
  const published=new Set(listed.map(item=>item.id));
  const photo=dailyHeroPlan(
    residential.filter(item=>item.property_slug!=='3425-east-tremont-bronx'),
    retail.filter(item=>published.has(item.property_id)),
  )[page];
  // Original source URLs, with no thumbnail derivative or synthetic upscaling.
  return {'--gold-street-photo':photo?`url(${JSON.stringify(photo.image)})`:'none'} as CSSProperties;
}
