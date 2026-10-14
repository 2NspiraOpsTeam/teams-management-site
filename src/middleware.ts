import { NextResponse, type NextRequest } from 'next/server';
import { cursorCookie, visitCookie } from './lib/featured-rotation';
// App pages and every API route independently validate the D1-backed session.
// Middleware's cookie check is a coarse early rejection, never the auth boundary.
export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/api/admin')) {
    if (request.cookies.get(visitCookie)?.value) return NextResponse.next();
    const prior = Number(request.cookies.get(cursorCookie)?.value);
    const visit = Number.isSafeInteger(prior) && prior >= 0 ? (prior + 1) % 1000000 : 0;
    const response = NextResponse.redirect(request.nextUrl);
    response.cookies.set(visitCookie, String(visit), { path: '/', sameSite: 'lax', secure: request.nextUrl.protocol === 'https:' });
    response.cookies.set(cursorCookie, String(visit), { path: '/', sameSite: 'lax', secure: request.nextUrl.protocol === 'https:', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }
  if (request.nextUrl.pathname === '/api/admin/session') return NextResponse.next();
  if (!request.cookies.get('teams_admin_session')?.value) {
    if (request.nextUrl.pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/access', request.url));
    return new NextResponse('Not found', { status: 404 });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/', '/about', '/properties', '/retail', '/rent-with-us', '/gallery', '/contact', '/tenant-services', '/dining'] };
