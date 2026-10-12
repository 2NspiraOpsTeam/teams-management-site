import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'edge';
export const metadata: Metadata = { title: 'Terms & Conditions | Teams Management' };

export default function TermsAndConditions() {
  return <LegalPage title="Terms & Conditions"><section><h2>Using this website</h2><p>This website provides general information about Teams Management and its properties and services. Use it lawfully and do not interfere with its operation, attempt unauthorized access, or submit false or misleading information.</p></section><section><h2>Property information</h2><p>Property descriptions, photographs, availability, and other details are informational and may change. They are not an offer, lease, or guarantee. Confirm material details directly with Teams Management before making a decision. Any signed agreement, not this website, governs a tenancy or other transaction.</p></section><section><h2>Accounts and submissions</h2><p>If you have access to a resident or administrative area, keep your access details private and use only information you are authorized to view. You are responsible for information you submit through the site. Please use the contact information below for urgent matters that cannot wait for an online response.</p></section><section><h2>External links</h2><p>Links to third-party websites are provided for convenience. Teams Management does not control their content or privacy practices.</p></section><section><h2>Questions</h2><p>For questions about these terms, contact <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a>.</p></section></LegalPage>;
}
