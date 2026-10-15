import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'Terms of Use | Teams Management' };

export default function TermsOfUse() {
  return <LegalPage title="Terms of Use">
    <section><h2>About this website</h2><p>This site provides general information about Teams Management, its properties, and its services. It is not a lease, an offer to rent, a brokerage agreement, legal advice, or a guarantee that any space is available. A property shown here may have no residential unit or retail space currently available. Any transaction is governed by its own signed documents.</p></section>
    <section><h2>Confirm property details</h2><p>Descriptions, dimensions, amenities, photographs, maps, neighborhood information, and other details may change or contain errors. Please confirm information important to your decision directly with Teams Management and, where appropriate, through an independent inspection.</p></section>
    <section><h2>Third-party information and links</h2><p>Maps, transit references, nearby businesses, restaurant information, and public datasets may come from others and can change. External websites are operated by third parties; Teams Management does not control their content, privacy practices, or availability.</p></section>
    <section><h2>Use the site responsibly</h2><p>Do not attempt unauthorized access, interfere with the site, introduce malware, impersonate another person, misuse sign-in systems, or use the site to harm others. Access to tenant and administrator areas is limited to authorized users.</p></section>
    <section><h2>Content and availability</h2><p>Teams Management and its licensors retain their respective rights in the branding, original copy, design, photography, and other media used here. Third-party maps, public datasets, restaurant materials, and licensed assets remain subject to their owners’ rights. The site may be changed, corrected, interrupted, or updated.</p></section>
    <section><h2>Questions</h2><p>For questions about this site, contact <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a>.</p></section>
  </LegalPage>;
}
