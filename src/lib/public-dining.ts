import { delizia73History } from './approved-property-highlights';
import type { D1Database } from '@cloudflare/workers-types';
import { adminDb } from './admin-auth';
import { isDeliverablePublicMedia, publicMediaSrc, type MediaRow } from './media-management';
import { previewPortfolioEnabled } from './preview-portfolio';

type DiningRow = {
  id: string; name: string; slug: string; property_id: string; property_name: string;
  property_slug: string; address_json: string; summary: string; category: string;
  neighborhood: string | null; website_url: string | null; menu_url: string | null;
  reservation_url: string | null; ordering_url: string | null; phone: string | null;
  hero_media_asset_id: string | null; storage_key: string | null; file_type: string | null;
  checksum:string|null; visibility: string | null; alt_text: string | null; caption: string | null;
};

export type DiningVenue = Omit<DiningRow, 'address_json' | 'storage_key' | 'file_type' | 'visibility' | 'checksum' | 'alt_text' | 'caption'> & {
  address: { street: string; city: string; state: string; zip?: string };
  image: { src: string; alt: string; caption: string | null } | null;
  photos: { src: string; alt: string; caption: string | null }[];
};

export async function listPublicDining(propertySlug?: string, db: D1Database = adminDb()): Promise<DiningVenue[]> {
  const result = await db.prepare(`SELECT d.id,d.name,d.slug,d.property_id,b.name AS property_name,b.slug AS property_slug,
    b.address_json,d.summary,d.category,d.neighborhood,d.website_url,d.menu_url,d.reservation_url,
    d.ordering_url,d.phone,d.hero_media_asset_id,a.storage_key,a.checksum,a.file_type,a.visibility,a.alt_text,a.caption
    FROM dining_venues d JOIN buildings b ON b.id=d.property_id
    LEFT JOIN media_assets a ON a.id=d.hero_media_asset_id
    WHERE d.publication_state='published' AND ${previewPortfolioEnabled ? "b.publication_state!='archived'" : "b.publication_state='published'"}
    ${propertySlug ? 'AND b.slug=?' : ''}
    ORDER BY d.display_order,d.name`).bind(...(propertySlug ? [propertySlug] : [])).all<DiningRow>();
  const photoRows = await db.prepare(`SELECT p.venue_id,a.id,a.storage_key,a.checksum,a.file_type,a.visibility,a.alt_text,a.caption
    FROM dining_venue_photos p JOIN media_assets a ON a.id=p.asset_id
    JOIN dining_venues d ON d.id=p.venue_id JOIN buildings b ON b.id=d.property_id
    WHERE d.publication_state='published' AND ${previewPortfolioEnabled ? "b.publication_state!='archived'" : "b.publication_state='published'"}
    ${propertySlug ? 'AND b.slug=?' : ''} ORDER BY p.venue_id,p.position`).bind(...(propertySlug ? [propertySlug] : [])).all<MediaRow & {venue_id:string}>();
  const photosByVenue = new Map<string,DiningVenue['photos']>();
  for (const photo of photoRows.results) {
    if (photo.visibility !== 'public' || !photo.file_type.startsWith('image/') || !isDeliverablePublicMedia(photo)) continue;
    const photos = photosByVenue.get(photo.venue_id) || [];
    photos.push({src:publicMediaSrc(photo),alt:photo.alt_text || 'Dining destination photo',caption:photo.caption || null});
    photosByVenue.set(photo.venue_id,photos);
  }
  return result.results.map(row => {
    const media: MediaRow | null = row.hero_media_asset_id && row.storage_key && row.file_type && row.visibility ? {
      id: row.hero_media_asset_id, storage_key: row.storage_key, file_type: row.file_type,
      visibility: row.visibility, alt_text: row.alt_text, caption: row.caption,
      width: null, height: null, size_bytes: null, checksum: row.checksum, created_at: '',
    } : null;
    const address = JSON.parse(row.address_json) as DiningVenue['address'];
    const fallbackImage = media?.visibility === 'public' && media.file_type.startsWith('image/') && isDeliverablePublicMedia(media)
      ? { src: publicMediaSrc(media), alt: media.alt_text || `Dining at ${row.property_name}`, caption: media.caption || null } : null;
    return {
      id: row.id, name: row.name, slug: row.slug, property_id: row.property_id,
      property_name: row.property_name, property_slug: row.property_slug,
      summary: previewPortfolioEnabled && row.slug === 'delizia-73' ? delizia73History : row.summary, category: row.category, neighborhood: row.neighborhood,
      website_url: row.website_url, menu_url: row.menu_url,
      reservation_url: row.reservation_url, ordering_url: row.ordering_url,
      phone: row.phone, hero_media_asset_id: row.hero_media_asset_id, address,
      image: fallbackImage,
      photos: photosByVenue.get(row.id) || (fallbackImage ? [fallbackImage] : []),
    };
  });
}
