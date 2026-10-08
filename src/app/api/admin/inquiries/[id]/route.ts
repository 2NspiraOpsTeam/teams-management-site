import { NextResponse } from 'next/server';
import { audit,requireAdmin,sameOrigin,unauthorized } from '@/lib/admin-auth';
export const runtime='edge';
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const admin=await requireAdmin();if(!admin)return unauthorized();if(!sameOrigin(request))return unauthorized();
  const {id}=await params;const before=await admin.db.prepare('SELECT id,status,notes FROM inquiries WHERE id=?').bind(id).first<Record<string,unknown>>();
  if(!before)return NextResponse.json({error:'Not found'},{status:404});
  let input:Record<string,unknown>;try{input=await request.json();}catch{return NextResponse.json({error:'Invalid request'},{status:400});}
  const status=String(input.status ?? before.status),notes=String(input.notes ?? before.notes ?? '').trim();
  if(!['submitted','routing_followup','resolved'].includes(status)||notes.length>2000)return NextResponse.json({error:'Invalid request'},{status:400});
  await admin.db.prepare("UPDATE inquiries SET status=?,notes=? WHERE id=?").bind(status,notes,id).run();
  const after={id,status,notes};await audit(admin.db,admin.email,'updated','inquiry',id,before,after);
  return NextResponse.json(after,{headers:{'Cache-Control':'no-store'}});
}
