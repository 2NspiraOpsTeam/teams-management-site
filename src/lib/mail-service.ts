import { portalUrl } from './portal-links';
export type MailEnv = { GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; GOOGLE_REFRESH_TOKEN?: string; ADMIN_AUTH_FROM?: string; TENANT_AUTH_FROM?: string; ADMIN_AUTH_REPLY_TO?: string; INQUIRY_FROM?: string; INQUIRY_NOTIFY_TO?: string; INQUIRY_QA_TO?: string; INQUIRY_QA_ID?: string; MAIL_PROVIDER?: string };

import { gmailConfigured, sendGmail } from './gmail-provider';

export interface TeamsMailService {
  sendAdminOtp(to: string, code: string): Promise<string>;
  sendInquiryNotification(to: string, inquiryId: string, qa?: boolean): Promise<string>;
  sendApplicationConfirmation(to: string, text: string): Promise<string>;
}

export class MailService implements TeamsMailService {
  constructor(private readonly env: MailEnv) {}
  configured() { return gmailConfigured(this.env); }
  async sendTenantOtp(to: string, code: string) {
    const from = this.env.TENANT_AUTH_FROM;
    if (!from) throw new Error('tenant_sender_not_configured');
    return sendGmail(this.env, from, to, 'Your Teams Management tenant sign-in code', `Your Teams Management sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.\n\nTenant portal: ${portalUrl('tenant')}`);
  }
  async sendTenantInvitation(to: string, loginUrl: string) {
    const from = this.env.TENANT_AUTH_FROM;
    if (!from) throw new Error('tenant_sender_not_configured');
    return sendGmail(this.env, from, to, 'Your Teams Management tenant access', `Your tenant access is ready. Visit ${loginUrl} and enter this email address to request a one-time sign-in code. If you were not expecting this invitation, contact Teams Management.`);
  }
  async sendAdminOtp(to: string, code: string) {
    const from = this.env.ADMIN_AUTH_FROM;
    if (!from) throw new Error('admin_sender_not_configured');
    return sendGmail(this.env, from, to, 'Your Teams Management Admin sign-in code', `Your Teams Management Admin sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.\n\nAdmin portal: ${portalUrl('admin')}`, this.env.ADMIN_AUTH_REPLY_TO);
  }
  async sendApplicationConfirmation(_to: string, _text: string): Promise<string> {
    throw new Error('application_confirmation_not_enabled');
  }
  async sendInquiryNotification(to: string, inquiryId: string, qa = false) {
    const from = this.env.INQUIRY_FROM;
    if (!from) throw new Error('inquiry_sender_not_configured');
    return sendGmail(this.env, from, to, qa ? '[QA] Teams Management Website Inquiry Test' : 'New Teams Management inquiry', `${qa ? 'Approved preview QA test. No action is required. ' : ''}A new inquiry (${inquiryId}) is stored in the Teams Management admin inbox. Sign in to review it. No private inquiry content is included in this email.\n\nAdmin portal: ${portalUrl('admin', 'inquiries')}`);
  }
}
