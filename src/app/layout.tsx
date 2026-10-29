import type { Metadata } from "next";
import {getCloudflareContext} from "@opennextjs/cloudflare";
import {CloudflareBeacon} from "@/components/analytics/CloudflareBeacon";
import "./globals.css";
import { contactAddress, siteContact } from '@/lib/site-contact';
import { siteOrigin } from '@/lib/site-seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "Teams Management | New York Property Management",
  description: "Teams Management cares for residential and retail properties across Manhattan, the Bronx, and Queens. Explore our portfolio, rental guidance, and resident services.",
  openGraph: {
    type: 'website',
    siteName: 'Teams Management',
    title: 'Teams Management | New York Property Management',
    description: 'Residential and retail property management across Manhattan, the Bronx, and Queens. Explore the Teams Management portfolio, rental guidance, and resident services.',
  },
  twitter: {
    card: 'summary',
    title: 'Teams Management | New York Property Management',
    description: 'Residential and retail property management across Manhattan, the Bronx, and Queens. Explore properties and connect with Teams Management.',
  },
  robots: process.env.NEXT_PUBLIC_PREVIEW_PORTFOLIO === '1' ? { index: false, follow: false } : undefined,
  other: {
    'contact:email': siteContact.email,
    'contact:phone_number': siteContact.phone,
    'contact:fax_number': siteContact.fax,
    'contact:street_address': contactAddress,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let analytics: {CF_ANALYTICS_BEACON_TOKEN?: string; CF_ANALYTICS_HOST?: string} = {};
  try { analytics = getCloudflareContext().env as typeof analytics; } catch { /* Local rendering without bindings. */ }
  const beacon = analytics.CF_ANALYTICS_BEACON_TOKEN;
  const analyticsHost = analytics.CF_ANALYTICS_HOST;
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-teams-ink">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${siteOrigin}/#organization`,
          url: siteOrigin,
          logo: `${siteOrigin}/brand/teams-management-gold-emblem.png`,
          name: 'Teams Management',
          email: siteContact.email,
          telephone: siteContact.phone,
          faxNumber: siteContact.fax,
          address: { '@type': 'PostalAddress', streetAddress: siteContact.address.street, addressLocality: siteContact.address.city, addressRegion: siteContact.address.state, postalCode: siteContact.address.postalCode, addressCountry: 'US' },
        }).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteOrigin}/#website`,
          url: siteOrigin, name: 'Teams Management', inLanguage: 'en',
          publisher: { '@id': `${siteOrigin}/#organization` },
        }).replace(/</g, '\\u003c') }} />
        {beacon && /^[a-f0-9]{32}$/.test(beacon) && analyticsHost && <CloudflareBeacon token={beacon} host={analyticsHost}/>}
        {children}
      </body>
    </html>
  );
}

// Bindings are request-scoped; portfolio and authentication must not be prerendered.
export const dynamic = "force-dynamic";
