import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact, contactPhoneHref } from '@/lib/site-contact';

export const runtime = 'edge';
export const metadata: Metadata = { title: 'Accessibility | Teams Management' };

export default function AccessibilityPage() {
  return <LegalPage title="Accessibility">
    <section><h2>Our approach</h2><p>Teams Management is working to provide an accessible digital experience. We aim to make the site usable with a keyboard, readable at different screen sizes, and understandable with assistive technology. We continue to review and improve content and functionality.</p></section>
    <section><h2>Tell us about a barrier</h2><p>If you have difficulty using any part of this site or need information in another format, email <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a> or call <a href={contactPhoneHref}>{siteContact.phone}</a>. Please tell us the page or feature involved and a way to reach you. We will work with you to provide the information or service.</p></section>
  </LegalPage>;
}
