import { WorkerEntrypoint } from 'cloudflare:workers';
import {preparedPhotoRequest,preparedPhotoResponse} from './prepared-photo.mjs';
import { privatePhotoPath } from './private-photo-path.mjs';
import { observeRequest } from './request-observation.mjs';
import { meterDatabase } from './d1-meter.mjs';
import application from '../../.open-next/worker.js';

// Only the same-account Pages service binding can invoke this entrypoint.
// Secrets stay configured on Pages and travel over private RPC, never HTTP headers.
export class TeamsPreviewRuntime extends WorkerEntrypoint {
  async handleRequest(request, configuration) {
    // Keep the replica stable while approved migration batches are applied.
    // Default is off; read-only browsing remains available during a copy.
    if (this.env.TEAMS_MIGRATION_WRITE_FREEZE === '1' && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return new Response('Development data maintenance is in progress. Please retry shortly.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store', 'Retry-After': '60' },
      });
    }
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
    const identify = response => {
      const result = new Response(response.body, response);
      result.headers.set('X-Teams-Release', this.env.TEAMS_RELEASE_SHA || 'local');
      result.headers.set('X-Teams-Runtime', 'OpenNext');
      return result;
    };
    if (privatePhotoPath(new URL(request.url).pathname)) return identify(new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}}));
    if(preparedPhotoRequest(request)){
      const usage={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};
      try{
        const response=await observeRequest(request,this.env.TEAMS_RELEASE_SHA||'local',()=>preparedPhotoResponse(request,{...this.env,DB:meterDatabase(this.env.DB,usage)}));
        usage.status=response.status;return identify(response);
      }finally{console.log(JSON.stringify({event:'teams_d1_usage',pipeline:'prepared-photo',route:'api/media/:resource',method:request.method,release:this.env.TEAMS_RELEASE_SHA||'local',usageWarning:usage.rowsRead>20000||Boolean(usage.failedQueries||usage.missingMetadataQueries),...usage}));}
    }
    if (request.method === 'GET' || request.method === 'HEAD') {
      const asset = await this.env.ASSETS.fetch(request);
      if (asset.status !== 404) return identify(asset);
    }
    const usage={queries:0,rowsRead:0,rowsWritten:0,durationMs:0};
    const environment={...this.env,...runtime,DB:meterDatabase(this.env.DB,usage)};
    try{const response=await observeRequest(request,this.env.TEAMS_RELEASE_SHA||'local',()=>application.fetch(request,environment,this.ctx));usage.status=response.status;return identify(response);}
    finally{
      // Path template only; IDs, search terms, cookies and request bodies are omitted.
      const parts=new URL(request.url).pathname.split('/').filter(Boolean);
      const safe=new Set(['api','admin','operations','overview','properties','units','tenants','leases','rent-roll','phone-list','maintenance','tenant-maintenance','tenant','auth','session','sync','renewals','buildings','map','access','tenant-services','media','content','assignments','presentation','videos','home','assets']);
      const route=parts.slice(0,4).map(p=>safe.has(p)?p:':resource').join('/');
      const referrer=request.headers.get('referer');let sourceView='unknown';
      if(parts[0]==='api'&&parts[1]==='media'&&referrer){try{const u=new URL(referrer);if(u.origin===new URL(request.url).origin)sourceView=u.pathname==='/'?'home':u.pathname.startsWith('/properties/')?'property':u.pathname.startsWith('/residential')?'residential':u.pathname.startsWith('/retail')?'retail':u.pathname.startsWith('/dining')?'dining':'other';}catch{}}
      const usageWarning=usage.rowsRead>20000||usage.queries>60||Boolean(usage.failedQueries||usage.missingMetadataQueries);
      console.log(JSON.stringify({event:'teams_d1_usage',sourceView,usageWarning,release:this.env.TEAMS_RELEASE_SHA||'local',route,method:request.method,...usage}));
    }
  }
}
export default { fetch() { return new Response('Not found', { status: 404 }); } };
