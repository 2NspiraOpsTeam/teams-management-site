import { notFound } from 'next/navigation';
import { enabled } from '@/lib/operations/database';
import { Overview } from '@/components/operations/Overview';
export const runtime='nodejs';
export default function Page(){if(!enabled())notFound();return <Overview/>;}
