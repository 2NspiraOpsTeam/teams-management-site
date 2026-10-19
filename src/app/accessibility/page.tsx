import { renderWebsiteContent } from '@/components/website-content-page';
import { WebsiteText } from '@/components/website-text';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact, contactPhoneHref } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'Accessibility | Teams Management' };

function AccessibilityPage() {
  return <LegalPage title={<WebsiteText contentKey="accessibility.page-title">Accessibility</WebsiteText>}>
    <section><h2><WebsiteText contentKey="accessibility.text-1">Our approach</WebsiteText></h2><p><WebsiteText contentKey="accessibility.text-2">Teams Management is working to provide an accessible digital experience. We aim to make the site usable with a keyboard, readable at different screen sizes, and understandable with assistive technology. We continue to review and improve content and functionality.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="accessibility.text-3">Tell us about a barrier</WebsiteText></h2><p><WebsiteText contentKey="accessibility.text-4">If you have difficulty using any part of this site or need information in another format, email </WebsiteText><a href={`mailto:${siteContact.email}`}>{siteContact.email}</a><WebsiteText contentKey="accessibility.text-5"> or call </WebsiteText><a href={contactPhoneHref}>{siteContact.phone}</a><WebsiteText contentKey="accessibility.text-6">. Please tell us the page or feature involved and a way to reach you. We will work with you to provide the information or service.</WebsiteText></p></section>
  </LegalPage>;
}

// Keep published copy in the page payload, not the persistent App Router layout.
export default async function WebsitePage() { return renderWebsiteContent(await AccessibilityPage()); }
