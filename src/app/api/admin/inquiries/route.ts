import { NextResponse } from 'next/server';
import { requireAdmin, unauthorized } from '@/lib/admin-auth';
export const runtime='edge';
export async function GET(request:Request){
  const admin=await requireAdmin();if(!admin)return unauthorized();
  const status=new URL(request.url).searchParams.get('status');
  if(status && !['submitted','routing_followup','resolved'].includes(status))return NextResponse.json({error:'Invalid request'},{status:400});
  const rows=await admin.db.prepare('SELECT i.id,i.source,i.category,i.status,i.created_at,i.routing_destination,i.notes,d.name,d.email,d.phone,d.message,d.building_id,n.state AS notification_state,n.attempts AS notification_attempts,n.last_attempt_at FROM inquiries i LEFT JOIN inquiry_details d ON d.inquiry_id=i.id LEFT JOIN inquiry_notifications n ON n.inquiry_id=i.id WHERE (? IS NULL OR i.status=?) ORDER BY i.created_at DESC LIMIT 100').bind(status,status).all();
  return NextResponse.json(rows.results,{headers:{'Cache-Control':'no-store'}});
}
