import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ activeAdmin: vi.fn(), admin: vi.fn(), tenant: vi.fn() }));
vi.mock('../src/lib/admin-auth', () => ({ activeAdmin: mocks.activeAdmin, sameOrigin: (r: Request) => r.headers.get('origin') === new URL(r.url).origin }));
vi.mock('../src/app/api/admin/session/route', () => ({ POST: mocks.admin }));
vi.mock('../src/app/api/tenant/session/route', () => ({ POST: mocks.tenant }));
import { POST } from '../src/app/api/session/route';
const request = (body: unknown, origin = 'https://example.test') => new Request('https://example.test/api/session', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); mocks.activeAdmin.mockResolvedValue(false); mocks.admin.mockResolvedValue(Response.json({ email: 'private' }, { headers: { 'set-cookie': 'teams_admin_session=synthetic; HttpOnly; Secure; SameSite=Strict; Path=/' } })); mocks.tenant.mockResolvedValue(Response.json({ok:true}, {headers:{'set-cookie':'teams_tenant_session=synthetic; HttpOnly; Secure; SameSite=Strict; Path=/'}})); });
it.each([true,false])('routes only after successful verification, retaining the appropriate cookie: admin=%s', async admin => {
 mocks.activeAdmin.mockResolvedValue(admin);
 const result=await POST(request({action:'verify',email:' Person@Example.test ',code:'12345678',role:admin?'tenant':'admin',redirect:'https://evil.test'}));
 expect(await result.json()).toEqual({ok:true,role:admin?'admin':'tenant',redirect:admin?'/admin':'/tenant'});
 expect(result.headers.get('set-cookie')).toContain(admin?'teams_admin_session=':'teams_tenant_session=');
 expect(result.headers.get('cache-control')).toBe('no-store');
 expect(admin?mocks.tenant:mocks.admin).not.toHaveBeenCalled();
 const forwarded=(admin?mocks.admin:mocks.tenant).mock.calls[0][0];
 expect(await forwarded.json()).toEqual({action:'verify',email:'person@example.test',code:'12345678'});
});
it.each([true,false])('does not disclose roles during a code request: admin=%s',async admin=>{
 mocks.activeAdmin.mockResolvedValue(admin);
 const result=await POST(request({action:'request',email:'person@example.test'}));
 expect(await result.json()).toEqual({message:'If this email is authorized, a sign-in code has been sent.'});
});
it('never falls back to tenant after rejected admin verification',async()=>{
 mocks.activeAdmin.mockResolvedValue(true); mocks.admin.mockResolvedValue(Response.json({error:'Unauthorized'},{status:401}));
 const result=await POST(request({action:'verify',email:'person@example.test',code:'00000000'}));
 expect(result.status).toBe(401); expect(result.headers.get('set-cookie')).toBeNull(); expect(mocks.tenant).not.toHaveBeenCalled();
});
it.each([401,503])('preserves authentication failure status without leaking role: %s',async status=>{
 mocks.tenant.mockResolvedValue(Response.json({error:'Tenant internal error'},{status}));
 const result=await POST(request({action:'verify',email:'person@example.test',code:'00000000'}));
 expect(result.status).toBe(status); expect(JSON.stringify(await result.json())).not.toContain('Tenant');
});
it('rejects cross-origin, malformed and oversized requests before account lookup',async()=>{
 expect((await POST(request({action:'request',email:'person@example.test'},'https://evil.test'))).status).toBe(401);
 expect((await POST(request({action:'request',email:'invalid'}))).status).toBe(400);
 expect((await POST(request({action:'other',email:'person@example.test'}))).status).toBe(400);
 expect((await POST(request({action:'request',email:'x'.repeat(5000)}))).status).toBe(413);
 expect(mocks.activeAdmin).not.toHaveBeenCalled();
});
it('fails closed on unavailable account storage',async()=>{
 mocks.activeAdmin.mockRejectedValue(new Error('private database error'));
 const result=await POST(request({action:'request',email:'person@example.test'}));
 expect(result.status).toBe(503);expect(mocks.admin).not.toHaveBeenCalled();expect(mocks.tenant).not.toHaveBeenCalled();
});
