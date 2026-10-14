import { sameOrigin, hash } from "@/lib/admin-auth";
import { currentTenant, tenantDb } from "@/lib/tenant-auth";
import {
  reply,
  input,
  text,
  uuid,
  photos,
  authorized,
  detail,
  eventStatement,
  photoStatements,
  notificationStatement,
  auditStatement,
} from "@/lib/work-orders/server";
import { schedule } from "@/lib/work-orders/notifications";
export const runtime = "edge";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  const t = await currentTenant();
  if (!t) return reply({ error: "Unauthorized" }, 401);
  try {
    const { id } = await params,
      db = tenantDb();
    if (!(await authorized(db, id, t.id)))
      return reply({ error: "Request not found." }, 404);
    return reply((await detail(db, id))!);
  } catch {
    return reply({ error: "Request unavailable. Please retry." }, 503);
  }
}
export async function POST(request: Request, { params }: Context) {
  if (!sameOrigin(request)) return reply({ error: "Unauthorized" }, 401);
  const t = await currentTenant();
  if (!t) return reply({ error: "Unauthorized" }, 401);
  const { id } = await params,
    db = tenantDb();
  try {
    if (!(await authorized(db, id, t.id)))
      return reply({ error: "Request not found." }, 404);
    let v: Record<string, unknown>,
      body: string,
      items: ReturnType<typeof photos>;
    try {
      v = await input(request);
      body = text(v.body ?? "", 2000);
      items = photos(v.photos);
    } catch (error) {
      return reply(
        {
          error:
            error instanceof SyntaxError
              ? "Invalid request."
              : (error as Error).message,
        },
        400,
      );
    }
    const eventId = v.idempotencyKey;
    if (
      typeof eventId !== "string" ||
      !uuid.test(eventId) ||
      (!body && !items.length)
    )
      return reply({ error: "Add an update or a photo." }, 400);
    const fingerprint = await hash(JSON.stringify({ body, items }));
    const existing = await db
      .prepare(
        "SELECT request_id,actor_id,payload_hash FROM work_order_events WHERE id=?",
      )
      .bind(eventId)
      .first<{ request_id: string; actor_id: string; payload_hash: string }>();
    if (existing)
      return existing.request_id === id &&
        existing.actor_id === t.id &&
        existing.payload_hash === fingerprint
        ? reply({ ok: true, duplicate: true })
        : reply({ error: "This receipt belongs to another update." }, 409);
    const row = await db
      .prepare(
        "SELECT d.revision,r.status,(SELECT COUNT(*) FROM work_order_photos WHERE request_id=r.id) AS count,(SELECT COUNT(*) FROM work_order_events WHERE request_id=r.id) AS updates FROM work_order_details d JOIN tenant_maintenance_requests r ON r.id=d.request_id WHERE r.id=?",
      )
      .bind(id)
      .first<{
        revision: number;
        status: string;
        count: number;
        updates: number;
      }>();
    if (!row) return reply({ error: "Request not found." }, 404);
    if (row.status === "closed")
      return reply(
        {
          error:
            "This request is closed. Submit a new request if you need more help.",
        },
        409,
      );
    if (row.count + items.length > 12 || row.updates >= 100)
      return reply(
        {
          error:
            "This request has reached its update or photo limit. Please contact management.",
        },
        409,
      );
    await db.batch([
      db
        .prepare(
          "UPDATE work_order_details SET revision=CASE WHEN revision=? AND EXISTS(SELECT 1 FROM tenant_assignments a JOIN tenant_maintenance_requests r ON r.assignment_id=a.id AND r.tenant_id=a.tenant_id WHERE r.id=work_order_details.request_id AND a.active=1 AND r.tenant_id=?) THEN revision+1 ELSE -1 END WHERE request_id=?",
        )
        .bind(row.revision, t.id, id),
      db
        .prepare(
          "UPDATE tenant_maintenance_requests SET updated_at=datetime('now') WHERE id=?",
        )
        .bind(id),
      db
        .prepare(
          "INSERT INTO work_order_events(id,request_id,kind,visibility,body,actor_type,actor_id,payload_hash) VALUES (?,?,'update','tenant',?,'tenant',?,?)",
        )
        .bind(eventId, id, body, t.id, fingerprint),
      ...photoStatements(db, id, eventId, items),
      notificationStatement(db, id, eventId, "management"),
      auditStatement(db, t.id, id, "tenant_update", {
        eventId,
        photos: items.length,
      }),
    ]);
    schedule(db, eventId);
    return reply({ ok: true }, 201);
  } catch (e) {
    return reply(
      {
        error:
          e instanceof SyntaxError
            ? "Invalid request."
            : "Could not save the update. Reload the request and retry; no partial update was saved.",
      },
      503,
    );
  }
}
