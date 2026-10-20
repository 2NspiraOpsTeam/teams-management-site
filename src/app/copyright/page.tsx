import { renderWebsiteContent } from '@/components/website-content-page';
import { WebsiteText } from '@/components/website-text';
import { pageMetadata } from '@/lib/site-seo';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata = pageMetadata('/copyright', 'Copyright | Teams Management', 'Find information about Teams Management website content, photography rights, permitted use, and copyright questions.');

function CopyrightPage() {
  return <LegalPage title={<WebsiteText contentKey="copyright.page-title">Copyright</WebsiteText>}><section><h2><WebsiteText contentKey="copyright.text-1">Website content</WebsiteText></h2><p><WebsiteText contentKey="copyright.text-2">Copyright © </WebsiteText>{new Date().getFullYear()}<WebsiteText contentKey="copyright.text-3"> Teams Management. Unless otherwise indicated, original text, design, and other content created for this website are reserved by Teams Management. Property photographs and third-party materials may belong to their respective owners and are used with permission or under an applicable license.</WebsiteText></p></section><section><h2><WebsiteText contentKey="copyright.text-4">Permitted use</WebsiteText></h2><p><WebsiteText contentKey="copyright.text-5">You may view this website for personal, noncommercial purposes. Please request permission before reproducing, distributing, or adapting its content, except where permitted by law. Nothing on this page transfers rights in third-party content.</WebsiteText></p></section><section><h2><WebsiteText contentKey="copyright.text-6">Copyright concerns</WebsiteText></h2><p><WebsiteText contentKey="copyright.text-7">If you believe content on this website infringes your rights, email </WebsiteText><a href={`mailto:${siteContact.email}`}>{siteContact.email}</a><WebsiteText contentKey="copyright.text-8"> with the page URL, identification of the work, your contact information, and an explanation of your concern so we can review it.</WebsiteText></p></section></LegalPage>;
}

// Keep published copy in the page payload, not the persistent App Router layout.
export default async function WebsitePage() { return renderWebsiteContent(await CopyrightPage()); }
