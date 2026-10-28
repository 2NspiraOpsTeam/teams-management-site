import { portalUrl } from './portal-links';

/** Shared email-safe layout; authentication policy stays in the role senders. */
export function signInEmail(role: 'admin' | 'tenant', code: string) {
  if (!/^\d{8}$/.test(code)) throw new Error('invalid_sign_in_code');
  const admin = role === 'admin';
  const label = admin ? 'Admin portal' : 'Tenant portal';
  const url = portalUrl(role);
  const logo = new URL('/brand/teams-management-logo.png', url).href;
  // Lead with the uninterrupted code so truncated mobile notifications retain it.
  const subject = `${code} — Sign-in code`;
  const preview = 'Expires in 10 minutes. Never share this code.';
  // Keep body headings and the visible code out of mail-client notification snippets.
  const previewPadding = '&#8204;&nbsp;'.repeat(160);
  const intro = admin ? 'Secure access to your management workspace.' : 'Your home, thoughtfully connected.';
  const text = `${preview}\n\nTEAMS MANAGEMENT\n${label}\n\n${intro}\n\nSign-in code: ${code}\n\nThis code can only be used once. Enter it on the sign-in page to continue.\n\n${label}: ${url}\n\nIf you did not request this code, you can safely ignore this email. No action is needed.`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head><body style="margin:0;background:#f5f2eb;color:#292824;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${preview}${previewPadding}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffdf8;border:1px solid #e5dfd3;border-top:4px solid #a08242;border-radius:8px"><tr><td align="center" style="padding:32px 24px 24px"><img src="${logo}" alt="TM" width="88" style="display:block;width:88px;height:auto;margin:0 auto 16px"><div style="font-size:13px;letter-spacing:3px;font-weight:bold">TEAMS MANAGEMENT</div><div style="font-size:12px;color:#706a5e;margin-top:10px">${label}</div></td></tr><tr><td style="padding:8px 24px 32px;text-align:center"><h1 style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:normal;margin:0 0 16px">Welcome ${admin ? 'back' : 'home'}.</h1><p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#59554d">${intro}<br>Enter your one-time code to continue.</p><div style="background:#f3efe5;border:1px solid #dfd4ba;border-radius:6px;padding:20px 8px;font-family:Consolas,'Courier New',monospace;font-size:30px;letter-spacing:4px;font-weight:bold;color:#292824">${code}</div><p style="font-size:13px;line-height:1.6;color:#706a5e;margin:16px 0 24px">Expires in 10 minutes · Single use only<br>Never share your sign-in code.</p><a href="${url}" style="display:inline-block;background:#292824;border-radius:4px;padding:15px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold">Open ${label}</a></td></tr><tr><td style="border-top:1px solid #e5dfd3;padding:24px;font-size:12px;line-height:1.7;color:#706a5e;text-align:center">Didn't request this code? You can safely ignore this email.<br>No action is needed.<br><br>Teams Management</td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}
