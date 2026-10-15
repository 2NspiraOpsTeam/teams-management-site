const configurationNames = [
  'ADMIN_AUTH_FROM', 'ADMIN_AUTH_REPLY_TO', 'ADMIN_OTP_PEPPER',
  'TENANT_AUTH_FROM', 'TENANT_OTP_PEPPER', 'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'MAIL_PROVIDER',
  'INQUIRY_FROM', 'INQUIRY_NOTIFY_TO', 'INQUIRY_QA_TO', 'INQUIRY_QA_ID',
  'WORK_ORDER_FROM', 'WORK_ORDER_NOTIFY_TO', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
];
export default {
  async fetch(request, env) {
    if (!env.TEAMS_RUNTIME) return new Response('Preview temporarily unavailable', { status: 503 });
    const configuration = {};
    for (const key of configurationNames) {
      if (typeof env[key] === 'string') configuration[key] = env[key];
    }
    return env.TEAMS_RUNTIME.handleRequest(request, configuration);
  },
};
