import { WorkerEntrypoint } from 'cloudflare:workers';
import application from '../../.open-next/worker.js';

// Only the same-account Pages service binding can invoke this entrypoint.
// Secrets stay configured on Pages and travel over private RPC, never HTTP headers.
export class TeamsPreviewRuntime extends WorkerEntrypoint {
  async handleRequest(request, configuration) {
    const allowed = [
      'ADMIN_AUTH_FROM', 'ADMIN_AUTH_REPLY_TO', 'ADMIN_OTP_PEPPER',
      'TENANT_AUTH_FROM', 'TENANT_OTP_PEPPER', 'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'MAIL_PROVIDER',
      'INQUIRY_FROM', 'INQUIRY_NOTIFY_TO', 'INQUIRY_QA_TO', 'INQUIRY_QA_ID',
      'WORK_ORDER_FROM', 'WORK_ORDER_NOTIFY_TO', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    ];
    const runtime = {};
    for (const key of allowed) {
      if (typeof configuration?.[key] === 'string') runtime[key] = configuration[key];
    }
    if (request.method === 'GET' || request.method === 'HEAD') {
      const asset = await this.env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    return application.fetch(request, { ...this.env, ...runtime }, this.ctx);
  }
}
export default { fetch() { return new Response('Not found', { status: 404 }); } };
