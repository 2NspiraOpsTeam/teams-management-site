import { NextResponse, type NextRequest } from 'next/server';

// Admin workflows are not exposed until server-side authentication is wired.
// Client-side navigation or hidden links are not an authorization boundary.
export function middleware(_request: NextRequest) {
  return new NextResponse('Not found', { status: 404 });
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
