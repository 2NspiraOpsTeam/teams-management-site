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
            <div className="mt-4 flex items-center space-x-2 text-sm text-slate-300">
              <span>&copy; {new Date().getFullYear()} Teams Management</span>
              <span aria-hidden="true">•</span>
              <span>All rights reserved</span>
            </div>
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
                  Properties
                </Link>
              </li>
              <li><Link href="/retail" className="text-slate-300 hover:text-white text-sm transition-colors">Retail</Link></li>
              <li><Link href="/about" className="text-slate-300 hover:text-white text-sm">About Us</Link></li>
              <li><Link href="/dining" className="text-slate-300 hover:text-white text-sm">Dining</Link></li>
              <li><Link href="/rent-with-us" className="text-slate-300 hover:text-white text-sm">Rent with Us</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-white text-sm">Contact</Link></li>
              <li><Link href="/tenant-services" className="text-slate-300 hover:text-white text-sm">Tenant Services</Link></li>
            </ul>
          </div>

          <div><h4 className="text-sm font-semibold uppercase tracking-[.16em] text-[#D8BD86] mb-4">Get in touch</h4><ContactDetails dark /><Link href="/contact" className="mt-4 inline-block text-sm text-white underline decoration-[#B49355] underline-offset-4 hover:text-[#D8BD86]">Contact page</Link></div>

        </div>

        <div className="mt-12 pt-8 border-t border-white/20 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
          <Link href="/privacy-policy" className="hover:text-white focus-visible:underline">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-white focus-visible:underline">Terms &amp; Conditions</Link>
          <Link href="/copyright" className="hover:text-white focus-visible:underline">Copyright</Link>
        </div>
      </div>
    </footer>
  );
}
