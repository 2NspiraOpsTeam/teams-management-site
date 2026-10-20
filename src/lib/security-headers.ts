// Shared by page middleware and the lightweight prepared-photo delivery path.
export const browserSecurityHeaders={
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Frame-Options':'SAMEORIGIN',
 'Content-Security-Policy':"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'",
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
};
