import { requireAdmin, sameOrigin, unauthorized } from "@/lib/admin-auth";
import {
  reply,
  input,
  text,
  detail,
  eventStatement,
  notificationStatement,
  auditStatement,
} from "@/lib/work-orders/server";
import { statuses } from "@/lib/work-orders/shared";
import { schedule } from "@/lib/work-orders/notifications";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(_r: Request, { params }: Context) {
  const a = await requireAdmin();
  if (!a) return unauthorized();
  try {
    const d = await detail(a.db, (await params).id, true);
    return d ? reply(d) : reply({ error: "Request not found." }, 404);
  } catch {
    return reply({ error: "Request unavailable." }, 503);
  }
}
export async function PATCH(request: Request, { params }: Context) {
  const a = await requireAdmin();
  if (!a) return unauthorized();
  if (!sameOrigin(request)) return unauthorized();
  let v: Record<string, unknown>, note: string, update: string;
  try {
    v = await input(request);
    note = text(v.internalNote ?? "", 5000);
    update = text(v.tenantUpdate ?? "", 2000);
    if (
      typeof v.status !== "string" ||
      !Object.hasOwn(statuses, v.status) ||
      !Number.isInteger(v.revision)
    )
      throw Error();
  } catch {
    return reply(
      { error: "Check the status, notes, and request version." },
      400,
    );
  }
  const { id } = await params;
  try {
    const before = await detail(a.db, id, true);
    if (!before) return reply({ error: "Request not found." }, 404);
    if (before.request.revision !== v.revision)
      return reply(
        { error: "This request changed. Reload before saving." },
        409,
      );
    const changed = before.request.status !== v.status;
    if (!changed && !note && !update) return reply({ ok: true });
    const eventId = crypto.randomUUID(),
      db = a.db;
    const statements = [
      db
        .prepare(
          "UPDATE work_order_details SET revision=CASE WHEN revision=? THEN revision+1 ELSE -1 END,completed_at=CASE WHEN ?='completed' AND ?!='completed' THEN datetime('now') WHEN ? IN ('submitted','in_review','scheduled') THEN NULL ELSE completed_at END WHERE request_id=?",
        )
        .bind(v.revision, v.status, before.request.status, v.status, id),
      db
        .prepare(
          "UPDATE tenant_maintenance_requests SET status=?,updated_at=datetime('now') WHERE id=?",
        )
        .bind(v.status, id),
    ];
    if (changed || update) {
      statements.push(
        eventStatement(
          db,
          id,
          eventId,
          changed ? "status" : "update",
          "tenant",
          changed ? String(v.status) : null,
          update,
          "admin",
          a.email,
        ),
        notificationStatement(db, id, eventId, "tenant"),
      );
    }
    if (note)
      statements.push(
        eventStatement(
          db,
          id,
          crypto.randomUUID(),
          "internal",
          "internal",
          null,
          note,
          "admin",
          a.email,
        ),
      );
    statements.push(
      auditStatement(db, a.email, id, "updated", {
        fromStatus: before.request.status,
        toStatus: v.status,
        internalNoteAdded: Boolean(note),
        tenantUpdateAdded: Boolean(update),
        revision: v.revision,
      }),
    );
    await db.batch(statements);
    if (changed || update) schedule(db, eventId);
    return reply({ ok: true });
  } catch {
    return reply(
      {
        error:
          "Could not save. Reload and retry; concurrent changes may have occurred.",
      },
      409,
    );
  }
}
