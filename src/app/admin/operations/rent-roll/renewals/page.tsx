import {notFound} from 'next/navigation';
import {enabled} from '@/lib/operations/database';
import {RenewalWorklist} from '@/components/operations/RenewalWorklist';
export const runtime='nodejs';
export default function Page(){if(!enabled())notFound();return <RenewalWorklist/>;}
