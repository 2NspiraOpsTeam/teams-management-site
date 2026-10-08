import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-serif font-semibold mb-4">Teams Management</h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              The Property Steward | Premium property management and portfolio services in New York City. 
              Establishing calm, reliable, and organized excellence for our properties and residents.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-sm text-slate-400">
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
                <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M3 16h18M3 16l7.89-5.26a2 2 0 002.22 0L21 16" />
                </svg>
                <span>info@teams-management.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.11l-4.493 1.498a1 1 0 01-.684-.948V10m10 0a2 2 0 012 2v3.28a1 1 0 01-.684.948l-4.493 1.498a1 1 0 01-1.11-.502l-1.498-4.493a1 1 0 01.684-.948H21z" />
                </svg>
                <span>(212) 555-0123</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal & Accessibility */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-500 text-center md:text-left">
            Designed with accessibility in mind | WCAG 2.1 AA compliant
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/accessibility" className="hover:text-slate-300 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
