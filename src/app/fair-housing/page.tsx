import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'edge';
export const metadata: Metadata = { title: 'Fair Housing | Teams Management' };

export default function FairHousingPage() {
  return <LegalPage title="Fair Housing / Equal Housing Opportunity">
    <section><h2>Equal housing opportunity</h2><p>Teams Management is committed to equal housing opportunity and to complying with applicable federal, New York State, and New York City fair-housing requirements. We do not discriminate in housing because of a protected characteristic or a lawful source of income, including eligible housing assistance or vouchers.</p></section>
    <section><h2>Questions or accommodation requests</h2><p>If you have a question about fair housing, need a reasonable accommodation, or believe you experienced a barrier in our housing process, contact <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a>. We will review your concern and respond through the appropriate process.</p></section>
  </LegalPage>;
}
