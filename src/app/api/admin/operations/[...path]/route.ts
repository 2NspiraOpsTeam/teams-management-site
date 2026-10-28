import { operationsRequest } from '@/lib/operations/handler';
export const runtime='nodejs';
type Context={params:Promise<{path:string[]}>};
export async function GET(request:Request,context:Context){return operationsRequest(request,(await context.params).path);}
export async function POST(request:Request,context:Context){return operationsRequest(request,(await context.params).path);}
export async function PATCH(request:Request,context:Context){return operationsRequest(request,(await context.params).path);}
