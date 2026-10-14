import type { Metadata } from "next";
import "./globals.css";
import { contactAddress, siteContact } from '@/lib/site-contact';

export const metadata: Metadata = {
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
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-teams-ink">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Teams Management',
          email: siteContact.email,
          telephone: siteContact.phone,
          faxNumber: siteContact.fax,
          address: { '@type': 'PostalAddress', streetAddress: siteContact.address.street, addressLocality: siteContact.address.city, addressRegion: siteContact.address.state, postalCode: siteContact.address.postalCode, addressCountry: 'US' },
        }).replace(/</g, '\\u003c') }} />
        {children}
      </body>
    </html>
  );
}
