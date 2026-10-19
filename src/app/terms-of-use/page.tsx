import { renderWebsiteContent } from '@/components/website-content-page';
import { WebsiteText } from '@/components/website-text';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'Terms of Use | Teams Management' };

function TermsOfUse() {
  return <LegalPage title={<WebsiteText contentKey="terms-of-use.page-title">Terms of Use</WebsiteText>}>
    <section><h2><WebsiteText contentKey="terms-of-use.text-1">About this website</WebsiteText></h2><p><WebsiteText contentKey="terms-of-use.text-2">This site provides general information about Teams Management, its properties, and its services. It is not a lease, an offer to rent, a brokerage agreement, legal advice, or a guarantee that any space is available. A property shown here may have no residential unit or retail space currently available. Any transaction is governed by its own signed documents.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="terms-of-use.text-3">Confirm property details</WebsiteText></h2><p><WebsiteText contentKey="terms-of-use.text-4">Descriptions, dimensions, amenities, photographs, maps, neighborhood information, and other details may change or contain errors. Please confirm information important to your decision directly with Teams Management and, where appropriate, through an independent inspection.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="terms-of-use.text-5">Third-party information and links</WebsiteText></h2><p><WebsiteText contentKey="terms-of-use.text-6">Maps, transit references, nearby businesses, restaurant information, and public datasets may come from others and can change. External websites are operated by third parties; Teams Management does not control their content, privacy practices, or availability.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="terms-of-use.text-7">Use the site responsibly</WebsiteText></h2><p><WebsiteText contentKey="terms-of-use.text-8">Do not attempt unauthorized access, interfere with the site, introduce malware, impersonate another person, misuse sign-in systems, or use the site to harm others. Access to tenant and administrator areas is limited to authorized users.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="terms-of-use.text-9">Content and availability</WebsiteText></h2><p><WebsiteText contentKey="terms-of-use.text-10">Teams Management and its licensors retain their respective rights in the branding, original copy, design, photography, and other media used here. Third-party maps, public datasets, restaurant materials, and licensed assets remain subject to their owners’ rights. The site may be changed, corrected, interrupted, or updated.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="terms-of-use.text-11">Questions</WebsiteText></h2><p><WebsiteText contentKey="terms-of-use.text-12">For questions about this site, contact </WebsiteText><a href={`mailto:${siteContact.email}`}>{siteContact.email}</a>.</p></section>
  </LegalPage>;
}

// Keep published copy in the page payload, not the persistent App Router layout.
export default async function WebsitePage() { return renderWebsiteContent(await TermsOfUse()); }
