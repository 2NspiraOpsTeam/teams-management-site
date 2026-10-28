import { redirect } from 'next/navigation';

export const runtime = 'nodejs';
export default function PreviousTermsRoute() {
  redirect('/terms-of-use');
}
