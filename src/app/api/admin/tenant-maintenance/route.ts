import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { reply, orderSelect, maintenanceStatus } from "@/lib/work-orders/server";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const a = await requireAdmin();
  if (!a) return unauthorized();
  try {
    const q = new URL(request.url).searchParams;
    const rawPage = Number(q.get("page") || 0);
    const page =
      Number.isSafeInteger(rawPage) && rawPage >= 0
        ? Math.min(rawPage, 1_000_000)
        : 0;
    const conditions: string[] = [],
      args: (string | number)[] = [];
    for (const [key, column] of [
      ["building", "a.building_id"],
      ["apartment", "u.unit_identifier"],
      ["status", maintenanceStatus()],
      ["number", "d.number"],
    ]) {
      const value = q.get(key);
      if (value) {
        conditions.push(column + "=?");
        args.push(value.slice(0, 100));
      }
    }
    const rows = await a.db
      .prepare(
        orderSelect +
          (conditions.length ? " WHERE " + conditions.join(" AND ") : "") +
          " ORDER BY r.submitted_at DESC,r.id DESC LIMIT 51 OFFSET ?",
      )
      .bind(...args, page * 50)
      .all();
    return reply({
      requests: rows.results.slice(0, 50),
      truncated: rows.results.length > 50,
    });
  } catch {
    return reply(
      { error: "Maintenance requests unavailable. Please retry." },
      503,
    );
  }
}
