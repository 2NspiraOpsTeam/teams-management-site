import { WorkOrderDetail } from "./work-order-detail";
export const runtime = "nodejs";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <WorkOrderDetail id={(await params).id} />;
}
