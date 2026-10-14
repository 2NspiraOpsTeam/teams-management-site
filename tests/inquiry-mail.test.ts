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
