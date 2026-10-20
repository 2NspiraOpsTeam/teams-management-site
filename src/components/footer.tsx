import {PublishedPhoto} from '@/components/published-photo';
import { WebsiteText } from '@/components/website-text';
import Link from 'next/link';
import { ContactDetails } from '@/components/contact-details';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#B49355]/40 bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <PublishedPhoto src="/brand/teams-management-logo.png" alt="Teams Management" width="192" height="192" className="mb-4 h-40 w-40 sm:h-48 sm:w-48 object-contain" />
            <p className="text-slate-300 text-sm leading-relaxed max-w-md"><WebsiteText contentKey="footer.text-1">
              Teams Management property portfolio in New York City.
            </WebsiteText></p>
            <Link prefetch={false} href="/contact" className="mt-5 inline-flex min-h-11 items-center border-b border-[#B49355] text-sm font-semibold text-white transition-colors hover:text-[#D8BD86] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8BD86]"><WebsiteText contentKey="footer.text-2">Connect with our team ↗</WebsiteText></Link>
            <p className="mt-4 text-sm text-slate-300"><WebsiteText contentKey="footer.text-3">&copy; 2026 Teams Management. All rights reserved.</WebsiteText></p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[.16em] text-[#D8BD86] mb-4"><WebsiteText contentKey="footer.text-4">Explore</WebsiteText></h4>
            <ul className="space-y-2">
              <li>
                <Link prefetch={false} href="/" className="text-slate-300 hover:text-white text-sm transition-colors"><WebsiteText contentKey="footer.text-5">
                  Home
                </WebsiteText></Link>
              </li>
              <li>
                <Link prefetch={false} href="/properties" className="text-slate-300 hover:text-white text-sm transition-colors"><WebsiteText contentKey="footer.text-6">
                  Residences
                </WebsiteText></Link>
              </li>
              <li><Link prefetch={false} href="/retail" className="text-slate-300 hover:text-white text-sm transition-colors"><WebsiteText contentKey="footer.text-7">Retail</WebsiteText></Link></li>
              <li><Link prefetch={false} href="/dining" className="text-slate-300 hover:text-white text-sm"><WebsiteText contentKey="footer.text-8">Dining</WebsiteText></Link></li>
              <li><Link prefetch={false} href="/rent-with-us" className="text-slate-300 hover:text-white text-sm"><WebsiteText contentKey="footer.text-9">Rent with Us</WebsiteText></Link></li>
              <li><Link prefetch={false} href="/about" className="text-slate-300 hover:text-white text-sm"><WebsiteText contentKey="footer.text-10">About</WebsiteText></Link></li>
              <li><Link prefetch={false} href="/tenant-services" className="text-slate-300 hover:text-white text-sm"><WebsiteText contentKey="footer.text-11">Tenant Services</WebsiteText></Link></li>
            </ul>
          </div>

          <div><h4 className="text-sm font-semibold uppercase tracking-[.16em] text-[#D8BD86] mb-4"><WebsiteText contentKey="footer.text-12">Get in touch</WebsiteText></h4><ContactDetails dark /></div>

        </div>

        <div className="mt-12 border-t border-white/20 pt-8 text-sm">
          <nav aria-label="Legal and accessibility" className="flex flex-wrap gap-x-6 gap-y-1 text-slate-200">
            <Link prefetch={false} href="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline"><WebsiteText contentKey="footer.text-13">Privacy Policy</WebsiteText></Link>
            <Link prefetch={false} href="/terms-of-use" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline"><WebsiteText contentKey="footer.text-14">Terms of Use</WebsiteText></Link>
            <Link prefetch={false} href="/accessibility" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline"><WebsiteText contentKey="footer.text-15">Accessibility</WebsiteText></Link>
            <Link prefetch={false} href="/fair-housing" className="inline-flex min-h-11 items-center gap-2 hover:text-white focus-visible:underline"><span aria-hidden="true" className="text-base text-[#D8BD86]">⌂</span><WebsiteText contentKey="footer.text-16">Fair Housing &amp; Equal Housing Opportunity</WebsiteText></Link>
            <Link prefetch={false} href="/copyright" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline"><WebsiteText contentKey="footer.text-17">Copyright</WebsiteText></Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
