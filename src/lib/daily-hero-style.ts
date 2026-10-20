import type { CSSProperties } from 'react';
import { adminDb } from './admin-auth';
import { eligibleShowcases } from './page-showcase';
import { dailyHeroPhoto } from './daily-hero-photo';
import { listPublicRetail } from './public-retail';

export async function dailyHeroStyle(page: 'about' | 'contact' | 'rent-with-us' | 'properties' | 'retail'): Promise<CSSProperties> {
  const context = page === 'retail' ? 'retail' : 'residential';
  let eligible = await eligibleShowcases(adminDb(), true, context, true);
  if (context === 'retail') {
    const published = new Set((await listPublicRetail()).map(item => item.id));
    eligible = eligible.filter(item => published.has(item.property_id));
  } else {
    eligible = eligible.filter(item => item.property_slug !== '3425-east-tremont-bronx');
  }
  const photo = dailyHeroPhoto(eligible, new Date(),
    { about: 0, contact: 1, 'rent-with-us': 2, properties: 3, retail: 0 }[page]);
  // Never substitute an image from the other context when this pool is empty.
  return { '--gold-street-photo': photo ? `url(${JSON.stringify(photo.image)})` : 'none' } as CSSProperties;
}
