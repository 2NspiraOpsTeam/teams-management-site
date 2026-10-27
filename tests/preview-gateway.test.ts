import { describe, expect, it, vi } from 'vitest';
import gateway from '../deployment/preview-gateway/_worker.js';

describe('private preview runtime gateway', () => {
  it('fails closed when its private service binding is absent', async () => {
    const response = await gateway.fetch(new Request('https://preview.test/admin',{headers:{cookie:'teams_admin_session=fixture'}}), {});
    expect(response.status).toBe(503);
  });
  it('keeps origin, session and body intact while forwarding only required runtime configuration over RPC', async () => {
    const request = new Request('https://preview.test/api/admin/units', {
      method: 'POST', headers: { origin: 'https://preview.test', cookie: 'teams_admin_session=fixture' }, body: '{"unit":"QA"}',
    });
    const handleRequest = vi.fn(async (received: Request, config: Record<string, string>) => {
      expect(received).toBe(request);
      expect(await received.text()).toBe('{"unit":"QA"}');
      expect(received.headers.get('origin')).toBe(new URL(received.url).origin);
      expect(received.headers.get('cookie')).toBe('teams_admin_session=fixture');
      expect(received.headers.get('GOOGLE_CLIENT_SECRET')).toBeNull();
      expect(config).toEqual({ GOOGLE_CLIENT_SECRET: 'synthetic-secret', ADMIN_OTP_PEPPER: 'synthetic-pepper' });
      return new Response('saved', { headers: { 'Set-Cookie': 'session=fixture; HttpOnly; Secure; SameSite=Lax' } });
    });
    const response = await gateway.fetch(request, { TEAMS_RUNTIME: { handleRequest }, GOOGLE_CLIENT_SECRET: 'synthetic-secret', ADMIN_OTP_PEPPER: 'synthetic-pepper', DB: { private: true }, UNRELATED_SECRET: 'not-forwarded' });
    expect(handleRequest).toHaveBeenCalledOnce();
    expect(response.headers.get('Set-Cookie')).toContain('HttpOnly');
    expect(await response.text()).toBe('saved');
    expect([...response.headers.keys()]).not.toContain('google_client_secret');
  });
});
