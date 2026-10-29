import { describe, it, expect, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { trackLoginEmail } from '@/lib/login-email-history';
function database(failAt = 0) {
  const writes: unknown[][] = []; let count = 0;
  const db = { prepare: vi.fn(() => ({ bind: (...values: unknown[]) => ({ run: async () => { writes.push(values); if (++count === failAt) throw new Error('storage'); } }) })) } as unknown as D1Database;
  return { db, writes };
}
describe('login email history', () => {
  it.each(['admin','tenant'] as const)('records accepted %s email without a code or body', async portal => {
    const {db,writes} = database(); const send = vi.fn().mockResolvedValue('provider-1');
    expect(await trackLoginEmail(db,portal,'qa@example.test',send)).toBe('provider-1');
    expect(send).toHaveBeenCalledTimes(1);
    expect(JSON.parse(writes[0][2] as string)).toEqual({portal,recipient:'qa@example.test',status:'pending'});
    expect(JSON.parse(writes[1][0] as string)).toMatchObject({status:'sent',providerId:'provider-1'});
  });
  it('does not send if intent cannot be persisted', async () => {
    const {db} = database(1); const send = vi.fn();
    await expect(trackLoginEmail(db,'admin','qa@example.test',send)).rejects.toThrow('storage'); expect(send).not.toHaveBeenCalled();
  });
  it('preserves successful delivery if final persistence fails', async () => {
    const {db} = database(2); const send = vi.fn().mockResolvedValue('provider-1');
    expect(await trackLoginEmail(db,'admin','qa@example.test',send)).toBe('provider-1'); expect(send).toHaveBeenCalledTimes(1);
  });
  it.each(['gmail_token_http_400','gmail_send_http_403','gmail_not_configured'])('retains only allowlisted transport classification %s', async (failure) => {
    const {db,writes} = database();
    await expect(trackLoginEmail(db,'admin','qa@example.test',async () => {throw new Error(failure);})).rejects.toThrow();
    expect(JSON.parse(writes[1][0] as string)).toMatchObject({status:'unknown',failure});
  });
  it('marks provider errors unknown without persisting sensitive errors', async () => {
    const {db,writes} = database();
    await expect(trackLoginEmail(db,'tenant','qa@example.test',async () => {throw new Error('private provider payload');})).rejects.toThrow();
    expect(JSON.parse(writes[1][0] as string).status).toBe('unknown'); expect(JSON.stringify(writes)).not.toContain('private provider');
  });
});
