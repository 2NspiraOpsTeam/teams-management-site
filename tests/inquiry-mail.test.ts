import { afterEach, expect, it, vi } from 'vitest';
import { MailService } from '../src/lib/mail-service';
afterEach(() => vi.unstubAllGlobals());
it('uses centralized routing sender and QA subject in the actual Gmail MIME, without private inquiry data', async () => {
  const calls: {url: string; body: string}[] = [];
  vi.stubGlobal('fetch', async (url: string, options: RequestInit) => {
    calls.push({url, body: String(options.body)});
    return Response.json(url.includes('oauth2') ? {access_token: 'test-access-token'} : {id: 'provider-qa-id'});
  });
  const mail = new MailService({GOOGLE_CLIENT_ID:'test',GOOGLE_CLIENT_SECRET:'test',GOOGLE_REFRESH_TOKEN:'test',INQUIRY_FROM:'sender@example.test'});
  expect(await mail.sendInquiryNotification('destination@example.test, qa@example.test', 'approved-receipt', true)).toBe('provider-qa-id');
  const mime = Buffer.from(JSON.parse(calls[1].body).raw, 'base64url').toString();
  expect(mime).toContain('From: sender@example.test\r\nTo: destination@example.test, qa@example.test');
  const subject = Buffer.from(mime.match(/Subject: =\?UTF-8\?B\?([^?]+)/)![1], 'base64').toString();
  expect(subject).toBe('[QA] Teams Management Website Inquiry Test');
  const body = Buffer.from(mime.split('\r\n\r\n')[1], 'base64').toString();
  expect(body).toContain('Approved preview QA test. No action is required.');
  expect(body).toContain('approved-receipt');
  expect(calls.map(call => call.url)).toEqual(['https://oauth2.googleapis.com/token','https://gmail.googleapis.com/gmail/v1/users/me/messages/send']);
});
it('includes the correct canonical portal in each role’s actual OTP email, without putting the code in the URL', async () => {
  const messages: string[] = [];
  vi.stubGlobal('fetch', async (url: string, options: RequestInit) => {
    if (url.includes('oauth2')) return Response.json({ access_token: 'synthetic-token' });
    const mime = Buffer.from(JSON.parse(String(options.body)).raw, 'base64url').toString();
    const boundary = mime.match(/boundary="([^"]+)/)![1];
    const parts = mime.split(`--${boundary}`).slice(1, -1);
    expect(parts).toHaveLength(2);
    const decoded = parts.map(part => Buffer.from(part.split('\r\n\r\n')[1].trim(), 'base64').toString());
    const code = messages.length === 0 ? '00000000' : '00000001';
    const subject = Buffer.from(mime.match(/Subject: =\?UTF-8\?B\?([^?]+)/)![1], 'base64').toString();
    expect(subject).toBe(`${code} — Sign-in code`);
    expect(decoded[0].startsWith('Expires in 10 minutes. Never share this code.')).toBe(true);
    expect(decoded[1]).toContain('overflow:hidden">Expires in 10 minutes. Never share this code.');
    expect(mime).toContain('From: Teams Management <sender@example.test>');
    const preheader = decoded[1].match(/overflow:hidden">(.*?)<\/div>/)![1];
    expect(preheader).not.toContain(code);
    expect(preheader).toContain('&#8204;&nbsp;'.repeat(160));
    expect(decoded[0].split(code)).toHaveLength(2);
    expect(parts[0]).toContain('text/plain');
    expect(parts[1]).toContain('text/html');
    expect(decoded[1]).toContain('/brand/teams-management-gold-emblem.png');
    expect(decoded[1]).toContain(messages.length === 0 ? 'Welcome back.' : 'Welcome home.');
    expect(decoded[1]).toContain(messages.length === 0 ? '00000000' : '00000001');
    for (const part of parts) for (const line of part.split('\r\n\r\n')[1].trim().split('\r\n')) expect(line.length).toBeLessThanOrEqual(76);
    expect(decoded[1]).toContain('Expires in 10 minutes');
    expect(decoded[1]).toContain('Single use only');
    expect(decoded[1]).not.toMatch(/href="[^"]*0000000/);
    if (messages.length === 0) expect(mime).toContain('Reply-To: reply@example.test');
    messages.push(decoded[0]);
    return Response.json({ id: 'synthetic-provider' });
  });
  const mail = new MailService({ GOOGLE_CLIENT_ID: 'test', GOOGLE_CLIENT_SECRET: 'test', GOOGLE_REFRESH_TOKEN: 'test', ADMIN_AUTH_REPLY_TO: 'reply@example.test', ADMIN_AUTH_FROM: 'sender@example.test', TENANT_AUTH_FROM: 'sender@example.test' });
  await mail.sendAdminOtp('admin@example.test', '00000000');
  await mail.sendTenantOtp('tenant@example.test', '00000001');
  expect(messages[0]).toContain('Admin portal: https://teams-management-preview.pages.dev/access');
  expect(messages[1]).toContain('Tenant portal: https://teams-management-preview.pages.dev/tenant/login');
  expect(messages[0]).not.toMatch(/https:\/\/\S*00000000/);
  expect(messages[1]).not.toMatch(/https:\/\/\S*00000001/);
});

it('rejects invalid sign-in codes before contacting the provider', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  const mail = new MailService({TENANT_AUTH_FROM:'sender@example.test', ADMIN_AUTH_FROM:'sender@example.test'});
  await expect(mail.sendTenantOtp('tenant@example.test', '<script>')).rejects.toThrow('invalid_sign_in_code');
  await expect(mail.sendAdminOtp('admin@example.test', '1234567')).rejects.toThrow('invalid_sign_in_code');
  expect(fetch).not.toHaveBeenCalled();
});
