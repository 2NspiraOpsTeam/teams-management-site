import {requestedMediaVariant,variantMatchesSource} from '../../src/lib/photo-variants.ts';
import {mediaResponse} from '../../src/lib/media-response.ts';
import {publicImageCache} from '../../src/lib/public-image-cache.ts';
import {browserSecurityHeaders} from '../../src/lib/security-headers.ts';
// Avoid initializing Next/React for immutable offline-prepared photograph bytes.
// The identical mediaResponse SQL remains the authoritative publication guard.
export function preparedPhotoRequest(request){return request.method==='GET'&&/^\/api\/media\/[^/]+$/.test(new URL(request.url).pathname)&&new URL(request.url).searchParams.has('w');}
export async function preparedPhotoResponse(request,env){
 const url=new URL(request.url),preview=env.NEXT_PUBLIC_ENVIRONMENT==='preview';
 let id;try{id=decodeURIComponent(url.pathname.slice('/api/media/'.length));}catch{return new Response('Not found',{status:404});}
 const selected=requestedMediaVariant(id,url.searchParams.get('v'),Number(url.searchParams.get('w')),preview);
 let response;
 if(!selected||url.searchParams.get('w')!==String(selected.variant.width))response=new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
 else response=await publicImageCache(request,env.TEAMS_RELEASE_SHA,preview,()=>mediaResponse(env.DB,id,false,preview,undefined,async asset=>{
  if(!variantMatchesSource(selected.photo,asset)||!env.ASSETS)return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  const file=await env.ASSETS.fetch(new Request(new URL('/_photo-variants/'+selected.variant.file,url)));
  if(file.status!==200)return new Response('Image temporarily unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
  return new Response(file.body,{headers:{'Content-Type':'image/webp','Cache-Control':'public, max-age=60, must-revalidate','X-Content-Type-Options':'nosniff','X-Teams-Photo-Width':String(selected.variant.width)}});
 }));
 const result=new Response(response.body,response);for(const [key,value] of Object.entries(browserSecurityHeaders))result.headers.set(key,value);
 result.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');result.headers.set('X-Teams-Photo-Pipeline','prepared');return result;
}
