import { adminDb } from '@/lib/admin-auth';
import { DiningEditor, type EditableVenue } from '@/components/admin/DiningEditor';
import { isDeliverablePublicMedia } from '@/lib/media-management';

export const runtime = 'edge';

export default async function DiningAdminPage() {
  const db = adminDb();
  const [venueResult, propertyResult, mediaResult, photoResult] = await Promise.all([
    db.prepare('SELECT * FROM dining_venues ORDER BY display_order,name').all<EditableVenue>(),
    db.prepare("SELECT id,name FROM buildings WHERE publication_state!='archived' ORDER BY name").all<{id:string;name:string}>(),
    db.prepare("SELECT id,storage_key,alt_text FROM media_assets WHERE visibility='public' AND file_type LIKE 'image/%' ORDER BY created_at DESC").all<{id:string;storage_key:string;alt_text:string|null}>(),
    db.prepare('SELECT venue_id,asset_id FROM dining_venue_photos ORDER BY venue_id,position').all<{venue_id:string;asset_id:string}>(),
  ]);
  const photos = new Map<string,string[]>();
  for (const row of photoResult.results) photos.set(row.venue_id,[...(photos.get(row.venue_id) || []),row.asset_id]);
  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-800">Teams Management Admin</p><h1 className="mt-3 font-serif text-4xl">Dining venues</h1><p className="mt-3 max-w-3xl text-slate-600">Create and manage dining at Teams properties. Only published venues appear on the public Dining and property pages. Use approved images from the Media Library; do not represent illustrative photography as venue photography.</p><DiningEditor venues={venueResult.results.map(venue => ({...venue,photo_asset_ids:photos.get(venue.id || '') || (venue.hero_media_asset_id ? [venue.hero_media_asset_id] : [])}))} properties={propertyResult.results} media={mediaResult.results.filter(isDeliverablePublicMedia)}/></main>;
}
