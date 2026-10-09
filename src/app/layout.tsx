import type { Metadata } from "next";
import "./globals.css";
import { contactAddress, siteContact } from '@/lib/site-contact';

export const metadata: Metadata = {
  title: "Teams Management - Property Portfolio",
  description: "Teams Management property portfolio in New York City",
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
      <body className="antialiased bg-white text-teams-ink">
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
