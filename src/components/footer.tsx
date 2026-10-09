import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white mt-16 border-t border-teams-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <img src="/brand/teams-management-logo.png" alt="Teams Management" width="192" height="192" className="mb-4 h-40 w-40 sm:h-48 sm:w-48 object-contain" />
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              Teams Management property portfolio in New York City. Property-specific information is published after review.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-slate-300">
              <span>&copy; {new Date().getFullYear()} Teams Management</span>
              <span aria-hidden="true">•</span>
              <span>All rights reserved</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Explore</h4>
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
              <li><Link href="/about" className="text-slate-300 hover:text-white text-sm">About Us</Link></li>
              <li><Link href="/rent-with-us" className="text-slate-300 hover:text-white text-sm">Rent with Us</Link></li>
              <li><Link href="/gallery" className="text-slate-300 hover:text-white text-sm">Gallery</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-white text-sm">Contact</Link></li>
              <li><Link href="/tenant-services" className="text-slate-300 hover:text-white text-sm">Tenant Services</Link></li>
            </ul>
          </div>

          <div><h4 className="text-sm font-semibold text-slate-200 mb-3">Get in touch</h4><p className="text-sm text-slate-300 mb-4">Contact details and the online inquiry pathway are being verified.</p><Link href="/contact" className="text-sm text-white underline decoration-teams-gold underline-offset-4">Contact information</Link></div>

        </div>

        <div className="mt-12 pt-8 border-t border-teams-gold/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-300 text-center md:text-left">
            Property information is published after review.
          </p>
        </div>
      </div>
    </footer>
  );
}
