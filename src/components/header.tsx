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
    <header className="sticky top-0 z-50 bg-slate-950 border-b border-teams-gold/60 text-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between min-h-20 gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0 rounded-sm" onClick={() => setMenuOpen(false)} aria-label="Teams Management home">
            <img src="/brand/teams-management-logo.png" alt="" width="60" height="60" className="h-14 w-14 object-contain" />
            <span className="hidden sm:block text-lg font-serif font-semibold text-white leading-tight">
              Teams Management
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                className={`text-sm font-medium border-b-2 py-2 transition-colors ${
                  pathname === item.href
                    ? 'text-white border-teams-gold'
                    : 'text-white/80 border-transparent hover:text-white hover:border-teams-gold/70'
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
              className="inline-flex items-center px-4 py-2 rounded-sm text-sm font-medium text-white border border-teams-gold hover:bg-white hover:text-slate-950 transition-colors"
            >
              Tenant Services
              <svg 
                className="ml-2 w-4 h-4" 
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
            className="md:hidden p-2 text-white hover:text-teams-gold-highlight"
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
        {menuOpen && <div id="mobile-navigation" className="md:hidden border-t border-teams-gold/40 py-3 flex flex-col gap-1">
          {navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href ? 'page' : undefined} className="rounded px-3 py-3 text-white hover:bg-white/10 aria-[current=page]:border-l-2 aria-[current=page]:border-teams-gold">{item.label}</Link>)}
          <Link href="/tenant-services" onClick={() => setMenuOpen(false)} className="rounded px-3 py-3 text-white border-t border-teams-gold/30 hover:bg-white/10">Tenant Services</Link>
        </div>}
      </nav>
    </header>
  );
}
