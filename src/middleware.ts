import { NextResponse, type NextRequest } from 'next/server';
import { cursorCookie, visitCookie } from './lib/featured-rotation';
const visitPages = new Set(['/', '/about', '/properties', '/retail', '/rent-with-us', '/gallery', '/contact', '/tenant-services', '/dining']);
function secured(response: NextResponse, privateRoute = false) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Content-Security-Policy', "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'");
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (privateRoute) response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
// Cookie presence is only an early rejection. Pages and APIs validate the D1 session independently.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sensitive = path === '/access' || path === '/tenant' || path.startsWith('/tenant/') || path === '/admin' || path.startsWith('/admin/') || path.startsWith('/api/');
  // Robots directives supplement authentication; they never replace it.
  const protect = (response:NextResponse, privateRoute=false) => {
    if(sensitive)response.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
    return secured(response,privateRoute);
  };
  if (path === '/properties/609-golden-gate-pt-unit-402') {
    const destination = request.nextUrl.clone();
    destination.pathname = '/properties/609-golden-gate-pt';
    return secured(NextResponse.redirect(destination, 308));
  }
  const adminRoute = path === '/admin' || path.startsWith('/admin/') || path.startsWith('/api/admin/');
  if (!adminRoute) {
    if (visitPages.has(path) && ['GET', 'HEAD'].includes(request.method) && !request.cookies.get(visitCookie)?.value) {
      const value = request.cookies.get(cursorCookie)?.value;
      const prior = value ? Number(value) : NaN;
      const visit = Number.isSafeInteger(prior) && prior >= 0 ? (prior + 1) % 1000000 : 0;
      // Render the first request directly: sharing crawlers and cookie-disabled
      // visitors cannot complete a cookie-setting redirect back to this URL.
      const headers = new Headers(request.headers);
      const cookie = request.headers.get('cookie');
      headers.set('cookie', `${cookie ? `${cookie}; ` : ''}${visitCookie}=${visit}`);
      const response = NextResponse.next({ request: { headers } });
      response.cookies.set(visitCookie, String(visit), { path: '/', sameSite: 'lax', secure: request.nextUrl.protocol === 'https:' });
      response.cookies.set(cursorCookie, String(visit), { path: '/', sameSite: 'lax', secure: request.nextUrl.protocol === 'https:', maxAge: 60 * 60 * 24 * 365 });
      return secured(response, true);
    }
    return protect(NextResponse.next(), path === '/tenant' || path.startsWith('/tenant/') || path.startsWith('/api/tenant/') || path === '/access');
  }
  if (path === '/api/admin/session') return protect(NextResponse.next(), true);
  if (!request.cookies.get('teams_admin_session')?.value) {
    return protect(path === '/admin' || path.startsWith('/admin/') ? NextResponse.redirect(new URL('/access', request.url)) : new NextResponse('Not found', { status: 404 }), true);
  }
  return protect(NextResponse.next(), true);
}
export const config = { matcher: ['/admin/:path*', '/api/:path*', '/tenant/:path*', '/access', '/', '/about', '/properties/:path*', '/retail/:path*', '/rent-with-us/:path*', '/gallery', '/contact', '/tenant-services', '/dining', '/services', '/privacy-policy', '/terms-and-conditions', '/terms-of-use', '/copyright', '/accessibility', '/fair-housing', '/robots.txt', '/sitemap.xml'] };
