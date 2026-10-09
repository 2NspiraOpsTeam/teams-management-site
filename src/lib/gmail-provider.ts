import type { MailEnv } from './mail-service';

export function gmailConfigured(env: MailEnv) {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN && (!env.MAIL_PROVIDER || env.MAIL_PROVIDER === 'gmail'));
}

function base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function sendGmail(env: MailEnv, from: string, to: string, subject: string, body: string, replyTo?: string) {
  if (!gmailConfigured(env)) throw new Error('gmail_not_configured');
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, refresh_token: env.GOOGLE_REFRESH_TOKEN!, grant_type: 'refresh_token' }),
  });
  if (!tokenResponse.ok) throw new Error(`gmail_token_http_${tokenResponse.status}`);
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) throw new Error('gmail_token_missing');
  const mime = [`From: ${from}`, `To: ${to}`, ...(replyTo ? [`Reply-To: ${replyTo}`] : []), `Subject: =?UTF-8?B?${base64(subject)}?=`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: base64', '', base64(body)].join('\r\n');
  const raw = base64(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST', headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ raw }),
  });
  if (!response.ok) throw new Error(`gmail_send_http_${response.status}`);
  const result = await response.json() as { id?: string };
  if (!result.id) throw new Error('gmail_send_unknown');
  return result.id;
}
