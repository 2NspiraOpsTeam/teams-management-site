import { adminDb } from '@/lib/admin-auth';
import { mediaResponse } from '@/lib/media-response';
export const runtime='edge';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){return mediaResponse(adminDb(),(await params).id,false,process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO==='1');}
