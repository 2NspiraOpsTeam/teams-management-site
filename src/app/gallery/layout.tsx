import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Property Gallery | Teams Management',
  description: 'See approved property photography from the Teams Management New York portfolio and explore each address in more detail.',
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) { return children; }
