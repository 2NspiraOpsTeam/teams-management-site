// Canonical review surface. Never derive emailed sign-in destinations from request headers.
// Set an approved canonical origin explicitly before a public production rollout.
export const previewPortalOrigin = process.env.NEXT_PUBLIC_TEAMS_PORTAL_ORIGIN || 'https://teams-management-preview.pages.dev';
export function portalUrl(role: 'admin' | 'tenant', destination: 'login' | 'maintenance' | 'inquiries' = 'login') {
  const path = destination === 'login'
    ? (role === 'admin' ? '/access' : '/tenant/login')
    : role === 'admin' ? `/admin/${destination === 'inquiries' ? 'inquiries' : 'maintenance'}` : '/tenant/maintenance';
  return new URL(path, previewPortalOrigin).href;
}
