import { NextResponse } from 'next/server';
import { audit, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
import { isDeliverablePublicMedia } from '@/lib/media-management';

export const runtime = 'nodejs';

type VenueInput = {
  id?: string; name: string; slug: string; property_id: string; summary: string;
  category: string; neighborhood: string; website_url: string; menu_url: string;
  reservation_url: string; ordering_url: string; phone: string;
  hero_media_asset_id: string; publication_state: 'draft' | 'published'; display_order: number;
  photo_asset_ids: string[];
};

function parseInput(value: unknown): VenueInput | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const fields = ['name','slug','property_id','summary','category','neighborhood','website_url','menu_url','reservation_url','ordering_url','phone','hero_media_asset_id'];
  if (fields.some(field => typeof v[field] !== 'string')) return null;
  const input = Object.fromEntries(fields.map(field => [field,(v[field] as string).trim()])) as unknown as VenueInput;
  if (v.id !== undefined && typeof v.id !== 'string') return null;
  input.id = typeof v.id === 'string' ? v.id : undefined;
  input.publication_state = v.publication_state as VenueInput['publication_state'];
  input.display_order = v.display_order as number;
  input.photo_asset_ids = v.photo_asset_ids as string[];
  if (!input.name || input.name.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug.length > 100 ||
      !input.property_id || input.summary.length > 400 || input.category.length > 100 ||
      input.neighborhood.length > 100 || input.phone.length > 40 || !['draft','published'].includes(input.publication_state) ||
      !Number.isInteger(input.display_order) || input.display_order < 0 || input.display_order > 10000 ||
      !Array.isArray(input.photo_asset_ids) || input.photo_asset_ids.length > 30 ||
      input.photo_asset_ids.some(id => typeof id !== 'string' || id.length > 100) ||
      new Set(input.photo_asset_ids).size !== input.photo_asset_ids.length) return null;
  if (input.publication_state === 'published' && (!input.summary || !input.category || !input.website_url)) return null;
  for (const field of ['website_url','menu_url','reservation_url','ordering_url'] as const) {
    if (!input[field]) continue;
    if (input[field].length > 500) return null;
    try { const url = new URL(input[field]); if (url.protocol !== 'https:' || !url.hostname.includes('.')) return null; }
    catch { return null; }
  }
  return input;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin || !sameOrigin(request)) return unauthorized();
  const input = parseInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'Check the venue details and required publication fields.' }, { status: 400 });
  const property = await admin.db.prepare("SELECT id FROM buildings WHERE id=? AND publication_state!='archived'").bind(input.property_id).first();
  if (!property) return NextResponse.json({ error: 'Select an existing property.' }, { status: 400 });
  for (const id of new Set([...input.photo_asset_ids,...(input.hero_media_asset_id ? [input.hero_media_asset_id] : [])])) {
    const asset = await admin.db.prepare("SELECT storage_key FROM media_assets WHERE id=? AND visibility='public' AND file_type LIKE 'image/%'").bind(id).first<{storage_key:string}>();
    if (!asset || !isDeliverablePublicMedia(asset)) return NextResponse.json({ error: 'Select approved public photos from the Media Library.' }, { status: 400 });
  }
  const id = input.id || crypto.randomUUID();
  const before = await admin.db.prepare('SELECT * FROM dining_venues WHERE id=?').bind(id).first();
  try {
    await admin.db.batch([admin.db.prepare(`INSERT INTO dining_venues
      (id,name,slug,property_id,summary,category,neighborhood,website_url,menu_url,reservation_url,ordering_url,phone,hero_media_asset_id,publication_state,display_order)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,property_id=excluded.property_id,
      summary=excluded.summary,category=excluded.category,neighborhood=excluded.neighborhood,
      website_url=excluded.website_url,menu_url=excluded.menu_url,reservation_url=excluded.reservation_url,
      ordering_url=excluded.ordering_url,phone=excluded.phone,hero_media_asset_id=excluded.hero_media_asset_id,
      publication_state=excluded.publication_state,display_order=excluded.display_order,updated_at=datetime('now')`)
      .bind(id,input.name,input.slug,input.property_id,input.summary,input.category,input.neighborhood || null,
        input.website_url || null,input.menu_url || null,input.reservation_url || null,input.ordering_url || null,
        input.phone || null,input.photo_asset_ids[0] || null,input.publication_state,input.display_order),
      admin.db.prepare('DELETE FROM dining_venue_photos WHERE venue_id=?').bind(id),
      ...input.photo_asset_ids.map((assetId,position) => admin.db.prepare('INSERT INTO dining_venue_photos (venue_id,asset_id,position) VALUES (?,?,?)').bind(id,assetId,position))]);
  } catch { return NextResponse.json({ error: 'Unable to save. Check that the slug is unique.' }, { status: 409 }); }
  await audit(admin.db,admin.email,before ? 'dining_updated' : 'dining_created','dining_venue',id,before,input);
  return NextResponse.json({ ok: true, id }, { headers: { 'Cache-Control': 'no-store' } });
}
