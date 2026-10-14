import { currentTenant, tenantDb } from "@/lib/tenant-auth";
import { reply } from "@/lib/work-orders/server";
import { photoResponse } from "@/lib/work-orders/photo-response";
export const runtime = "edge";
export async function GET(
  _r: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const t = await currentTenant();
  if (!t) return reply({ error: "Unauthorized" }, 401);
  try {
    return await photoResponse(tenantDb(), (await params).id, t.id);
  } catch {
    return reply({ error: "Photo unavailable." }, 503);
  }
}
