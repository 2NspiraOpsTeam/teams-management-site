import { beforeEach, describe, expect, it, vi } from 'vitest';
const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/admin-auth', () => ({ requireAdmin: auth.requireAdmin, unauthorized: () => new Response('{}', {status:401}) }));
import { GET } from '@/app/api/admin/login-emails/route';
beforeEach(() => vi.clearAllMocks());
describe('Admin login email history API', () => {
  it('rejects anonymous and tenant-only requests', async () => {
    auth.requireAdmin.mockResolvedValue(null);
    expect((await GET(new Request('https://example.test/api/admin/login-emails'))).status).toBe(401);
  });
  it('validates filters before querying history', async () => {
    const prepare = vi.fn(); auth.requireAdmin.mockResolvedValue({db:{prepare}});
    expect((await GET(new Request('https://example.test/api/admin/login-emails?portal=invalid'))).status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
  });
  it('bounds results, exposes no provider ids and returns a pagination cursor', async () => {
    const results = Array.from({length:51}, (_,i) => ({id:`id-${i}`,created_at:'2026-10-21 10:00:00',record_after_json:JSON.stringify({recipient:'qa@example.test',portal:'tenant',status:'sent',providerId:'private-id'})}));
    const bind = vi.fn(() => ({all:async () => ({results})})); const prepare = vi.fn((_sql: string) => ({bind}));
    auth.requireAdmin.mockResolvedValue({db:{prepare}});
    const response = await GET(new Request('https://example.test/api/admin/login-emails?portal=tenant'));
    const data = await response.json(); expect(data.items).toHaveLength(50); expect(data.next).toBe('id-49');
    expect(JSON.stringify(data)).not.toContain('private-id'); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(bind).toHaveBeenCalledWith('tenant','tenant','',''); expect(prepare.mock.calls[0][0]).toContain('LIMIT 51');
  });
  it('returns a recoverable error on storage failure', async () => {
    auth.requireAdmin.mockResolvedValue({db:{prepare:()=>{throw new Error('private');}}});
    const response = await GET(new Request('https://example.test/api/admin/login-emails'));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain('private');
  });
});
