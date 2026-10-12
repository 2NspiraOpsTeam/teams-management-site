import { notFound } from 'next/navigation';

export const runtime = 'edge';

// The non-submittable application remains in source but is not a public route.
export default function RentalApplicationPage() {
  notFound();
}
