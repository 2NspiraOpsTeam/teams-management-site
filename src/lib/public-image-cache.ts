// Public photography only. Call load() through the existing publication guard.
// Never use this helper for Admin, tenant, lease, or private-media endpoints.
export const PUBLIC_IMAGE_TTL=60;
export async function publicImageCache(request:Request,release:string|undefined,preview:boolean,load:()=>Promise<Response>):Promise<Response>{
 const url=new URL(request.url),version=url.searchParams.get('v'),width=url.searchParams.get('w');
 if(request.method!=='GET'||!release||!version||!/^[a-f0-9]{64}$/.test(version)||typeof caches==='undefined')return load();
 const key=new Request(`https://teams-public-images.invalid/${encodeURIComponent(release)}/${preview?'preview':'published'}${url.pathname}?v=${version}${width?'&w='+encodeURIComponent(width):''}`);
 let cache:Cache;try{cache=await caches.open('teams-approved-images-v1');}catch{return load();}
 const deliver=(response:Response,remaining:number)=>{
  const result=new Response(response.body,response);
  result.headers.delete('X-Teams-Image-Cached-At');
  // Do not restart a full browser TTL on an old edge-cache hit.
  result.headers.set('Cache-Control',`public, max-age=${remaining}, must-revalidate`);
  return result;
 };
 try{
  const hit=await cache.match(key);
  if(hit){const timestamp=Number(hit.headers.get('X-Teams-Image-Cached-At'));const remaining=Math.floor(PUBLIC_IMAGE_TTL-(Date.now()-timestamp)/1000);if(timestamp>0&&remaining>0&&remaining<=PUBLIC_IMAGE_TTL)return deliver(hit,remaining);}
 }catch{/* Cache failure must fall back to authorization, not denial or leakage. */}
 const response=await load();
 const image=response.status===200&&response.headers.get('Content-Type')?.startsWith('image/');
 const redirect=response.status===302&&/^\/(preview-properties|dining)\//.test(response.headers.get('Location')||'');
 if(!image&&!redirect)return response;
 const stored=new Response(response.clone().body,response);
 stored.headers.set('X-Teams-Image-Cached-At',String(Date.now()));
 stored.headers.set('Cache-Control',`public, max-age=${PUBLIC_IMAGE_TTL}`);
 try{await cache.put(key,stored);}catch{/* Serve the guarded image even if caching fails. */}
 return deliver(response,PUBLIC_IMAGE_TTL);
}
