import { getCloudflareContext } from '@opennextjs/cloudflare';
import {publicImageCache} from '@/lib/public-image-cache';
import {requestedMediaVariant,variantMatchesSource} from '@/lib/photo-variants';
import { adminDb } from '@/lib/admin-auth';
import { mediaResponse } from '@/lib/media-response';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const id=(await params).id,preview=process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO==='1',query=new URL(request.url).searchParams,version=query.get('v');
 const env=getCloudflareContext().env as {TEAMS_RELEASE_SHA?:string;ASSETS?:{fetch:(r:Request)=>Promise<Response>}};
 if(query.has('w')){
  const selected=requestedMediaVariant(id,version,Number(query.get('w')));
  if(!selected||query.get('w')!==String(selected.variant.width))return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  return publicImageCache(request,env.TEAMS_RELEASE_SHA,preview,()=>mediaResponse(adminDb(),id,false,preview,undefined,async asset=>{
   if(!variantMatchesSource(selected.photo,asset)||!env.ASSETS)return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
   const result=await env.ASSETS.fetch(new Request(new URL('/_photo-variants/'+selected.variant.file,request.url)));
   if(result.status!==200)return new Response('Image temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
   return new Response(result.body,{headers:{'Content-Type':'image/webp','Cache-Control':'public, max-age=60, must-revalidate','X-Content-Type-Options':'nosniff','X-Teams-Photo-Width':String(selected.variant.width)}});
  }));
 }
 return publicImageCache(request,env.TEAMS_RELEASE_SHA,preview,()=>mediaResponse(adminDb(),id,false,preview,version));
}
