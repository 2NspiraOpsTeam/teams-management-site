import type { Metadata } from "next";
import "./globals.css";
import { contactAddress, siteContact } from '@/lib/site-contact';

export const metadata: Metadata = {
  title: "Teams Management | New York Residential & Retail Properties",
  description: "Explore Teams Management's residential and retail properties across Manhattan, the Bronx, and Queens. Find property information, rental guidance, and ways to connect with our team.",
  openGraph: {
    type: 'website',
    siteName: 'Teams Management',
    title: 'Teams Management | New York Residential & Retail Properties',
    description: 'Explore residential and retail properties across Manhattan, the Bronx, and Queens, plus rental guidance and ways to connect with Teams Management.',
  },
  twitter: {
    card: 'summary',
    title: 'Teams Management | New York Residential & Retail Properties',
    description: 'Explore residential and retail properties across Manhattan, the Bronx, and Queens with Teams Management.',
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
