import type { D1Database } from '@cloudflare/workers-types';

/** Metadata only: never persist codes, message bodies or raw provider errors. */
export async function trackLoginEmail(db: D1Database, portal: 'admin' | 'tenant', recipient: string, send: () => Promise<string>) {
  const id = crypto.randomUUID();
  const metadata = { portal, recipient, status: 'pending' };
  // Persist intent before sending. If storage fails, do not send an untracked code.
  await db.prepare("INSERT INTO audit_log (id,action,entity_type,entity_id,record_after_json,user_actor) VALUES (?,'login_email','login_email',?,?,?)")
    .bind(id, portal, JSON.stringify(metadata), 'system').run();
  let providerId: string;
  try { providerId = await send(); }
  catch (error) {
    // A transport failure can happen after provider acceptance; do not assert non-delivery.
    try { await db.prepare('UPDATE audit_log SET record_after_json=? WHERE id=?').bind(JSON.stringify({ ...metadata, status: 'unknown' }), id).run(); }
    catch { console.warn('Login email outcome could not be recorded'); }
    throw error;
  }
  try {
    await db.prepare('UPDATE audit_log SET record_after_json=? WHERE id=?')
      .bind(JSON.stringify({ ...metadata, status: 'sent', sentAt: new Date().toISOString(), providerId }), id).run();
  } catch {
    // Do not turn an accepted send into a failed request or encourage a duplicate send.
    console.warn('Login email accepted; history update unavailable');
  }
  return providerId;
}
