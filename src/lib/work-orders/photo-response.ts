import type { D1Database } from "@cloudflare/workers-types";
import { reply } from "./server";
export async function photoResponse(
  db: D1Database,
  id: string,
  tenantId?: string,
) {
  const p = await db
    .prepare(
      `SELECT p.mime,p.content_base64 FROM work_order_photos p JOIN tenant_maintenance_requests r ON r.id=p.request_id JOIN tenant_assignments a ON a.id=r.assignment_id AND a.tenant_id=r.tenant_id JOIN units u ON u.id=a.unit_id AND u.building_id=a.building_id WHERE p.id=? ${tenantId ? "AND r.tenant_id=? AND a.active=1" : ""}`,
    )
    .bind(...(tenantId ? [id, tenantId] : [id]))
    .first<{ mime: string; content_base64: string }>();
  if (!p) return reply({ error: "Photo not found." }, 404);
  return new Response(
    Uint8Array.from(atob(p.content_base64), (c) => c.charCodeAt(0)),
    {
      headers: {
        "Content-Type": p.mime,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": 'inline; filename="maintenance-photo"',
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    },
  );
}
