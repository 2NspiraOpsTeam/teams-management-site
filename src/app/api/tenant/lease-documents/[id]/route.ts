import { json } from '@/lib/operations/handler';
import { OperationError } from '@/lib/operations/validation';
import { tenantDocument } from '@/lib/operations/tenant-leases';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{return await tenantDocument((await params).id);}catch(e){return json({error:e instanceof OperationError?e.message:'Document is temporarily unavailable.'},e instanceof OperationError?e.status:503);}}
