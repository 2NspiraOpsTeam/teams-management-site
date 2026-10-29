import { NextResponse } from 'next/server';
import { adminDb, hash, sameOrigin } from '@/lib/admin-auth';
import { browserCookie, browserCookieOptions, browserToken } from '@/lib/remembered-browser';
export const runtime = 'nodejs';
export async function DELETE(request: Request) {
 if (!sameOrigin(request)) return NextResponse.json({error:'Unauthorized'},{status:401,headers:{'Cache-Control':'no-store'}});
 const token = browserToken(request);
 if (token) await adminDb().prepare("UPDATE admin_remembered_browsers SET revoked_at=datetime('now') WHERE token_hash=?").bind(await hash(token)).run();
 const response = NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 response.cookies.set(browserCookie,'',{...browserCookieOptions,maxAge:0});
 return response;
}
