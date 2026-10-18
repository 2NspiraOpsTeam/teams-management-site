import { authorize,body } from '@/lib/operations/database';
import { OperationError } from '@/lib/operations/validation';
import { officeAssignments,createOfficeMaintenance } from '@/lib/operations/office-maintenance';
import { reply } from '@/lib/work-orders/server';
export const runtime='nodejs';
const error=(e:unknown)=>reply({error:e instanceof OperationError?e.message:'Maintenance requests unavailable. Please retry.'},e instanceof OperationError?e.status:503);
export async function GET(request:Request){try{const a=await authorize(request);return reply({items:await officeAssignments(a,new URL(request.url).searchParams.get('buildingId')||'')});}catch(e){return error(e);}}
export async function POST(request:Request){try{const a=await authorize(request,true),result=await createOfficeMaintenance(a,await body(request));return reply(result,result.duplicate?200:201);}catch(e){return error(e);}}
