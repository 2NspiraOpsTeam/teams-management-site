import { getCloudflareContext } from '@opennextjs/cloudflare';
// Only allowlisted public projections may call this helper. Never wrap Admin,
// Tenant Services, leases, maintenance, contact records, or session lookups.
export async function publicDataCache<T>(key:'published-buildings'|'preview-addresses'|'public-retail',load:()=>Promise<T>):Promise<T>{
 const env=getCloudflareContext().env as {TEAMS_RELEASE_SHA?:string};
 const release=env.TEAMS_RELEASE_SHA;
 // Local tests/dev and runtimes without an immutable release never share cache.
 if(!release||typeof caches==='undefined')return load();
 let cache:Cache;try{cache=await caches.open('teams-public-projections-v1');}catch{return load();}
 const request=new Request('https://teams-public-cache.invalid/'+encodeURIComponent(release)+'/'+key);
 try{const hit=await cache.match(request);if(hit)return await hit.json() as T;}catch{/* Cache failure must not break the public site. */}
 const value=await load();
 try{await cache.put(request,Response.json(value,{headers:{'Cache-Control':'public, max-age=60'}}));}catch{}
 return value;
}
