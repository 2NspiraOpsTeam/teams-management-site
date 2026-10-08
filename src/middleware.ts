import { NextResponse, type NextRequest } from 'next/server';
// App pages and every API route independently validate the D1-backed session.
// Middleware's cookie check is a coarse early rejection, never the auth boundary.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/admin/session') return NextResponse.next();
  if (!request.cookies.get('teams_admin_session')?.value) return new NextResponse('Not found', { status: 404 });
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
