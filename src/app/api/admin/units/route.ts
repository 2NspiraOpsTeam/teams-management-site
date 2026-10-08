import { NextResponse } from 'next/server';
import { audit, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';
const statuses = new Set(['available_internal','occupied','under_construction','maintenance']);
export async function GET(request: Request) {
  const admin = await requireAdmin(); if (!admin) return unauthorized();
  const q = new URL(request.url).searchParams.get('q')?.trim().slice(0,100) || '';
  const rows = await admin.db.prepare('SELECT u.id,u.building_id,b.name AS building_name,u.unit_identifier,u.floor_number,u.layout_id,u.status,u.created_at FROM units u JOIN buildings b ON b.id=u.building_id WHERE u.unit_identifier LIKE ? OR b.name LIKE ? ORDER BY b.name,u.unit_identifier LIMIT 100').bind(`%${q}%`,`%${q}%`).all();
  return NextResponse.json(rows.results,{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request: Request) {
  const admin = await requireAdmin(); if (!admin) return unauthorized(); if (!sameOrigin(request)) return unauthorized();
  let input: Record<string,unknown>; try { input = await request.json(); } catch { return NextResponse.json({error:'Invalid request'},{status:400}); }
  const buildingId=String(input.building_id || ''), identifier=String(input.unit_identifier || '').trim(), floor=Number(input.floor_number), status=String(input.status || 'available_internal'), layoutId=input.layout_id ? String(input.layout_id) : null;
  if (!buildingId || !identifier || identifier.length>50 || !Number.isInteger(floor) || floor < -10 || floor > 300 || !statuses.has(status)) return NextResponse.json({error:'Invalid request'},{status:400});
  const building=await admin.db.prepare('SELECT id FROM buildings WHERE id=?').bind(buildingId).first();
  const layout=layoutId ? await admin.db.prepare('SELECT id FROM layouts WHERE id=?').bind(layoutId).first() : true;
  if (!building || !layout) return NextResponse.json({error:'Invalid request'},{status:400});
  const id=crypto.randomUUID(), row={id,building_id:buildingId,unit_identifier:identifier,floor_number:floor,layout_id:layoutId,status};
  await admin.db.prepare('INSERT INTO units (id,building_id,unit_identifier,floor_number,layout_id,status) VALUES (?,?,?,?,?,?)').bind(id,buildingId,identifier,floor,layoutId,status).run();
  await audit(admin.db,admin.email,'created','unit',id,null,row);
  return NextResponse.json(row,{status:201});
}
