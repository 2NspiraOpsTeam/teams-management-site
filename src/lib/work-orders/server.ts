import type { D1Database } from "@cloudflare/workers-types";
import { NextResponse } from "next/server";
import { boundedBody } from "@/lib/request-body";
import { categories, type PhotoInput, type Detail } from "./shared";
export const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function input(
  request: Request,
): Promise<Record<string, unknown>> {
  const data = JSON.parse(
    new TextDecoder().decode(await boundedBody(request, 3_600_000)),
  );
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw Error("Invalid request.");
  return data;
}
export function text(value: unknown, max: number, min = 0) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.length > max
  )
    throw Error("Please check the required fields and text length.");
  return value.trim();
}
export function category(value: unknown) {
  if (typeof value !== "string" || !Object.hasOwn(categories, value))
    throw Error("Select a maintenance category.");
  return value;
}
export function photos(value: unknown): PhotoInput[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 4)
    throw Error("Choose up to four photos at a time.");
  return value.map((p) => {
    if (
      !p ||
      typeof p.data !== "string" ||
      typeof p.mime !== "string" ||
      p.data.length > 866668 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(p.data)
    )
      throw Error("Invalid photo.");
    let b: string;
    try {
      b = atob(p.data);
    } catch {
      throw Error("Invalid photo.");
    }
    if (b.length < 12 || b.length > 650000)
      throw Error("Each photo must be no larger than 650 KB.");
    const bytes = Uint8Array.from(b, (c) => c.charCodeAt(0));
    const ok =
      p.mime === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : p.mime === "image/png"
          ? bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
          : p.mime === "image/webp"
            ? b.slice(0, 4) === "RIFF" && b.slice(8, 12) === "WEBP"
            : false;
    if (!ok) throw Error("Only JPEG, PNG and WebP photos are supported.");
    return { mime: p.mime, data: p.data };
  });
}
export const orderSelect = `SELECT r.id,d.number,d.revision,r.category,r.description,r.status,r.preferred_contact,r.submitted_at,r.updated_at,d.completed_at,d.permission_to_enter,d.access_instructions,b.name AS property_name,b.address_json,u.unit_identifier,a.building_id,t.email,t.display_name FROM tenant_maintenance_requests r JOIN work_order_details d ON d.request_id=r.id JOIN tenant_assignments a ON a.id=r.assignment_id AND a.tenant_id=r.tenant_id JOIN tenant_accounts t ON t.id=r.tenant_id JOIN buildings b ON b.id=a.building_id JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id`;
export async function authorized(db: D1Database, id: string, tenantId: string) {
  return db
    .prepare(
      "SELECT r.id FROM tenant_maintenance_requests r JOIN tenant_assignments a ON a.id=r.assignment_id AND a.tenant_id=r.tenant_id JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE r.id=? AND r.tenant_id=? AND a.active=1",
    )
    .bind(id, tenantId)
    .first();
}
export async function detail(
  db: D1Database,
  id: string,
  admin = false,
): Promise<Detail | null> {
  const row = await db
    .prepare(orderSelect + " WHERE r.id=?")
    .bind(id)
    .first<Detail["request"]>();
  if (!row) return null;
  const events = await db
    .prepare(
      `SELECT id,kind,status,body,actor_type,created_at,visibility${admin ? ",actor_id" : ""} FROM work_order_events WHERE request_id=? ${admin ? "" : "AND visibility='tenant'"} ORDER BY created_at,rowid`,
    )
    .bind(id)
    .all<Detail["events"][number]>();
  const photos = await db
    .prepare(
      "SELECT id,event_id,mime FROM work_order_photos WHERE request_id=? ORDER BY created_at,rowid",
    )
    .bind(id)
    .all<Detail["photos"][number]>();
  if (!admin)
    return { request: row, events: events.results, photos: photos.results };
  const notes = await db
    .prepare("SELECT staff_notes FROM tenant_maintenance_requests WHERE id=?")
    .bind(id)
    .first<{ staff_notes: string }>();
  const notifications = await db
    .prepare(
      "SELECT id,state,audience,error_code,attempts FROM work_order_notifications WHERE request_id=? ORDER BY created_at",
    )
    .bind(id)
    .all<NonNullable<Detail["notifications"]>[number]>();
  return {
    request: { ...row, staff_notes: notes?.staff_notes },
    events: events.results,
    photos: photos.results,
    notifications: notifications.results,
  };
}
export function photoStatements(
  db: D1Database,
  id: string,
  eventId: string,
  items: PhotoInput[],
) {
  return items.map((p) =>
    db
      .prepare(
        "INSERT INTO work_order_photos(id,request_id,event_id,mime,bytes,content_base64) VALUES (?,?,?,?,?,?)",
      )
      .bind(
        crypto.randomUUID(),
        id,
        eventId,
        p.mime,
        atob(p.data).length,
        p.data,
      ),
  );
}
export function eventStatement(
  db: D1Database,
  id: string,
  eventId: string,
  kind: string,
  visibility: string,
  status: string | null,
  body: string,
  actorType: string,
  actor: string,
) {
  return db
    .prepare(
      "INSERT INTO work_order_events(id,request_id,kind,visibility,status,body,actor_type,actor_id) VALUES (?,?,?,?,?,?,?,?)",
    )
    .bind(eventId, id, kind, visibility, status, body, actorType, actor);
}
export function notificationStatement(
  db: D1Database,
  id: string,
  eventId: string,
  audience: string,
) {
  return db
    .prepare(
      "INSERT INTO work_order_notifications(id,request_id,event_id,audience) VALUES (?,?,?,?)",
    )
    .bind(crypto.randomUUID(), id, eventId, audience);
}
export function auditStatement(
  db: D1Database,
  actor: string,
  id: string,
  action: string,
  data: object,
) {
  return db
    .prepare(
      "INSERT INTO audit_log(id,action,entity_type,entity_id,record_after_json,user_actor) VALUES (?,?,'tenant_maintenance_request',?,?,?)",
    )
    .bind(crypto.randomUUID(), action, id, JSON.stringify(data), actor);
}
