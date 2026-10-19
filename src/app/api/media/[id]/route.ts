import { getCloudflareContext } from '@opennextjs/cloudflare';
import {publicImageCache} from '@/lib/public-image-cache';
import { adminDb } from '@/lib/admin-auth';
import { mediaResponse } from '@/lib/media-response';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){const id=(await params).id,preview=process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO==='1',version=new URL(request.url).searchParams.get('v');const env=getCloudflareContext().env as {TEAMS_RELEASE_SHA?:string};return publicImageCache(request,env.TEAMS_RELEASE_SHA,preview,()=>mediaResponse(adminDb(),id,false,preview,version));}
