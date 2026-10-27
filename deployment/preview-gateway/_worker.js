const configurationNames = [
  'ADMIN_AUTH_FROM', 'ADMIN_AUTH_REPLY_TO', 'ADMIN_OTP_PEPPER',
  'TENANT_AUTH_FROM', 'TENANT_OTP_PEPPER', 'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'MAIL_PROVIDER',
  'INQUIRY_FROM', 'INQUIRY_NOTIFY_TO', 'INQUIRY_QA_TO', 'INQUIRY_QA_ID',
  'WORK_ORDER_FROM', 'WORK_ORDER_NOTIFY_TO', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
];
export default {
  async fetch(request, env) {
    const unavailable = () => new Response('Temporarily unavailable. Please try again shortly.', {
      status: 503,
      headers: {'Cache-Control': 'private, no-store', 'Retry-After': '30', 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, nofollow'},
    });
    if (!env.TEAMS_RUNTIME) return unavailable();
    const configuration = {};
    for (const key of configurationNames) {
      if (typeof env[key] === 'string') configuration[key] = env[key];
    }
    try {
      // Await inside the boundary: RPC failures include backend CPU termination.
      // Never retry automatically: a failed write may already have committed.
      return await env.TEAMS_RUNTIME.handleRequest(request, configuration);
    } catch {
      // Do not log exceptions, URLs, cookies, configuration or request bodies.
      console.error(JSON.stringify({event: 'teams_runtime_unavailable', method: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'].includes(request.method) ? request.method : 'OTHER'}));
      return unavailable();
    }
  },
};
