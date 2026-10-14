import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'Privacy Policy | Teams Management' };

export default function PrivacyPolicy() {
  return <LegalPage title="Privacy Policy">
    <section><h2>What we receive</h2><p>When you contact us or inquire about a property, we receive the details you provide, such as your name, email address, phone number, property of interest, and message. If you use an authorized tenant or administrator account, we also process your account email, sign-in activity, assigned property or unit, and information you submit through that account. Tenant maintenance requests may include descriptions of an issue and a preferred contact method.</p></section>
    <section><h2>How we use it</h2><p>We use information to answer inquiries, manage property and tenant services, route maintenance requests, administer accounts, and operate and protect the website. We may also use it to meet applicable recordkeeping or legal obligations.</p></section>
    <section><h2>Website and account information</h2><p>Cloudflare hosts this website and its application database. Its infrastructure may process technical information such as IP address, browser details, and request logs for delivery, troubleshooting, and security. The site uses functional cookies for signed-in sessions and to manage the display of featured properties during a visit. Sign-in codes and session records support authorized access.</p></section>
    <section><h2>Email and service providers</h2><p>Messages sent to our published email address may be handled through Google Workspace. When configured, site-generated messages may be delivered through Gmail. Service providers that support hosting, email, and website operations may process information on our behalf for those purposes. We may also disclose information when required by law.</p></section>
    <section><h2>Security and retention</h2><p>We limit account areas to authorized users and use access controls and session protections. No online service can guarantee absolute security. We keep information for as long as reasonably needed for the purposes above, subject to applicable legal, operational, and recordkeeping needs. Retention can vary by type of record; this site does not promise automatic deletion on a fixed schedule.</p></section>
    <section><h2>External sites</h2><p>Restaurant, map, transit, public-data, and other external links take you to services operated by third parties. Their content and privacy practices are governed by those services, not this policy.</p></section>
    <section><h2>Questions and updates</h2><p>To ask about information you submitted or request a correction, contact <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a>. We may update this policy as our site and services change. The date above identifies this version.</p></section>
  </LegalPage>;
}
