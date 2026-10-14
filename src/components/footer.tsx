import Link from 'next/link';
import { ContactDetails } from '@/components/contact-details';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#B49355]/40 bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <img src="/brand/teams-management-logo.png" alt="Teams Management" width="192" height="192" className="mb-4 h-40 w-40 sm:h-48 sm:w-48 object-contain" />
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Teams Management property portfolio in New York City.
            </p>
            <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center border-b border-[#B49355] text-sm font-semibold text-white transition-colors hover:text-[#D8BD86] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D8BD86]">Connect with our team ↗</Link>
            <p className="mt-4 text-sm text-slate-300">&copy; 2026 Teams Management. All rights reserved.</p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[.16em] text-[#D8BD86] mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-slate-300 hover:text-white text-sm transition-colors">
                  Residences
                </Link>
              </li>
              <li><Link href="/retail" className="text-slate-300 hover:text-white text-sm transition-colors">Retail</Link></li>
              <li><Link href="/dining" className="text-slate-300 hover:text-white text-sm">Dining</Link></li>
              <li><Link href="/rent-with-us" className="text-slate-300 hover:text-white text-sm">Rent with Us</Link></li>
              <li><Link href="/about" className="text-slate-300 hover:text-white text-sm">About</Link></li>
              <li><Link href="/tenant-services" className="text-slate-300 hover:text-white text-sm">Tenant Services</Link></li>
            </ul>
          </div>

          <div><h4 className="text-sm font-semibold uppercase tracking-[.16em] text-[#D8BD86] mb-4">Get in touch</h4><ContactDetails dark /></div>

        </div>

        <div className="mt-12 border-t border-white/20 pt-8 text-sm">
          <nav aria-label="Legal and accessibility" className="flex flex-wrap gap-x-6 gap-y-1 text-slate-200">
            <Link href="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline">Privacy Policy</Link>
            <Link href="/terms-of-use" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline">Terms of Use</Link>
            <Link href="/accessibility" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline">Accessibility</Link>
            <Link href="/fair-housing" className="inline-flex min-h-11 items-center gap-2 hover:text-white focus-visible:underline"><span aria-hidden="true" className="text-base text-[#D8BD86]">⌂</span>Fair Housing &amp; Equal Housing Opportunity</Link>
            <Link href="/copyright" className="inline-flex min-h-11 items-center hover:text-white focus-visible:underline">Copyright</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
