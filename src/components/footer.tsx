import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white mt-16 border-t border-teams-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4"><img src="/brand/teams-management-logo.png" alt="" width="72" height="72" className="h-[72px] w-[72px] object-contain" /><h3 className="text-lg font-serif font-semibold">Teams Management</h3></div>
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
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M3 16h18M3 16l7.89-5.26a2 2 0 002.22 0L21 16" />
                </svg>
                <a href="mailto:info@teams-management.com" className="hover:text-white">info@teams-management.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-teams-gold/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-300 text-center md:text-left">
            Accessibility feedback is welcome via our contact page.
          </p>
        </div>
      </div>
    </footer>
  );
}
