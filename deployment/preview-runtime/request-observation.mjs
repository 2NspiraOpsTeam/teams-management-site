// Only bounded classifications are logged; never pass errors, bodies, identities,
// query strings, cookies or caller-supplied request IDs into this boundary.
export async function observeRequest(request, release, handle, log = console.log) {
  const requestId = crypto.randomUUID();
  const started = performance.now();
  const path = new URL(request.url).pathname;
  const family = path.startsWith('/api/admin/') ? 'admin-api' : path.startsWith('/api/tenant/') ? 'tenant-api' : path.startsWith('/api/') ? 'public-api' : 'page';
  let response;
  try {
    response = await handle();
  } catch {
    response = new Response(JSON.stringify({error:'Temporarily unavailable. Please try again.',requestId}),{status:503,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
  }
  const result = new Response(response.body,response);
  result.headers.set('X-Teams-Request-Id',requestId);
  const failure=response.status>=500;
  const rejectedLogin=request.method==='POST'&&/^\/api\/(admin|tenant)\/session$/.test(path)&&response.status===401;
  if(failure||rejectedLogin)log(JSON.stringify({event:failure?'teams_server_failure':'teams_login_rejected',release,requestId,family,status:response.status,durationMs:Math.round(performance.now()-started)}));
  return result;
}
