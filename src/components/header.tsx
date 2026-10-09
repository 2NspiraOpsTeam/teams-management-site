'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/properties', label: 'Properties' },
    { href: '/rent-with-us', label: 'Rent with Us' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
    { href: '/tenant-services', label: 'Tenant Services' },
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
          <div className="hidden xl:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href || (item.href === '/properties' && pathname.startsWith('/properties/')) ? 'page' : undefined}
                className={`text-sm font-medium border-b-2 py-2 transition-colors ${item.href === '/tenant-services' ? 'ml-1 px-3 border border-teams-gold rounded-sm' : ''} ${
                  pathname === item.href || (item.href === '/properties' && pathname.startsWith('/properties/'))
                    ? 'text-white border-teams-gold'
                    : 'text-white/80 border-transparent hover:text-white hover:border-teams-gold/70'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button 
            type="button"
            className="xl:hidden p-2 text-white hover:text-teams-gold-highlight"
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
        {menuOpen && <div id="mobile-navigation" className="xl:hidden border-t border-teams-gold/40 py-3 flex flex-col gap-1">
          {navItems.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href || (item.href === '/properties' && pathname.startsWith('/properties/')) ? 'page' : undefined} className={`rounded px-3 py-3 text-white hover:bg-white/10 aria-[current=page]:border-l-2 aria-[current=page]:border-teams-gold ${item.href === '/tenant-services' ? 'border-t border-teams-gold/30 mt-1' : ''}`}>{item.label}</Link>)}
        </div>}
      </nav>
    </header>
  );
}
