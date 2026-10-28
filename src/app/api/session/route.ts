import { NextResponse } from 'next/server';
import { activeAdmin, sameOrigin } from '@/lib/admin-auth';
import { boundedBody, BodyTooLarge } from '@/lib/request-body';
import { POST as adminSignIn } from '../admin/session/route';
import { POST as tenantSignIn } from '../tenant/session/route';

export const runtime = 'nodejs';
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Reuse the existing OTP, throttling, atomic code claims and role-specific cookies.
// Never accept a browser-supplied role or destination, or fall back after failed verification.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: 'Unauthorized' }, 401);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ error: 'Expected JSON.' }, 415);
  let input: { email?: unknown; action?: unknown; code?: unknown };
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(await boundedBody(request, 4096)));
    if (!value || typeof value !== 'object' || Array.isArray(value)) return reply({ error: 'Invalid sign-in request.' }, 400);
    input = value;
  } catch (error) {
    return reply({ error: 'Invalid sign-in request.' }, error instanceof BodyTooLarge ? 413 : 400);
  }
  if (input.action !== 'request' && input.action !== 'verify') return reply({ error: 'Invalid sign-in request.' }, 400);
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (!/^[^\s@]{1,64}@[^\s@]{1,190}$/.test(email)) return reply({ error: 'Enter a valid email address.' }, 400);
  try {
    const admin = await activeAdmin(email);
    const forwarded = new Request(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify({ email, action: input.action, code: input.code }) });
    const response = await (admin ? adminSignIn : tenantSignIn)(forwarded);
    if (response.status === 429) {
      const body = await response.json() as { error?: string; retryAfterSeconds?: number };
      const limited = reply({ error: body.error || 'Too many sign-in code requests. Please try again later.', retryAfterSeconds: body.retryAfterSeconds }, 429);
      const retryAfter = response.headers.get('Retry-After');
      if (retryAfter) limited.headers.set('Retry-After', retryAfter);
      return limited;
    }
    if (!response.ok) return reply({ error: response.status === 503 ? 'Sign-in is temporarily unavailable. Please try again later.' : 'Invalid or expired code. Request a new code and try again.' }, response.status);
    const body = input.action === 'request'
      ? { message: 'If this email is authorized, a sign-in code has been sent.' }
      : { ok: true, role: admin ? 'admin' : 'tenant', redirect: admin ? '/admin' : '/tenant' };
    // Preserve the verified handler's HttpOnly/Secure/SameSite session cookie verbatim.
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'no-store');
    return new NextResponse(JSON.stringify(body), { status: response.status, headers });
  } catch {
    return reply({ error: 'Sign-in is temporarily unavailable. Please try again later.' }, 503);
  }
}
