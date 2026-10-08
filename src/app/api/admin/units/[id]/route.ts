import { NextResponse } from 'next/server';
import { audit, requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
export const runtime = 'edge';
const statuses=new Set(['available_internal','occupied','under_construction','maintenance']);
export async function PATCH(request: Request,{params}:{params:Promise<{id:string}>}) {
  const admin=await requireAdmin(); if(!admin)return unauthorized(); if(!sameOrigin(request))return unauthorized();
  const {id}=await params;
  const before=await admin.db.prepare('SELECT id,building_id,unit_identifier,floor_number,layout_id,status FROM units WHERE id=?').bind(id).first<Record<string,unknown>>();
  if(!before)return NextResponse.json({error:'Not found'},{status:404});
  let input:Record<string,unknown>; try{input=await request.json();}catch{return NextResponse.json({error:'Invalid request'},{status:400});}
  const buildingId=String(input.building_id ?? before.building_id),identifier=String(input.unit_identifier ?? before.unit_identifier).trim(),floor=Number(input.floor_number ?? before.floor_number),status=String(input.status ?? before.status),layoutId=input.layout_id === undefined ? before.layout_id : (input.layout_id || null);
  if(!identifier||identifier.length>50||!Number.isInteger(floor)||floor < -10||floor>300||!statuses.has(status))return NextResponse.json({error:'Invalid request'},{status:400});
  if(!(await admin.db.prepare('SELECT id FROM buildings WHERE id=?').bind(buildingId).first()) || (layoutId && !(await admin.db.prepare('SELECT id FROM layouts WHERE id=?').bind(layoutId).first())))return NextResponse.json({error:'Invalid request'},{status:400});
  const after={id,building_id:buildingId,unit_identifier:identifier,floor_number:floor,layout_id:layoutId,status};
  await admin.db.prepare("UPDATE units SET building_id=?,unit_identifier=?,floor_number=?,layout_id=?,status=?,updated_at=datetime('now') WHERE id=?").bind(buildingId,identifier,floor,layoutId,status,id).run();
  await audit(admin.db,admin.email,'updated','unit',id,before,after);
  return NextResponse.json(after,{headers:{'Cache-Control':'no-store'}});
}
