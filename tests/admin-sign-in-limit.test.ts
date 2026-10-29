import { beforeEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ counts: [300, 1], active: vi.fn(), send: vi.fn(), randomInt: vi.fn(), sql: [] as string[] }));
vi.mock('node:crypto', async importOriginal => ({...await importOriginal<typeof import('node:crypto')>(),randomInt:state.randomInt}));
vi.mock('../src/lib/admin-auth', () => ({
 adminDb: () => ({ prepare: (sql: string) => { state.sql.push(sql); return { bind: () => ({ first: async () => sql.includes('RETURNING count') ? { count: state.counts.shift(), retry_after: 120 } : null, run: async () => ({meta:{changes:1}}) }) }; } }),
 adminEnv: () => ({ ADMIN_OTP_PEPPER: 'x'.repeat(32), ADMIN_AUTH_FROM: 'test@example.test' }),
 hash: async (s: string) => s, activeAdmin: state.active, sameOrigin: () => true,
 currentAdmin: vi.fn(), cookieName: 'test', unauthorized: () => new Response(null,{status:401}),
}));
vi.mock('../src/lib/mail-service', () => ({ MailService: class { configured(){return true;} sendAdminOtp = state.send; } }));
import { POST } from '../src/lib/admin-code-session';
const request = () => new Request('https://example.test/api/admin/session', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({action:'request',email:'qa@example.test'}) });
beforeEach(() => { state.counts=[300,1]; state.sql=[]; vi.clearAllMocks(); state.active.mockResolvedValue(true);state.randomInt.mockReturnValue(12345678); });
it.each([[0,'00000000'],[99999999,'99999999']])('delivers an eight-digit code at the uniform random range boundary %s',async(value,code)=>{
 state.randomInt.mockReturnValue(value);
 expect((await POST(request())).status).toBe(200);
 expect(state.randomInt).toHaveBeenCalledWith(100000000);
 expect(state.send).toHaveBeenCalledWith('qa@example.test',code);
});
it('allows the 300th request', async () => {
 expect((await POST(request())).status).toBe(200);
 expect(state.send).toHaveBeenCalledTimes(1);
});
it.each([[301,1],[1,301],[301,301]])('blocks over-limit recipient or network without generating or sending codes (%s,%s)',async (email,network)=>{
 state.counts=[email,network]; const response=await POST(request());
 expect(response.status).toBe(429); expect(response.headers.get('Retry-After')).toBe('120');
 expect(await response.json()).toMatchObject({error:expect.stringContaining('300 per 24 hours'),retryAfterSeconds:120});
 expect(state.send).not.toHaveBeenCalled(); expect(state.active).not.toHaveBeenCalled();
 expect(state.sql.some(sql=>sql.includes('INSERT INTO admin_login_codes'))).toBe(false);
});
