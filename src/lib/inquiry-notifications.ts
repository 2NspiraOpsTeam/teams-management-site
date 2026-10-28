import type { D1Database } from '@cloudflare/workers-types';
import { MailService, type MailEnv } from './mail-service';
export type NotificationEnv = MailEnv;
const emailPattern = /^[^\s@,<>\r\n]+@[^\s@,<>\r\n]+\.[^\s@,<>\r\n]+$/;

export async function attemptInquiryNotification(db: D1Database, env: NotificationEnv, id: string) {
  const sender = env.INQUIRY_FROM?.trim();
  const destination = env.INQUIRY_NOTIFY_TO?.trim();
  // Only the server-configured, exact approved receipt can enable a QA copy.
  // Public request bodies cannot choose recipients or the QA subject.
  const qa = env.INQUIRY_QA_ID === id;
  const qaTo = qa ? env.INQUIRY_QA_TO?.trim() : undefined;
  const mail = new MailService(env);
  if (!sender || !destination || !emailPattern.test(sender) || !emailPattern.test(destination) ||
      (qa && (!qaTo || !emailPattern.test(qaTo))) || !mail.configured()) {
    await db.prepare("UPDATE inquiry_notifications SET state='pending', error_code='configuration_pending' WHERE inquiry_id=? AND attempts=0 AND state='pending'").bind(id).run();
    return;
  }
  const recipient = [...new Set([destination, ...(qaTo ? [qaTo] : [])])].join(', ');
  // Claim before sending: concurrent jobs and browser retries cannot send twice.
  // Unknown delivery is never blindly replayed; a provider timeout may have sent it.
  const claimed = await db.prepare("UPDATE inquiry_notifications SET state='unknown', destination=?, attempts=attempts+1, last_attempt_at=datetime('now'), error_code=NULL WHERE inquiry_id=? AND attempts=0 AND state='pending'").bind(recipient, id).run();
  if (!claimed.meta.changes) return;
  try {
    const providerId = await mail.sendInquiryNotification(recipient, id, qa);
    await db.prepare("UPDATE inquiry_notifications SET state='sent',provider_id=?,error_code=NULL WHERE inquiry_id=?").bind(providerId, id).run();
  } catch (error) {
    // Explicit provider rejection is different from an ambiguous network outcome.
    const code = error instanceof Error ? error.message : '';
    const rejected = /^gmail_(?:token_http_\d+|token_missing|send_http_\d+|not_configured)$/.test(code);
    await db.prepare('UPDATE inquiry_notifications SET state=?,error_code=? WHERE inquiry_id=?')
      .bind(rejected ? 'failed' : 'unknown', rejected ? code : 'network_unknown', id).run();
  }
}
