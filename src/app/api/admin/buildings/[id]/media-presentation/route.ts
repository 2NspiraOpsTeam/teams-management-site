import { NextResponse } from 'next/server';
import { audit,requireAdmin,sameOrigin,unauthorized } from '@/lib/admin-auth';
import { presentationCandidates,presentationState,savePresentation,validPresentation } from '@/lib/media-presentation';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const admin=await requireAdmin();if(!admin)return unauthorized();const {id}=await params;const building=await admin.db.prepare('SELECT id FROM buildings WHERE id=?').bind(id).first();if(!building)return NextResponse.json({error:'Property not found'},{status:404});return NextResponse.json(await presentationState(admin.db,id),{headers:{'Cache-Control':'no-store'}});}
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
 const admin=await requireAdmin();if(!admin||!sameOrigin(request))return unauthorized();const {id}=await params;
 const building=await admin.db.prepare('SELECT id FROM buildings WHERE id=?').bind(id).first();if(!building)return NextResponse.json({error:'Property not found'},{status:404});
 const input=await request.json().catch(()=>null);if(!validPresentation(input))return NextResponse.json({error:'Check the cover, gallery selection and image types.'},{status:400});
 const candidates=await presentationCandidates(admin.db,id);const approved=new Set(candidates.map(x=>x.id));if(input.cover_asset_id&&!approved.has(input.cover_asset_id)||input.gallery.some(x=>!approved.has(x.asset_id)))return NextResponse.json({error:'Select only approved building-wide images associated with this property. Apartment, private and unpublished photos are excluded.'},{status:400});
 if(!await savePresentation(admin.db,id,input))return NextResponse.json({error:'These settings changed in another window. Reload the saved settings before trying again.'},{status:409});
 await audit(admin.db,admin.email,'presentation_updated','building',id,null,input);
 return NextResponse.json({ok:true,revision:input.revision+1});
}
