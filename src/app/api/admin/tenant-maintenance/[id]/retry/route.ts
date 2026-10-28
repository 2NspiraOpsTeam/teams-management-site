import {
  requireAdmin,
  sameOrigin,
  unauthorized,
  adminEnv,
  audit,
} from "@/lib/admin-auth";
import { reply, input } from "@/lib/work-orders/server";
import { deliver } from "@/lib/work-orders/notifications";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const a = await requireAdmin();
  if (!a) return unauthorized();
  if (!sameOrigin(request)) return unauthorized();
  try {
    const { id } = await params,
      v = await input(request);
    if (typeof v.notificationId !== "string")
      return reply({ error: "Choose a notification." }, 400);
    const n = await a.db
      .prepare(
        "SELECT id,state,attempts FROM work_order_notifications WHERE id=? AND request_id=?",
      )
      .bind(v.notificationId, id)
      .first<{ id: string; state: string; attempts: number }>();
    if (!n) return reply({ error: "Notification not found." }, 404);
    if (!["pending", "failed"].includes(n.state) || n.attempts >= 5)
      return reply(
        {
          error:
            "This delivery cannot safely be retried. Review its provider outcome.",
        },
        409,
      );
    await audit(
      a.db,
      a.email,
      "notification_retry",
      "tenant_maintenance_request",
      id,
      null,
      { notificationId: n.id },
    );
    await deliver(a.db, adminEnv(), n.id);
    return reply({ ok: true });
  } catch {
    return reply({ error: "Notification retry unavailable." }, 503);
  }
}
