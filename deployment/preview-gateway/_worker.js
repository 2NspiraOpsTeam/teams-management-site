// Public branding only; never broaden this allowlist to portfolio or private photos.
export const publicLogoVariants = new Set([
  "467604fe5b91383d1a9a48ad2a65b442c230df3c1045447d86ee5db93888a66f.webp",
  "70b5032c1b6dc06f0f8475136d2d8fe73fd07c2be05d88bbc058b035522ae45c.webp",
  "1669269de9d5b4c2164df18e40a560bb2861bef984945b65aca3bf10cdea0bf6.webp",
  "b478a2b2e82d9d3bbea28662197c06990e96d0fecda62fbfae68721d0735805e.webp"
]);
const configurationNames = [
  'ADMIN_AUTH_FROM', 'ADMIN_AUTH_REPLY_TO', 'ADMIN_OTP_PEPPER',
  'TENANT_AUTH_FROM', 'TENANT_OTP_PEPPER', 'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'MAIL_PROVIDER',
  'INQUIRY_FROM', 'INQUIRY_NOTIFY_TO', 'INQUIRY_QA_TO', 'INQUIRY_QA_ID',
  'WORK_ORDER_FROM', 'WORK_ORDER_NOTIFY_TO', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
];
// Audited source-only public page. Never extend to portfolios or account routes
// without reviewing publication, personalization and invalidation contracts.
export function publicPageRequest(request) {
  const url = new URL(request.url);
  return request.method === 'GET' && url.pathname === '/in-the-news' && !url.search &&
    request.headers.get('accept')?.includes('text/html') &&
    !['cookie','authorization','rsc','next-router-state-tree','next-router-prefetch','next-router-segment-prefetch','range'].some(key => request.headers.has(key)) &&
    !/no-cache|no-store|max-age\s*=\s*0/i.test(request.headers.get('cache-control') || '') &&
    !request.headers.has('pragma');
}
function deliverPublic(response, state) {
  const result = new Response(response.body, response);
  // Cache only inside this bounded edge policy, not in browsers/intermediaries.
  result.headers.set('Cache-Control', 'private, no-store');
  result.headers.set('X-Teams-Public-Cache', state);
  result.headers.delete('X-Teams-Request-Id');
  return result;
}
// Rejection only: never authenticate at the gateway. A present cookie always
// reaches the application's authoritative session/role/assignment checks.
export function anonymousGuard(request) {
  if (!['GET','HEAD'].includes(request.method)) return;
  const path = new URL(request.url).pathname;
  const hasCookie = name => (request.headers.get('cookie') || '').split(';').some(part => part.slice(0, part.indexOf('=')).trim() === name && part.includes('='));
  const admin = hasCookie('teams_admin_session');
  const tenant = hasCookie('teams_tenant_session');
  let status, body, location;
  if ((path === '/api/admin/session' && !admin) || (path === '/api/tenant/session' && !tenant)) {
    status = 401; body = JSON.stringify({error:'Unauthorized'});
  } else if (path.startsWith('/api/admin/') && !admin) {
    status = 404; body = 'Not found';
  } else if ((path === '/admin' || path.startsWith('/admin/')) && !admin) {
    status = 307; location = new URL('/access',request.url).href;
  } else return;
  const headers = {
    'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow, noarchive',
    'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin',
    'X-Frame-Options':'SAMEORIGIN', 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy':"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'",
    'Content-Type':status === 401 ? 'application/json' : 'text/plain; charset=utf-8',
    'X-Teams-Guard':'anonymous',
  };
  if (location) headers.Location = location;
  return new Response(request.method === 'HEAD' ? null : body,{status,headers});
}
export default {
  async fetch(request, env) {
    const guarded = anonymousGuard(request);
    if (guarded) return guarded;
    const requestId = crypto.randomUUID();
    const unavailable = () => new Response('Temporarily unavailable. Please try again shortly.', {
      status: 503,
      headers: {'Cache-Control': 'private, no-store', 'Retry-After': '30', 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow', 'X-Teams-Request-Id':requestId},
    });
    // Pages serves copied public assets without starting the application runtime.
    // A missing file falls back to the matched runtime (e.g. a newer chunk).
    const path = new URL(request.url).pathname;
    if (['GET','HEAD'].includes(request.method) && env.ASSETS &&
        path.startsWith('/photo-variants/') && publicLogoVariants.has(path.slice('/photo-variants/'.length))) {
      try {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = '/brand/variants/' + path.slice('/photo-variants/'.length);
        const asset = await env.ASSETS.fetch(new Request(assetUrl, request));
        if (asset.status !== 404) return asset;
      } catch { /* Preserve the existing runtime fallback. */ }
    }
    if (['GET','HEAD'].includes(request.method) && env.ASSETS &&
        ['/_next/static/','/images/','/brand/','/documents/news/'].some(prefix => path.startsWith(prefix))) {
      try {
        const asset = await env.ASSETS.fetch(request);
        if (asset.status !== 404) return asset;
      } catch { /* An asset-service failure must not prevent runtime fallback. */ }
    }
    if (!env.TEAMS_RUNTIME) return unavailable();
    const configuration = {};
    for (const key of configurationNames) {
      if (typeof env[key] === 'string') configuration[key] = env[key];
    }
    try {
      let cache, key;
      if (publicPageRequest(request) && typeof caches !== 'undefined') {
        try {
          cache = await caches.open('teams-source-only-news-v1');
          key = new Request(request.url);
          const hit = await cache.match(key);
          if (hit) return deliverPublic(hit, 'HIT');
        } catch { cache = undefined; }
      }
      // Await inside the boundary: RPC failures include backend CPU termination.
      // Never retry automatically: a failed write may already have committed.
      const response = await env.TEAMS_RUNTIME.handleRequest(request, configuration);
      if (cache && response.status === 200 && response.headers.get('content-type')?.includes('text/html') &&
          !response.headers.has('set-cookie') && !response.headers.has('www-authenticate') &&
          !/(?:^|,)\s*(?:\*|cookie|authorization)\s*(?:,|$)/i.test(response.headers.get('vary') || '')) {
        const stored = new Response(response.clone().body, response);
        // Framework no-store is intentional for dynamic siblings; only this
        // audited, anonymous source-only page is eligible for 60 seconds.
        stored.headers.set('Cache-Control', 'public, max-age=60');
        stored.headers.delete('Vary');
        stored.headers.delete('X-Teams-Request-Id');
        try { await cache.put(key, stored); } catch { /* Cache is optional. */ }
        return deliverPublic(response, 'MISS');
      }
      return response;
    } catch {
      // Do not log exceptions, URLs, cookies, configuration or request bodies.
      const family = path.startsWith('/api/admin/') ? 'admin-api' : path.startsWith('/api/tenant/') ? 'tenant-api' : path.startsWith('/api/') ? 'public-api' : 'page';
      console.error(JSON.stringify({event: 'teams_runtime_unavailable', requestId, family, method: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'].includes(request.method) ? request.method : 'OTHER'}));
      return unavailable();
    }
  },
};
