'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/properties', label: 'Portfolio' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
            <span className="text-xl font-serif font-semibold text-slate-800">
              Teams Management
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Tenant Services Gateway */}
          <div className="hidden md:flex items-center">
            <Link
              href="/tenant-services"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              Tenant Services
              <svg 
                className="ml-2 w-4 h-4 text-slate-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            type="button"
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(open => !open)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {menuOpen && <div id="mobile-navigation" className="md:hidden border-t border-slate-100 py-3 flex flex-col gap-1">
          {navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href ? 'page' : undefined} className="rounded px-3 py-3 text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900">{item.label}</Link>)}
          <Link href="/tenant-services" onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 text-slate-700 hover:bg-slate-50">Tenant Services</Link>
        </div>}
      </nav>
    </header>
  );
}
