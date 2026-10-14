import { redirect } from 'next/navigation';

export const runtime = 'edge';
export default function PreviousTermsRoute() {
  redirect('/terms-of-use');
}
