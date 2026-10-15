import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteContact } from '@/lib/site-contact';

export const runtime = 'nodejs';
export const metadata: Metadata = { title: 'Copyright | Teams Management' };

export default function CopyrightPage() {
  return <LegalPage title="Copyright"><section><h2>Website content</h2><p>Copyright © {new Date().getFullYear()} Teams Management. Unless otherwise indicated, original text, design, and other content created for this website are reserved by Teams Management. Property photographs and third-party materials may belong to their respective owners and are used with permission or under an applicable license.</p></section><section><h2>Permitted use</h2><p>You may view this website for personal, noncommercial purposes. Please request permission before reproducing, distributing, or adapting its content, except where permitted by law. Nothing on this page transfers rights in third-party content.</p></section><section><h2>Copyright concerns</h2><p>If you believe content on this website infringes your rights, email <a href={`mailto:${siteContact.email}`}>{siteContact.email}</a> with the page URL, identification of the work, your contact information, and an explanation of your concern so we can review it.</p></section></LegalPage>;
}
