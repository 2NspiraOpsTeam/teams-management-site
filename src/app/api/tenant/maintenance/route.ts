import { sameOrigin, hash } from "@/lib/admin-auth";
import { currentTenant, tenantDb } from "@/lib/tenant-auth";
import {
  reply,
  input,
  uuid,
  text,
  category,
  photos,
  orderSelect,
  photoStatements,
  notificationStatement,
  auditStatement,
} from "@/lib/work-orders/server";
import { schedule } from "@/lib/work-orders/notifications";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const tenant = await currentTenant();
  if (!tenant) return reply({ error: "Unauthorized" }, 401);
  try {
    const before = Number(
      request ? new URL(request.url).searchParams.get("before") : 0,
    );
    const cursor =
      Number.isSafeInteger(before) && before > 0
        ? before
        : Number.MAX_SAFE_INTEGER;
    const rows = await tenantDb()
      .prepare(
        orderSelect +
          " WHERE r.tenant_id=? AND a.active=1 AND d.number<? ORDER BY d.number DESC LIMIT 51",
      )
      .bind(tenant.id, cursor)
      .all();
    return reply({
      requests: rows.results.slice(0, 50),
      hasMore: rows.results.length > 50,
    });
  } catch {
    return reply({ error: "Request history is temporarily unavailable." }, 503);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Unauthorized" }, 401);
  const tenant = await currentTenant();
  if (!tenant) return reply({ error: "Unauthorized" }, 401);
  let v;
  try {
    v = await input(request);
  } catch {
    return reply({ error: "Invalid or oversized request." }, 400);
  }
  let c: string, description: string, access: string, items;
  const id = v.idempotencyKey,
    assignment = v.assignmentId,
    permission = v.permissionToEnter;
  try {
    if (
      typeof id !== "string" ||
      !uuid.test(id) ||
      typeof assignment !== "string" ||
      !["routine", "urgent"].includes(String(v.urgency)) ||
      !["email", "phone"].includes(String(v.preferredContact)) ||
      typeof permission !== "boolean"
    )
      throw Error(
        "Complete the required fields, including permission to enter.",
      );
    c = category(v.category);
    description = text(v.description, 3000, 10);
    access = text(v.accessInstructions ?? "", 1000);
    items = photos(v.photos);
  } catch (e) {
    return reply({ error: (e as Error).message }, 400);
  }
  const db = tenantDb(),
    fingerprint = await hash(
      JSON.stringify({
        assignment,
        c,
        description,
        access,
        permission,
        urgency: v.urgency,
        contact: v.preferredContact,
        items,
      }),
    );
  const saved = async () =>
    db
      .prepare(
        "SELECT d.number,d.payload_hash,r.status FROM tenant_maintenance_requests r JOIN work_order_details d ON d.request_id=r.id WHERE r.id=? AND r.tenant_id=?",
      )
      .bind(id, tenant.id)
      .first<{ number: number; payload_hash: string; status: string }>();
  try {
    const previous = await saved();
    if (previous)
      return previous.payload_hash === fingerprint
        ? reply({
            id,
            number: previous.number,
            status: previous.status,
            duplicate: true,
          })
        : reply({ error: "This receipt belongs to a different request." }, 409);
    const authorized = await db
      .prepare(
        "SELECT a.id FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE a.id=? AND a.tenant_id=? AND a.active=1",
      )
      .bind(assignment, tenant.id)
      .first();
    if (!authorized)
      return reply({ error: "Property or unit unavailable." }, 403);
    const recent = await db
      .prepare(
        "SELECT COUNT(*) AS n FROM tenant_maintenance_requests WHERE tenant_id=? AND submitted_at>datetime('now','-1 day')",
      )
      .bind(tenant.id)
      .first<{ n: number }>();
    if ((recent?.n || 0) >= 20)
      return reply(
        {
          error:
            "Daily request limit reached. Contact management if you need help.",
        },
        429,
      );
    const eventId = "submitted-" + id;
    await db.batch([
      db
        .prepare(
          "INSERT INTO tenant_maintenance_requests(id,tenant_id,assignment_id,category,description,urgency,preferred_contact) SELECT ?,a.tenant_id,a.id,?,?,?,? FROM tenant_assignments a JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE a.id=? AND a.tenant_id=? AND a.active=1",
        )
        .bind(
          id,
          c,
          description,
          v.urgency,
          v.preferredContact,
          assignment,
          tenant.id,
        ),
      db
        .prepare(
          "UPDATE work_order_details SET permission_to_enter=?,access_instructions=?,payload_hash=? WHERE request_id=?",
        )
        .bind(permission ? 1 : 0, access, fingerprint, id),
      ...photoStatements(db, id as string, eventId, items),
      notificationStatement(db, id as string, eventId, "management"),
      notificationStatement(db, id as string, eventId, "tenant"),
      auditStatement(db, tenant.id, id as string, "submitted", {
        category: c,
        photos: items.length,
      }),
    ]);
    const row = await saved();
    schedule(db, eventId);
    return reply({ id, number: row!.number, status: "submitted" }, 201);
  } catch {
    const row = await saved().catch(() => null);
    if (row?.payload_hash === fingerprint)
      return reply({
        id,
        number: row.number,
        status: row.status,
        duplicate: true,
      });
    return reply(
      {
        error:
          "We could not save your request. Your draft is unchanged; please retry.",
      },
      503,
    );
  }
}
