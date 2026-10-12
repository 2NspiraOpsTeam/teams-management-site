import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'edge';
export const metadata: Metadata = { title: 'Privacy Policy | Teams Management' };

export default function PrivacyPolicy() {
  return <LegalPage title="Privacy Policy"><section><h2>Information we receive</h2><p>When you contact us, apply to rent, or use resident services, we may receive the information you submit, such as your name, contact details, property or unit, and message. Account areas also use information needed to verify access and provide those services. Our hosting provider may process technical information, such as IP address, browser details, and request logs, to deliver and secure the site.</p></section><section><h2>How information is used</h2><p>We use this information to respond to inquiries, administer properties and resident services, operate and secure the website, and meet applicable legal obligations. We may share information with service providers supporting these purposes or when required by law. We do not publish private inquiry or resident-service submissions as property listings.</p></section><section><h2>Account access and security</h2><p>Administrative and resident areas use session cookies to maintain signed-in access. Please do not submit sensitive personal information through a general inquiry unless it is necessary for your request. No online service can guarantee absolute security.</p></section><section><h2>Your choices</h2><p>You may request access to, correction of, or deletion of information you submitted, subject to applicable law and recordkeeping requirements. To make a privacy request, contact us at <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a>.</p></section><section><h2>Changes</h2><p>We may update this policy as the website and its services change. The date above identifies the current version.</p></section></LegalPage>;
}
