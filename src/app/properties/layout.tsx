import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New York Properties | Teams Management',
  description: 'Explore Teams Management properties across Manhattan, the Bronx, and Flushing, with address-level details and ways to get in touch.',
};

export default function PropertiesLayout({ children }: { children: React.ReactNode }) { return children; }
