import { requireAdmin, unauthorized } from '@/lib/admin-auth';
import { mediaResponse } from '@/lib/media-response';
export const runtime='edge';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const admin=await requireAdmin();if(!admin)return unauthorized();return mediaResponse(admin.db,(await params).id,true);}
