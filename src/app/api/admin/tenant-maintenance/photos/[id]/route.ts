import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { reply } from "@/lib/work-orders/server";
import { photoResponse } from "@/lib/work-orders/photo-response";
export const runtime = "nodejs";
export async function GET(
  _r: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const a = await requireAdmin();
  if (!a) return unauthorized();
  try {
    return await photoResponse(a.db, (await params).id);
  } catch {
    return reply({ error: "Photo unavailable." }, 503);
  }
}
