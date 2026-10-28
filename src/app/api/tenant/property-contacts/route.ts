import { json } from '@/lib/operations/handler';
import { OperationError } from '@/lib/operations/validation';
import { approvedPropertyContacts } from '@/lib/operations/tenant-leases';
export const runtime='nodejs';
export async function GET(){try{return json({contacts:await approvedPropertyContacts()});}catch(e){return json({error:e instanceof OperationError?e.message:'Contacts are temporarily unavailable.'},e instanceof OperationError?e.status:503);}}
