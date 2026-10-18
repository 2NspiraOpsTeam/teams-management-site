import {afterEach,expect,it,vi} from 'vitest';
afterEach(()=>{vi.unstubAllEnvs();vi.resetModules();});
it('uses the explicitly configured development origin for both portal roles',async()=>{
 vi.stubEnv('NEXT_PUBLIC_TEAMS_PORTAL_ORIGIN','https://teams-management-development.pages.dev');
 vi.resetModules();
 const {portalUrl}=await import('../src/lib/portal-links');
 expect(portalUrl('admin')).toBe('https://teams-management-development.pages.dev/access');
 expect(portalUrl('tenant')).toBe('https://teams-management-development.pages.dev/tenant/login');
 expect(portalUrl('admin','inquiries')).toBe('https://teams-management-development.pages.dev/admin/inquiries');
});
