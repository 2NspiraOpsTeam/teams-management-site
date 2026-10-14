import { NextResponse } from 'next/server';
import { requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
import { eligibleShowcases } from '@/lib/page-showcase';
export const runtime='edge';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const admin=await requireAdmin();if(!admin)return unauthorized();const {id}=await params;const candidates=(await eligibleShowcases(admin.db,false)).filter(row=>row.property_id===id);const approvals=(await admin.db.prepare('SELECT asset_id,kind,published,order_index FROM retail_media_approvals WHERE building_id=? ORDER BY order_index,asset_id').bind(id).all()).results;return NextResponse.json({candidates,approvals},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){const admin=await requireAdmin();if(!admin||!sameOrigin(request))return unauthorized();return NextResponse.json({error:"Retail image selections have moved to this property's Media portal. Reload the page and use Manage covers & galleries."},{status:409});}
