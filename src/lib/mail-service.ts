export type MailEnv = { GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; GOOGLE_REFRESH_TOKEN?: string; ADMIN_AUTH_FROM?: string; ADMIN_AUTH_REPLY_TO?: string; INQUIRY_NOTIFICATION_EMAIL?: string; INQUIRY_FROM_EMAIL?: string; MAIL_PROVIDER?: string };

import { gmailConfigured, sendGmail } from './gmail-provider';

export interface TeamsMailService {
  sendAdminOtp(to: string, code: string): Promise<string>;
  sendInquiryNotification(to: string, inquiryId: string): Promise<string>;
  sendApplicationConfirmation(to: string, text: string): Promise<string>;
}

export class MailService implements TeamsMailService {
  constructor(private readonly env: MailEnv) {}
  configured() { return gmailConfigured(this.env); }
  async sendAdminOtp(to: string, code: string) {
    const from = this.env.ADMIN_AUTH_FROM;
    if (!from) throw new Error('admin_sender_not_configured');
    return sendGmail(this.env, from, to, 'Your Teams Management Admin sign-in code', `Your Teams Management Admin sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.`, this.env.ADMIN_AUTH_REPLY_TO);
  }
  async sendApplicationConfirmation(_to: string, _text: string): Promise<string> {
    throw new Error('application_confirmation_not_enabled');
  }
  async sendInquiryNotification(to: string, inquiryId: string) {
    const from = this.env.INQUIRY_FROM_EMAIL;
    if (!from) throw new Error('inquiry_sender_not_configured');
    return sendGmail(this.env, from, to, 'New Teams Management inquiry', `A new inquiry (${inquiryId}) is stored in the Teams Management admin inbox. Sign in to review it. No private inquiry content is included in this email.`);
  }
}
