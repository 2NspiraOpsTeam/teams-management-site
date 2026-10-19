import { NextResponse } from 'next/server';
import { requireAdmin, sameOrigin, unauthorized } from '@/lib/admin-auth';
import { ContentValidationError, contentPage } from '@/lib/website-content';
import { ContentConflict, mutateContent, readContent } from '@/lib/website-content-store';
export const runtime='nodejs';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
type Context={params:Promise<{page:string}>};
export async function GET(_request:Request,{params}:Context){
  const admin=await requireAdmin();if(!admin)return unauthorized();
  const {page}=await params;if(!contentPage(page))return reply({error:'Page not found'},404);
  try{return reply(await readContent(admin.db,page));}catch{return reply({error:'Website Content is unavailable. Please try again.'},503);}
}
export async function POST(request:Request,{params}:Context){
  const admin=await requireAdmin();if(!admin)return unauthorized();
  if(!sameOrigin(request)||!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'Invalid request'},403);
  const {page}=await params;if(!contentPage(page))return reply({error:'Page not found'},404);
  let input;try{const text=await request.text();if(text.length>100000)return reply({error:'Page text is too large.'},413);input=JSON.parse(text);}catch{return reply({error:'Invalid page text.'},400);}
  if(!input||typeof input!=='object')return reply({error:'Invalid page text.'},400);
  try{return reply(await mutateContent(admin.db,page,admin.email,input));}
  catch(error){if(error instanceof ContentConflict)return reply({error:error.message},409);if(error instanceof ContentValidationError)return reply({error:error.message},400);return reply({error:'Could not save this change. Your text is still shown. Please try again.'},503);}
}
