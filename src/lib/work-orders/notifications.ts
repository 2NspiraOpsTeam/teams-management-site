import type { D1Database } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { adminEnv } from "@/lib/admin-auth";
import { gmailConfigured, sendGmail } from "@/lib/gmail-provider";
import type { MailEnv } from "@/lib/mail-service";
import { statuses, label } from "./shared";
type Env = MailEnv & {
  WORK_ORDER_FROM?: string;
  WORK_ORDER_NOTIFY_TO?: string;
};
const email = /^[^\s@,<>\r\n]+@[^\s@,<>\r\n]+\.[^\s@,<>\r\n]+$/;
export async function deliver(db: D1Database, env: Env, id: string) {
  const n = await db
    .prepare(
      `SELECT n.id,n.audience,n.state,n.attempts,d.number,t.email,t.display_name,e.kind,e.status FROM work_order_notifications n JOIN tenant_maintenance_requests r ON r.id=n.request_id JOIN work_order_details d ON d.request_id=r.id JOIN tenant_accounts t ON t.id=r.tenant_id JOIN work_order_events e ON e.id=n.event_id WHERE n.id=?`,
    )
    .bind(id)
    .first<{
      id: string;
      audience: string;
      state: string;
      attempts: number;
      number: number;
      email: string;
      display_name: string | null;
      kind: string;
      status: string | null;
    }>();
  if (!n || !["pending", "failed"].includes(n.state) || n.attempts >= 5) return;
  const from = env.WORK_ORDER_FROM || env.TENANT_AUTH_FROM;
  const to =
    n.audience === "management"
      ? env.WORK_ORDER_NOTIFY_TO || env.INQUIRY_NOTIFY_TO
      : n.email;
  if (
    !from ||
    !to ||
    !email.test(from) ||
    !email.test(to) ||
    !gmailConfigured(env)
  ) {
    await db
      .prepare(
        "UPDATE work_order_notifications SET error_code='configuration_pending' WHERE id=? AND state IN ('pending','failed')",
      )
      .bind(id)
      .run();
    return;
  }
  const claim = await db
    .prepare(
      "UPDATE work_order_notifications SET state='sending',attempts=attempts+1,last_attempt_at=datetime('now'),error_code=NULL WHERE id=? AND state IN ('pending','failed') AND attempts=?",
    )
    .bind(id, n.attempts)
    .run();
  if (!claim.meta.changes) return;
  try {
    const message =
      n.audience === "management"
        ? `A maintenance request #${n.number} ${n.kind === "submitted" ? "has been submitted" : "has a tenant update"}. Sign in to the Teams Management admin portal to review it.`
        : n.kind === "submitted"
          ? `Your maintenance request #${n.number} has been received. Teams Management will review your request. You can track its progress under Maintenance Requests in your tenant portal.`
          : `Your maintenance request #${n.number} has an update${n.status ? ": " + label(n.status, statuses) : ""}. Sign in to your tenant portal to view the activity history.`;
    const qa = /^(\[QA\]|QA \/ TEST)/i.test(n.display_name || "");
    const provider = await sendGmail(
      env,
      from,
      to,
      `${qa ? "[QA] " : ""}Teams Management — Maintenance request #${n.number}`,
      (qa ? "QA validation only; no maintenance action is required.\n\n" : "") +
        message,
    );
    await db
      .prepare(
        "UPDATE work_order_notifications SET state='sent',provider_id=?,error_code=NULL WHERE id=? AND state='sending'",
      )
      .bind(provider, id)
      .run();
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const rejected =
      /^gmail_(?:token_http_\d+|token_missing|send_http_\d+|not_configured)$/.test(
        code,
      );
    await db
      .prepare(
        "UPDATE work_order_notifications SET state=?,error_code=? WHERE id=? AND state='sending'",
      )
      .bind(
        rejected ? "failed" : "unknown",
        rejected ? code : "delivery_unknown",
        id,
      )
      .run();
  }
}
export function schedule(db: D1Database, eventId: string) {
  const work = (async () => {
    const rows = await db
      .prepare(
        "SELECT id FROM work_order_notifications WHERE event_id=? AND state='pending'",
      )
      .bind(eventId)
      .all<{ id: string }>();
    for (const row of rows.results)
      await deliver(db, adminEnv() as Env, row.id);
  })();
  try {
    getCloudflareContext().ctx.waitUntil(work.catch(() => undefined));
  } catch {
    void work.catch(() => undefined);
  }
}
