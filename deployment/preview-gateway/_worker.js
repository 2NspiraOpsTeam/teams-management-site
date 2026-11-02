const configurationNames = [
  'ADMIN_AUTH_FROM', 'ADMIN_AUTH_REPLY_TO', 'ADMIN_OTP_PEPPER',
  'TENANT_AUTH_FROM', 'TENANT_OTP_PEPPER', 'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'MAIL_PROVIDER',
  'INQUIRY_FROM', 'INQUIRY_NOTIFY_TO', 'INQUIRY_QA_TO', 'INQUIRY_QA_ID',
  'WORK_ORDER_FROM', 'WORK_ORDER_NOTIFY_TO', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
];
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
      // News now uses the same live, publication-gated daily header plan as
      // the portfolio. Do not retain source-only HTML across plan changes.
      return await env.TEAMS_RUNTIME.handleRequest(request, configuration);
    } catch {
      // Do not log exceptions, URLs, cookies, configuration or request bodies.
      const family = path.startsWith('/api/admin/') ? 'admin-api' : path.startsWith('/api/tenant/') ? 'tenant-api' : path.startsWith('/api/') ? 'public-api' : 'page';
      console.error(JSON.stringify({event: 'teams_runtime_unavailable', requestId, family, method: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'].includes(request.method) ? request.method : 'OTHER'}));
      return unavailable();
    }
  },
};
