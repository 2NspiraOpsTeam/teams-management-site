'use client';
import {PublishedPhoto} from '@/components/published-photo';
import { WebsiteText } from '@/components/website-text';
import { PublicPageEffects } from '@/components/public-page-effects';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const navItems = [
    { href: '/properties', label: <WebsiteText contentKey="header.text-1">Residences</WebsiteText> },
    { href: '/retail', label: <WebsiteText contentKey="header.text-2">Retail</WebsiteText> },
    { href: '/dining', label: <WebsiteText contentKey="header.text-3">Dining</WebsiteText> },
    { href: '/rent-with-us', label: <WebsiteText contentKey="header.text-4">Rent with Us</WebsiteText> },
    { href: '/about', label: <WebsiteText contentKey="header.text-5">About</WebsiteText> },
    { href: '/contact', label: <WebsiteText contentKey="header.text-6">Contact</WebsiteText> },
  ];

  return (
    <header className="public-site-header sticky top-0 z-50 border-b border-[#E8E5DF] bg-white text-[#252525]">
      <PublicPageEffects />
      <nav onKeyDown={event => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-[88px] gap-4">
          <Link prefetch={false} href="/" className="flex items-center gap-3 shrink-0 rounded-sm" onClick={() => setMenuOpen(false)} aria-label="Teams Management home">
            <PublishedPhoto src="/brand/teams-management-logo.png" alt="" width="60" height="60" className="h-14 w-14 object-contain" />
            <span className="hidden sm:block text-lg font-serif font-semibold text-[#252525] leading-tight">
              <WebsiteText contentKey="header.text-7">Teams Management</WebsiteText></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-4 2xl:gap-6">
            {navItems.map((item) => (
              <Link prefetch={false}
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href || (item.href === '/properties' && pathname.startsWith('/properties/')) ? 'page' : undefined}
                className={`text-sm font-medium border-b py-2 transition-colors ${
                  pathname === item.href || (item.href === '/properties' && pathname.startsWith('/properties/'))
                    ? 'text-[#252525] border-[#B49355]'
                    : 'text-[#252525] border-transparent hover:text-[#8b681f]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link prefetch={false} href="/tenant/login" aria-current={pathname === '/tenant/login' ? 'page' : undefined} className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[5px] bg-teams-gold px-4 py-3 text-sm font-semibold text-teams-ink transition-colors hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49355]">Sign in</Link>
          </div>

          {/* Mobile menu button */}
          <button ref={menuButton}
            type="button"
            className="xl:hidden flex h-11 w-11 items-center justify-center rounded text-[#252525] hover:text-[#8b681f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49355]"
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
        {menuOpen && <div id="mobile-navigation" className="xl:hidden border-t border-[#E8E5DF] py-3 flex flex-col gap-1">
          {navItems.map(item => <Link prefetch={false} key={item.href} href={item.href} onClick={() => setMenuOpen(false)} aria-current={pathname === item.href || (item.href === '/properties' && pathname.startsWith('/properties/')) ? 'page' : undefined} className="border-l-2 border-transparent px-3 py-3 text-[#252525] hover:text-[#8b681f] aria-[current=page]:border-[#B49355]">{item.label}</Link>)}
          <Link prefetch={false} href="/tenant/login" onClick={() => setMenuOpen(false)} aria-current={pathname === '/tenant/login' ? 'page' : undefined} className="mt-2 inline-flex min-h-11 items-center justify-center self-start rounded-[5px] bg-teams-gold px-5 py-3 font-semibold text-teams-ink hover:bg-teams-gold-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B49355]"><WebsiteText contentKey="header.text-9">Tenant Services</WebsiteText></Link>
        </div>}
      </nav>
    </header>
  );
}
