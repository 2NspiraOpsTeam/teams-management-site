import { renderWebsiteContent } from '@/components/website-content-page';
import { WebsiteText } from '@/components/website-text';
import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'Fair Housing | Teams Management' };

function FairHousingPage() {
  return <LegalPage title={<WebsiteText contentKey="fair-housing.page-title">Fair Housing / Equal Housing Opportunity</WebsiteText>}>
    <section><h2><WebsiteText contentKey="fair-housing.text-1">Equal housing opportunity</WebsiteText></h2><p><WebsiteText contentKey="fair-housing.text-2">Teams Management is committed to equal housing opportunity and to complying with applicable federal, New York State, and New York City fair-housing requirements. We do not discriminate in housing because of a protected characteristic or a lawful source of income, including eligible housing assistance or vouchers.</WebsiteText></p></section>
    <section><h2><WebsiteText contentKey="fair-housing.text-3">Questions or accommodation requests</WebsiteText></h2><p><WebsiteText contentKey="fair-housing.text-4">If you have a question about fair housing, need a reasonable accommodation, or believe you experienced a barrier in our housing process, contact </WebsiteText><a href={`mailto:${siteContact.email}`}>{siteContact.email}</a><WebsiteText contentKey="fair-housing.text-5">. We will review your concern and respond through the appropriate process.</WebsiteText></p></section>
  </LegalPage>;
}

// Keep published copy in the page payload, not the persistent App Router layout.
export default async function WebsitePage() { return renderWebsiteContent(await FairHousingPage()); }
