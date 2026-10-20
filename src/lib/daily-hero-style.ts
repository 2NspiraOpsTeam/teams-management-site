import type { CSSProperties } from 'react';
import { adminDb } from './admin-auth';
import { eligibleShowcases } from './page-showcase';
import { dailyHeroPhoto } from './daily-hero-photo';

export async function dailyHeroStyle(page: 'about' | 'contact' | 'rent-with-us'): Promise<CSSProperties | undefined> {
  const photo = dailyHeroPhoto(await eligibleShowcases(adminDb()), new Date(),
    { about: 0, contact: 1, 'rent-with-us': 2 }[page]);
  // Keep each page's existing approved fallback when no public cover is eligible.
  return photo ? { '--gold-street-photo': `url(${JSON.stringify(photo.image)})` } as CSSProperties : undefined;
}
