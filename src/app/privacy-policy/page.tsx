import { renderWebsiteContent } from '@/components/website-content-page';
import { WebsiteText } from '@/components/website-text';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'Privacy Policy | Teams Management' };

function PrivacyPolicy() {
  return <LegalPage title={<WebsiteText contentKey="privacy-policy.page-title">Privacy Policy</WebsiteText>}>
    <section><h2><WebsiteText contentKey="privacy-policy.text-1">What we receive</WebsiteText></h2><p><WebsiteText contentKey="privacy-policy.text-2">When you contact us or inquire about a property, we receive the details you provide, such as your name, email address, phone number, property of interest, and message. If you use an authorized tenant or administrator account, we also process your account email, sign-in activity, assigned property or unit, and information you submit through that account. Tenant maintenance requests may include descriptions of an issue and a preferred contact method.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="privacy-policy.text-3">How we use it</WebsiteText></h2><p><WebsiteText contentKey="privacy-policy.text-4">We use information to answer inquiries, manage property and tenant services, route maintenance requests, administer accounts, and operate and protect the website. We may also use it to meet applicable recordkeeping or legal obligations.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="privacy-policy.text-5">Website and account information</WebsiteText></h2><p><WebsiteText contentKey="privacy-policy.text-6">Cloudflare hosts this website and its application database. Its infrastructure may process technical information such as IP address, browser details, and request logs for delivery, troubleshooting, and security. The site uses functional cookies for signed-in sessions and to manage the display of featured properties during a visit. Sign-in codes and session records support authorized access.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="privacy-policy.text-7">Email and service providers</WebsiteText></h2><p><WebsiteText contentKey="privacy-policy.text-8">Messages sent to our published email address may be handled through Google Workspace. When configured, site-generated messages may be delivered through Gmail. Service providers that support hosting, email, and website operations may process information on our behalf for those purposes. We may also disclose information when required by law.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="privacy-policy.text-9">Security and retention</WebsiteText></h2><p><WebsiteText contentKey="privacy-policy.text-10">We limit account areas to authorized users and use access controls and session protections. No online service can guarantee absolute security. We keep information for as long as reasonably needed for the purposes above, subject to applicable legal, operational, and recordkeeping needs. Retention can vary by type of record; this site does not promise automatic deletion on a fixed schedule.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="privacy-policy.text-11">External sites</WebsiteText></h2><p><WebsiteText contentKey="privacy-policy.text-12">Restaurant, map, transit, public-data, and other external links take you to services operated by third parties. Their content and privacy practices are governed by those services, not this policy.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="privacy-policy.text-13">Questions and updates</WebsiteText></h2><p><WebsiteText contentKey="privacy-policy.text-14">To ask about information you submitted or request a correction, contact </WebsiteText><a href={`mailto:${siteContact.email}`}>{siteContact.email}</a><WebsiteText contentKey="privacy-policy.text-15">. We may update this policy as our site and services change. The date above identifies this version.</WebsiteText></p></section>
  </LegalPage>;
}

// Keep published copy in the page payload, not the persistent App Router layout.
export default async function WebsitePage() { return renderWebsiteContent(await PrivacyPolicy()); }
