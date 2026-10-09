import { NextResponse } from 'next/server';
import { audit, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';
const states = ['draft','internal_review','published','archived'];
const fail = (status = 400) => NextResponse.json({ error: status === 409 ? 'Conflict' : 'Invalid request' }, { status });
export async function GET(request: Request) {
  const admin = await requireAdmin(); if (!admin) return unauthorized();
  const q = new URL(request.url).searchParams.get('q')?.trim().slice(0,100) || '';
  const includeArchived = new URL(request.url).searchParams.get('include_archived') === '1';
  const rows = await admin.db.prepare("SELECT id,name,slug,address_json,publication_state,created_at,updated_at FROM buildings WHERE (name LIKE ? OR slug LIKE ?) AND (? = 1 OR publication_state != 'archived') ORDER BY name LIMIT 100").bind(`%${q}%`,`%${q}%`,includeArchived ? 1 : 0).all();
  return NextResponse.json(rows.results, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: Request) {
  const admin = await requireAdmin(); if (!admin) return unauthorized(); if (!sameOrigin(request)) return unauthorized();
  let input: Record<string, unknown>; try { input = await request.json(); } catch { return fail(); }
  const name = String(input.name || '').trim(), slug = String(input.slug || '').trim().toLowerCase();
  const address = input.address && typeof input.address === 'object' ? input.address as Record<string,unknown> : {};
  if (name.length < 2 || name.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120 || !String(address.street || '').trim() || !String(address.city || '').trim() || !String(address.state || '').trim()) return fail();
  const id = crypto.randomUUID();
  const row = { id, name, slug, address_json: JSON.stringify({street:String(address.street).trim(),city:String(address.city).trim(),state:String(address.state).trim(),zip:String(address.zip || '').trim(),neighborhood:String(address.neighborhood || '').trim()}), publication_state:'draft' };
  try {
    await admin.db.prepare('INSERT INTO buildings (id,name,slug,address_json,amenities_public,gallery,publication_state) VALUES (?,?,?,?,?,?,?)').bind(id,name,slug,row.address_json,'[]','[]','draft').run();
    await audit(admin.db,admin.email,'created','building',id,null,row);
    return NextResponse.json(row,{status:201});
  } catch { return fail(409); }
}
