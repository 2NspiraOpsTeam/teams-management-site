import { json } from '@/lib/operations/handler';
import { OperationError } from '@/lib/operations/validation';
import { tenantLeaseList } from '@/lib/operations/tenant-leases';
export const runtime='nodejs';
export async function GET(){try{return json({leases:await tenantLeaseList()});}catch(e){return json({error:e instanceof OperationError?e.message:'Lease information is temporarily unavailable.'},e instanceof OperationError?e.status:503);}}
