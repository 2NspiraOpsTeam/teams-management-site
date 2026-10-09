import { NextResponse } from 'next/server';
import { audit, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';
const states = new Set(['draft','internal_review','published','archived']);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(); if (!admin) return unauthorized(); if (!sameOrigin(request)) return unauthorized();
  const { id } = await params;
  const before = await admin.db.prepare('SELECT id,name,slug,address_json,publication_state FROM buildings WHERE id = ?').bind(id).first<Record<string,unknown>>();
  if (!before) return NextResponse.json({error:'Not found'},{status:404});
  let input: Record<string,unknown>; try { input = await request.json(); } catch { return NextResponse.json({error:'Invalid request'},{status:400}); }
  const name = input.name === undefined ? String(before.name) : String(input.name).trim();
  const state = input.publication_state === undefined ? String(before.publication_state) : String(input.publication_state);
  let address = before.address_json as string;
  if (input.address !== undefined) {
    if (!input.address || typeof input.address !== 'object') return NextResponse.json({error:'Invalid request'},{status:400});
    const a = input.address as Record<string,unknown>;
    if (!String(a.street || '').trim() || !String(a.city || '').trim() || !String(a.state || '').trim()) return NextResponse.json({error:'Invalid request'},{status:400});
    address = JSON.stringify({street:String(a.street).trim(),city:String(a.city).trim(),state:String(a.state).trim(),zip:String(a.zip || '').trim(),neighborhood:String(a.neighborhood || '').trim()});
  }
  if (name.length < 2 || name.length > 120 || !states.has(state)) return NextResponse.json({error:'Invalid request'},{status:400});
  if (state === 'published' && before.publication_state !== 'published') return NextResponse.json({ error: 'Publishing is unavailable until property content and media are approved.' }, { status: 409 });
  // Publishing does not release old unapproved copy: public projection suppresses it.
  await admin.db.prepare("UPDATE buildings SET name=?, address_json=?, publication_state=?, updated_at=datetime('now') WHERE id=?").bind(name,address,state,id).run();
  const after = { ...before, name, address_json:address, publication_state:state };
  await audit(admin.db,admin.email,state !== before.publication_state ? state : 'updated','building',id,before,after);
  return NextResponse.json(after,{headers:{'Cache-Control':'no-store'}});
}
